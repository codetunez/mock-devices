import { Device, Property, Method } from '../interfaces/device';

import { SimulationStore } from '../store/simulationStore';

import { DigitalTwinClient } from 'azure-iot-digitaltwins-device';
import { Mqtt as M1, clientFromConnectionString } from 'azure-iot-device-mqtt';
import { Client } from 'azure-iot-device';
import { Message, SharedAccessSignature } from 'azure-iot-device';
import { ConnectionString } from 'azure-iot-common';

import { Mqtt as MqttDps } from 'azure-iot-provisioning-device-mqtt';
import { SymmetricKeySecurityClient } from 'azure-iot-security-symmetric-key';
import { ProvisioningDeviceClient } from 'azure-iot-provisioning-device';

import { ValueByIdPayload } from '../interfaces/payload';
import * as Utils from './utils';
import { MessageService } from '../interfaces/messageService';
import * as request from 'request';
import * as rw from 'random-words';
import * as Crypto from 'crypto';
import { DeviceStore } from '../store/deviceStore';

import { PnpInterface } from './pnpInterface';

const MSG_HUB = "HUB";
const MSG_DPS = "DPS";
const MSG_DEV = "DEV";
const MSG_DGT = "DGT";
const MSG_FNC = "FNC";

const MSG_RECV = 'RECV';
const MSG_SEND = 'SEND';
const MSG_PROC = 'PROC';
const MSG_METH = 'METH';
const MSG_C2D = '.C2D';
const MSG_TWIN = 'TWIN';
const MSG_MSG = '.MSG';

interface IoTHubDevice {
    client: any;
    digitalTwinClient: any;
}

interface Timers {
    timeRemain: number,
    originalTime: number
}

export class MockDevice {

    private CMD_REBOOT: string;
    private CMD_FIRMWARE: string;
    private CMD_SHUTDOWN: string;

    private FIRMWARE_LOOP: number;
    private CONNECT_POLL: number;
    private RESTART_LOOP: number;

    private CONNECT_RESTART: boolean = false;
    private useSasMode = true;
    private sasTokenExpiry = 0;

    private simulationStore = new SimulationStore();
    private ranges: any = {};
    private geo: any = {};

    // device is not mutable
    private connectionDPSTimer = null;
    private connectionTimer = null;
    private device: Device = null;
    private iotHubDevice: IoTHubDevice = null;

    private methodRLTimer = null;
    private methodReturnPayload = null;

    private twinRLTimer = null;
    private twinRLProps: Array<Property> = [];
    private twinRLPropsPlanValues: Array<Property> = [];
    private twinRLReportedTimers: Array<Timers> = [];
    private twinRLPayloadAdditions: ValueByIdPayload = <ValueByIdPayload>{};
    private twinDesiredPayloadRead = {};

    private msgRLTimer = null;
    private msgRLProps: Array<Property> = [];
    private msgRLPropsPlanValues: Array<Property> = [];
    private msgRLReportedTimers: Array<Timers> = [];
    private msgRLPayloadAdditions: ValueByIdPayload = <ValueByIdPayload>{};

    private twinRLMockSensorTimers = {};
    private msgRLMockSensorTimers = {};
    private running: boolean = false;

    private messageService: MessageService = null;

    private receivedMethodParams = {}

    private registrationConnectionString: string = null;

    private deviceStore: DeviceStore = null;

    private pnpInterfaces = {};
    private pnpInterfaceCache = {};

    private planModeLastEventTime = 0;

    private dpsRetires: number = 10;

    private nameIdResolvers = {
        desiredToId: {},
        methodToId: {},
        deviceCommsIndex: {}
    }

    constructor(device, messageService: MessageService, deviceStore: DeviceStore) {
        this.updateDevice(device);
        this.messageService = messageService;
        this.deviceStore = deviceStore;
        this.ranges = this.simulationStore.get()["ranges"];
        this.geo = this.simulationStore.get()["geo"];

        const simulation = this.simulationStore.get()["simulation"];
        const commands = this.simulationStore.get()["commands"];

        this.CMD_REBOOT = commands["reboot"];
        this.CMD_FIRMWARE = commands["firmware"];
        this.CMD_SHUTDOWN = commands["shutdown"];

        this.FIRMWARE_LOOP = simulation["firmware"];
        this.CONNECT_POLL = simulation["connect"];

        // v5 - Random restarts
        const { min, max } = simulation["restart"];

        this.RESTART_LOOP = (Utils.getRandomNumberBetweenRange(min, max, true) * 3600000);
        this.sasTokenExpiry = this.getSecondsFromHours(simulation["sasExpire"]);

        this.buildIndexes(device);

    }

    getRunning() {
        return this.running;
    }

    getSecondsFromHours(hours: number) {
        var raw = (Date.now() / 1000) + (3600 * hours)
        return Math.ceil(raw);
    }

    buildIndexes(device: Device) {
        // build indexes
        device.comms.forEach((comm, index) => {
            this.nameIdResolvers.deviceCommsIndex[comm._id] = index;
            if (comm._type === 'property' && comm.sdk === 'twin' && comm.type.direction === 'c2d') {
                this.nameIdResolvers.desiredToId[comm.name] = comm._id;
            }
            if (comm._type === 'method') {
                this.nameIdResolvers.methodToId[comm.name] = comm._id;
            }
        })
    }

    reconfigDeviceDynamically() {

        this.buildIndexes(this.device);

        this.pnpInterfaceCache = {};

        this.twinRLProps = [];
        this.twinRLPropsPlanValues = [];
        this.twinRLReportedTimers = [];
        this.twinRLMockSensorTimers = {};

        this.msgRLProps = [];
        this.msgRLPropsPlanValues = [];
        this.msgRLReportedTimers = [];
        this.msgRLMockSensorTimers = {};

        // for PM we are only interested in the list. the rest has been defined in IM mode
        if (this.device.configuration.planMode) {

            const config = this.simulationStore.get()["plan"];

            this.device.plan.startup.forEach((item) => {
                const comm = this.device.comms[this.nameIdResolvers.deviceCommsIndex[item.property]];
                if (comm.sdk === "twin") {
                    this.twinRLProps.push(comm);
                    this.twinRLPropsPlanValues.push(item.value);
                    this.twinRLReportedTimers.push({ timeRemain: config["startDelay"], originalTime: config["startDelay"] });
                } else if (comm.sdk === "msg") {
                    this.msgRLProps.push(comm);
                    this.msgRLPropsPlanValues.push(item.value);
                    this.twinRLReportedTimers.push({ timeRemain: config["startDelay"], originalTime: config["startDelay"] });
                }
            })

            this.device.plan.timeline.forEach((item) => {
                // find the last event
                this.planModeLastEventTime = (item.time * 1000) + config["timelineDelay"];
                const comm = this.device.comms[this.nameIdResolvers.deviceCommsIndex[item.property]];
                if (comm.sdk === "twin") {
                    this.twinRLProps.push(comm);
                    this.twinRLPropsPlanValues.push(item.value);
                    this.twinRLReportedTimers.push({ timeRemain: this.planModeLastEventTime, originalTime: this.planModeLastEventTime });
                } else if (comm.sdk === "msg") {
                    this.msgRLProps.push(comm);
                    this.msgRLPropsPlanValues.push(item.value);
                    this.msgRLReportedTimers.push({ timeRemain: this.planModeLastEventTime, originalTime: this.planModeLastEventTime });
                }
            })

            return;
        }

        this.msgRLProps = [];
        this.msgRLReportedTimers = [];
        this.msgRLMockSensorTimers = {};

        for (let i = 0; i < this.device.comms.length; i++) {
            const comm = this.device.comms[i];
            const name = comm.interface.name.replace(/\s/g, '');

            // setup the interfaces. this can be changed dyanmically
            if (!this.pnpInterfaceCache[name]) { this.pnpInterfaceCache[name] = new PnpInterface(name, comm.interface.urn, this.pnpPropertyUpdateHandler, this.pnpCommandHandler) }

            if (comm.sdk === 'msg') {
                this.pnpInterfaceCache[name].add(comm.name, 'telemetry');
            } else if (comm.sdk === 'twin' && comm.type.direction === 'd2c') {
                this.pnpInterfaceCache[name].add(comm.name, 'property');
            } else if (comm.sdk === 'twin' && comm.type.direction === 'c2d') {
                this.pnpInterfaceCache[name].add(comm.name, 'property', true);
            } else if (comm._type === 'method') {
                this.pnpInterfaceCache[name].add(comm.name, 'command');
            }
            this.pnpInterfaces[comm._id] = name;

            // only twin/msg require the runloop. methods are always on and not part of the runloop
            if (this.device.comms[i]._type != "property") { continue; }

            // set up runloop reporting
            if (comm.runloop && comm.runloop.include === true) {
                let ms = comm.runloop.value * (comm.runloop.unit === "secs" ? 1000 : 60000);

                let mockSensorTimerObject = null;

                if (comm.mock) {

                    let slice = 0;
                    let startValue = 0;
                    if (comm.mock._type != 'function') {
                        // if the sensor is a "active" sensor then us the running expected as the start value
                        startValue = comm.mock.running && comm.mock.running > 0 ? comm.mock.running : comm.mock.init;
                    } else {
                        startValue = comm.mock.init
                        // this is a little bit of a hack to wire a function
                        comm.mock.timeToRunning = 1;
                    }

                    slice = startValue / (comm.mock.timeToRunning / 1000);
                    mockSensorTimerObject = { sliceMs: slice, remainingMs: comm.mock.timeToRunning };
                    comm.mock._value = comm.mock.init;
                }

                if (comm.sdk === "twin") {
                    this.twinRLProps.push(comm);
                    this.twinRLReportedTimers.push({ timeRemain: ms, originalTime: ms });
                    if (mockSensorTimerObject != null) { this.twinRLMockSensorTimers[comm._id] = mockSensorTimerObject; }
                }

                if (comm.sdk === "msg") {
                    this.msgRLProps.push(comm);
                    this.msgRLReportedTimers.push({ timeRemain: ms, originalTime: ms });
                    if (mockSensorTimerObject != null) { this.msgRLMockSensorTimers[comm._id] = mockSensorTimerObject; }
                }
            }
        }
    }

    updateDevice(device: Device) {
        if (this.device != null && this.device.configuration.connectionString != device.configuration.connectionString) {
            this.log('DEVICE UPDATE ERROR. CONNECTION STRING HAS CHANGED. DELETE DEVICE', MSG_DEV, MSG_PROC);
        } else {
            this.device = JSON.parse(JSON.stringify(device));
            this.reconfigDeviceDynamically();
        }
    }

    // is this safe?
    updateTwin(payload: ValueByIdPayload) {
        this.twinRLPayloadAdditions = payload;
    }

    readTwin() {
        return this.twinDesiredPayloadRead;
    }

    readMethodParams() {
        return this.receivedMethodParams;
    }

    updateMsg(payload: ValueByIdPayload) {
        this.msgRLPayloadAdditions = payload;
    }

    processMockDevicesCMD(name: string) {

        const methodName = name.toLocaleLowerCase();

        if (methodName === this.CMD_SHUTDOWN) {
            this.log('DEVICE METHOD SHUTDOWN ... STOPPING IMMEDIATELY', MSG_HUB, MSG_PROC);
            this.deviceStore.stopDevice(this.device);
            return;
        }

        if (methodName === this.CMD_REBOOT) {
            this.log('DEVICE METHOD REBOOT ... RESTARTING IMMEDIATELY', MSG_HUB, MSG_PROC);
            this.deviceStore.stopDevice(this.device);
            this.deviceStore.startDevice(this.device);
            this.reconfigDeviceDynamically();
            return;
        }

        if (methodName === this.CMD_FIRMWARE) {
            this.log(`DEVICE METHOD FIRMWARE ... RESTARTING IN ${this.FIRMWARE_LOOP / 1000} SECONDS`, MSG_HUB, MSG_PROC);
            this.deviceStore.stopDevice(this.device);
            setTimeout(() => {
                this.deviceStore.startDevice(this.device);
                this.reconfigDeviceDynamically();
            }, this.FIRMWARE_LOOP)
        }
    }

    /// starts a device
    start() {
        if (this.device.configuration._kind === 'template') { return; }
        if (this.running) { return; }

        this.log('DEVICE IS SWITCHED ON', MSG_DPS, MSG_PROC);
        this.running = true;

        if (this.device.configuration._kind === 'dps') {
            const simulation = this.simulationStore.get()["simulation"];
            this.dpsRetires = simulation["dpsRetries"] || 10;
            this.registrationConnectionString = null;

            this.connectionDPSTimer = setInterval(() => {
                if (this.registrationConnectionString != null && this.registrationConnectionString != 'init') {
                    clearInterval(this.connectionDPSTimer);
                    this.connectLoop(this.registrationConnectionString);
                    return;
                }

                if (this.dpsRetires === 0) {
                    clearInterval(this.connectionDPSTimer);
                    this.end();
                    return;
                }

                this.log('ATTEMPTING DEVICE REGISTRATION', MSG_DPS, MSG_PROC);
                this.dpsRegistration();
            }, this.CONNECT_POLL);
        }
        else {
            this.connectLoop(this.device.configuration.connectionString);
        }
    }

    connectLoop(connectionString?: string) {
        this.log('IOT HUB CLIENT CONNECT LOOP START', MSG_HUB, MSG_PROC);
        this.connectClient(connectionString);
        this.mainLoop();
        this.connectionTimer = setInterval(() => {
            this.log('IOT HUB CLIENT READY', MSG_HUB, MSG_PROC);
            this.CONNECT_RESTART = true;
            this.cleanUp();
            this.connectClient(connectionString);
            this.mainLoop();
        }, this.RESTART_LOOP)
    }

    end() {
        if (!this.running) { return; }

        this.dpsRetires = 0;
        this.log('DEVICE IS SWITCHED OFF', MSG_HUB, MSG_PROC);
        clearInterval(this.connectionTimer);
        this.cleanUp();
    }

    mainLoop() {
        if (!this.running) { return; }

        if (this.device.configuration.pnpSdk) {
            this.pnpMainLoop();
        } else {
            this.legacyMainLoop();
        }
    }

    async pnpMainLoop() {
        try {
            this.log('IOT HUB CLIENT CONNECTED VIA DIGITALTWIN SDK', MSG_DGT, MSG_PROC);

            if (this.device.configuration.planMode) {
                this.log('PLAN MODE CURRENTLY NOT SUPPORTED FOR DIGITALTWIN SDK', MSG_DGT, MSG_PROC);
                return;
            }

            // reported properties are cleared every runloop cycle
            this.twinRLTimer = setInterval(() => {

                let payload: ValueByIdPayload = <ValueByIdPayload>this.calcPropertyValues(this.twinRLProps, this.twinRLReportedTimers, this.twinRLMockSensorTimers, this.twinRLPropsPlanValues);
                this.messageService.sendAsLiveUpdate(payload);
                this.runloopTwin(this.twinRLPayloadAdditions, payload);
                this.twinRLPayloadAdditions = <ValueByIdPayload>{};
            }, 1000);

            this.msgRLTimer = setInterval(() => {

                let payload: ValueByIdPayload = <ValueByIdPayload>this.calcPropertyValues(this.msgRLProps, this.msgRLReportedTimers, this.msgRLMockSensorTimers, this.msgRLPropsPlanValues);
                this.messageService.sendAsLiveUpdate(payload);

                this.runloopMsg(this.msgRLPayloadAdditions, payload);
                this.msgRLPayloadAdditions = <ValueByIdPayload>{};
            }, 1000);

        } catch (err) {
            this.log(`DIGITALTWIN SDK OPEN ERROR: ${err.message}`, MSG_DGT, MSG_PROC);
        }
    }

    legacyMainLoop() {
        try {
            this.iotHubDevice.client.open(() => {
                this.registerDirectMethods();
                this.regsisterC2D();

                this.log('IOT HUB CLIENT CONNECTED VIA CURRENT SDK', MSG_HUB, MSG_PROC);
                this.log(this.device.configuration.planMode ? 'PLAN MODE' : 'INTERACTIVE MODE', MSG_HUB, MSG_PROC);

                this.iotHubDevice.client.getTwin((err, twin) => {

                    // desired properties are cached
                    twin.on('properties.desired', ((delta) => {
                        if (!this.CONNECT_RESTART) { Object.assign(this.twinDesiredPayloadRead, delta); }
                        this.log(JSON.stringify(delta), MSG_HUB, MSG_TWIN, MSG_RECV);
                        this.CONNECT_RESTART = false;

                        // this deals with a full twin or a single desired
                        if (this.device.configuration.planMode) {
                            for (let name in delta) {
                                this.sendPlanResponse(this.nameIdResolvers.desiredToId, name);
                            }
                        }
                    }))

                    // this loop is a poller to check a payload the will be used to send the method response 
                    // as a reported property with the same name. once it processes the payload it clears it.
                    this.methodRLTimer = setInterval(() => {
                        if (this.methodReturnPayload != null) {
                            twin.properties.reported.update(this.methodReturnPayload, ((err) => {
                                this.log(err ? err.toString() : JSON.stringify(this.methodReturnPayload), MSG_HUB, MSG_TWIN, MSG_SEND);
                                this.methodReturnPayload = null;
                            }))
                        }
                    }, 500);

                    // reported properties are cleared every runloop cycle
                    this.twinRLTimer = setInterval(() => {
                        let payload: ValueByIdPayload = <ValueByIdPayload>this.calcPropertyValues(this.twinRLProps, this.twinRLReportedTimers, this.twinRLMockSensorTimers, this.twinRLPropsPlanValues);
                        this.messageService.sendAsLiveUpdate(payload);
                        this.runloopTwin(this.twinRLPayloadAdditions, payload, twin);
                        this.twinRLPayloadAdditions = <ValueByIdPayload>{};
                    }, 1000);
                })

                this.msgRLTimer = setInterval(() => {
                    let payload: ValueByIdPayload = null;
                    payload = <ValueByIdPayload>this.calcPropertyValues(this.msgRLProps, this.msgRLReportedTimers, this.msgRLMockSensorTimers, this.msgRLPropsPlanValues);
                    this.messageService.sendAsLiveUpdate(payload);
                    this.runloopMsg(this.msgRLPayloadAdditions, payload);
                    this.msgRLPayloadAdditions = <ValueByIdPayload>{};
                }, 1000);

            })
        }
        catch (err) {
            this.log(`CURRENT SDK OPEN ERROR: ${err.message}`, MSG_HUB, MSG_PROC);
        }
    }

    sendPlanResponse(index, name) {
        const propertyId = index[name];
        const property = this.device.plan.receive.find((prop) => { return prop.propertyIn === propertyId });
        if (property) {
            const sdk = this.device.comms[this.nameIdResolvers.deviceCommsIndex[propertyId]].sdk;
            const payload = <ValueByIdPayload>{ [property.propertyOut]: property.value }
            if (sdk === 'twin') { this.updateTwin(payload); } else { this.updateMsg(payload); }
        }
    }

    regsisterC2D() {
        this.iotHubDevice.client.on('message', (msg) => {
            if (msg && msg.data) {
                try {
                    const json = JSON.parse(msg.data.toString('utf8').replace(/\'/g, '"'));

                    const cloudMethod = json.methodName || '';
                    const cloudMethodPayload = json.payload || {};
                    const connectTimeoutInSeconds = json.connectTimeoutInSeconds || 30;
                    const responseTimeoutInSeconds = json.responseTimeoutInSeconds || 30;

                    //TODO: make this performant!
                    for (let i = 0; i < this.device.comms.length; i++) {
                        let comm: any = this.device.comms[i];

                        if (comm.name === cloudMethod && comm._type === "method" && comm.execution === 'cloud') {
                            this.log(cloudMethod + " " + JSON.stringify(cloudMethodPayload), MSG_HUB, MSG_C2D, MSG_RECV);

                            let m: Method = comm;
                            Object.assign(this.receivedMethodParams, { [m._id]: { date: new Date().toUTCString(), payload: JSON.stringify(cloudMethodPayload) } });

                            if (this.device.configuration.planMode) {
                                this.sendPlanResponse(this.nameIdResolvers.methodToId, m.name);
                            } else if (!this.device.configuration.planMode && m.asProperty) {
                                this.methodReturnPayload = Object.assign({}, { [m.name]: m.payload })
                            }

                            this.processMockDevicesCMD(m.name);
                        }
                    }
                } catch (err) {
                    this.log(err.toString(), MSG_HUB, MSG_C2D, MSG_SEND);
                }
            }

            this.iotHubDevice.client.complete(msg, (err) => {
                this.log(`[C2D COMPLETE] ${err ? err.toString() : msg.data.toString('utf8')}`, MSG_HUB, MSG_PROC);
            });
        });
    }

    registerDirectMethods() {
        // this block needs a refactor
        for (let i = 0; i < this.device.comms.length; i++) {
            let comm: any = this.device.comms[i];
            if (comm._type === "method" && comm.execution === 'direct') {

                let m: Method = comm;
                let payload = m.asProperty ? { result: m.payload } : JSON.parse(m.payload);

                this.iotHubDevice.client.onDeviceMethod(m.name, (request, response) => {
                    this.log(request.methodName + " " + JSON.stringify(request.payload), MSG_HUB, MSG_METH, MSG_RECV);
                    Object.assign(this.receivedMethodParams, { [m._id]: { date: new Date().toUTCString(), payload: JSON.stringify(request.payload) } });

                    // this response is the payload of the device
                    response.send((m.status), payload, (err) => {
                        if (this.device.configuration.planMode) {
                            this.sendPlanResponse(this.nameIdResolvers.methodToId, m.name);
                        } else if (!this.device.configuration.planMode && m.asProperty) {
                            this.methodReturnPayload = Object.assign({}, { [m.name]: JSON.parse(m.payload) })
                        }

                        this.log(err ? err.toString() : `[DIRECT METHOD RESPONSE PAYLOAD] ${payload.result}`, MSG_HUB, MSG_METH, MSG_SEND);
                        this.messageService.sendAsLiveUpdate({ [m._id]: new Date().toUTCString() });
                        this.processMockDevicesCMD(m.name);
                    })
                });
            }
        }
    }

    cleanUp() {
        clearInterval(this.twinRLTimer);
        clearInterval(this.msgRLTimer);
        clearInterval(this.methodRLTimer);

        try {
            if (this.iotHubDevice.client) {
                this.iotHubDevice.client.removeAllListeners();
                this.iotHubDevice.client.close();
                this.iotHubDevice.client = null;
            }
        } catch (err) {
            this.log(`TEAR DOWN OPEN ERROR: ${err.message}`, MSG_HUB, MSG_PROC);
        } finally {
            this.running = false;
        }
    }

    async connectClient(connectionString) {
        this.iotHubDevice = { client: undefined, digitalTwinClient: undefined };

        if (this.useSasMode) {
            const cn = ConnectionString.parse(connectionString);

            let sas: any = SharedAccessSignature.create(cn.HostName, cn.DeviceId, cn.SharedAccessKey, this.sasTokenExpiry);
            this.iotHubDevice.client = Client.fromSharedAccessSignature(sas, M1);

            if (this.device.configuration.pnpSdk) {
                this.iotHubDevice.digitalTwinClient = new DigitalTwinClient(this.device.configuration.capabilityUrn, this.iotHubDevice.client);
                for (const i in this.pnpInterfaceCache) {
                    this.log('REGISTERING DEVICE INTERFACE', MSG_DGT, MSG_PROC);
                    this.iotHubDevice.digitalTwinClient.addComponents(this.pnpInterfaceCache[i]);
                }

                await this.iotHubDevice.digitalTwinClient.enableCommands();
                await this.iotHubDevice.digitalTwinClient.enablePropertyUpdates();

            }
            const trueHours = Math.ceil((this.sasTokenExpiry - Math.round(Date.now() / 1000)) / 3600);
            this.log(`CONNECTING VIA SAS. TOKEN EXPIRES AFTER ${trueHours} HOURS`, MSG_HUB, MSG_PROC);
        } else {
            // get a connection string from the RP in the Portal            
            this.iotHubDevice.client = clientFromConnectionString(connectionString);
            this.log(`CONNECTING VIA CONN STRING`, MSG_HUB, MSG_PROC);
        }
        this.log(`DEVICE AUTO RESTARTS EVERY ${this.RESTART_LOOP / 60000} MINUTES`, MSG_HUB, MSG_PROC);
    }

    dpsRegistration() {

        if (this.registrationConnectionString === 'init') { return; }
        if (this.dpsRetires === 0) { return; }

        let config = this.device.configuration;
        this.iotHubDevice = { client: undefined, digitalTwinClient: undefined };
        this.registrationConnectionString = 'init';

        let transformedSasKey = config.isMasterKey ? this.computeDrivedSymmetricKey(config.sasKey, config.deviceId) : config.sasKey;
        let dpsPayload = config.dpsPayload && Object.keys(config.dpsPayload).length > 0 ? JSON.parse(config.dpsPayload) : {};
        let provisioningSecurityClient = new SymmetricKeySecurityClient(config.deviceId, transformedSasKey);
        let provisioningClient = ProvisioningDeviceClient.create('global.azure-devices-provisioning.net', config.scopeId, new MqttDps(), provisioningSecurityClient);

        provisioningClient.setProvisioningPayload(dpsPayload);
        this.log('WAITING FOR REGISTRATION', MSG_DPS, MSG_PROC);
        provisioningClient.register((err: any, result) => {
            if (err) {
                let msg = err.result && err.result.registrationState && err.result.registrationState.errorMessage || err;
                this.log(`REGISTRATION ERROR ${this.dpsRetires}: ${err}`, MSG_DPS, MSG_PROC);
                this.registrationConnectionString = null;
                this.dpsRetires--;
                return;
            }
            this.registrationConnectionString = 'HostName=' + result.assignedHub + ';DeviceId=' + result.deviceId + ';SharedAccessKey=' + transformedSasKey;
            this.log('DEVICE REGISTRATION SUCCESS', MSG_DPS, MSG_PROC);
        })
    }

    // creates the HMAC key
    computeDrivedSymmetricKey(masterKey, regId) {
        return Crypto.createHmac('SHA256', Buffer.from(masterKey, 'base64'))
            .update(regId, 'utf8')
            .digest('base64');
    }

    /// runs the device
    async runloopTwin(additions: ValueByIdPayload, payload: any, twin?: any) {

        if (payload != null) {
            Object.assign(payload, additions);

            if (Object.keys(payload).length > 0) {
                if (this.device.configuration.pnpSdk) {
                    let wire = this.transformPayload(payload).pnp;
                    for (const data of wire) {
                        try {
                            const twin = { [data.name]: data.value };
                            await this.iotHubDevice.digitalTwinClient.report(this.pnpInterfaceCache[this.pnpInterfaces[data.id]], twin);
                            this.log(`[INTERFACE:${this.pnpInterfaceCache[this.pnpInterfaces[data.id]].componentName}] ${JSON.stringify(twin)}`, MSG_HUB, MSG_TWIN, MSG_SEND);
                            this.messageService.sendAsLiveUpdate(payload);
                        } catch (err) {
                            this.log(`[INTERFACE:${this.pnpInterfaceCache[this.pnpInterfaces[data.id]].componentName}] ${err.toString()}`, MSG_HUB, MSG_TWIN, MSG_SEND);
                        }
                    }
                } else {
                    let wire = this.transformPayload(payload).legacy;
                    twin.properties.reported.update(wire, ((err) => {
                        this.log(JSON.stringify(wire), MSG_HUB, MSG_TWIN, MSG_SEND);
                        this.messageService.sendAsLiveUpdate(payload);
                    }))
                }
            }
        }
    }

    /// runs the device
    async runloopMsg(additions: ValueByIdPayload, payload) {

        if (payload != null) {
            Object.assign(payload, additions);

            if (Object.keys(payload).length > 0) {
                if (this.device.configuration.pnpSdk) {
                    let wire = this.transformPayload(payload).pnp;
                    for (const data of wire) {
                        try {
                            const msg = { [data.name]: data.value };
                            await this.iotHubDevice.digitalTwinClient.sendTelemetry(this.pnpInterfaceCache[this.pnpInterfaces[data.id]], msg);
                            this.log(`[INTERFACE:${this.pnpInterfaceCache[this.pnpInterfaces[data.id]].componentName}] ${JSON.stringify(msg)}`, MSG_HUB, MSG_MSG, MSG_SEND);
                            this.messageService.sendAsLiveUpdate(payload);
                        } catch (err) {
                            this.log(`[INTERFACE:${this.pnpInterfaceCache[this.pnpInterfaces[data.id]].componentName}] ${err.toString()}`, MSG_HUB, MSG_MSG, MSG_SEND);
                        }
                    }
                } else {
                    let wire = this.transformPayload(payload).legacy;
                    let msg = new Message(JSON.stringify(wire));
                    this.iotHubDevice.client.sendEvent(msg, ((err) => {
                        this.log(JSON.stringify(wire), MSG_HUB, MSG_MSG, MSG_SEND);
                        this.messageService.sendAsLiveUpdate(payload);
                    }))
                }
            }
        }
    }

    calcPropertyValues(runloopProperties: any, runloopTimers: any, propertySensorTimers: any, runloopPropertiesValues: any) {
        if (this.iotHubDevice === null || this.iotHubDevice.client === null) {
            clearInterval(this.msgRLTimer);
            return null;
        }

        // first get all the values to report
        let payload = {};
        for (let i = 0; i < runloopProperties.length; i++) {

            // this is a paired structure
            let p: Property = runloopProperties[i];
            let { timeRemain, originalTime } = runloopTimers[i]
            let possibleResetTime = runloopTimers[runloopTimers.length - 1].timeRemain + originalTime;
            let res = this.processCountdown(p, timeRemain, possibleResetTime);
            runloopTimers[i] = { 'timeRemain': res.timeRemain, originalTime };

            this.updateSensorValue(p, propertySensorTimers, res.process);
            // for plan mode we send regardless of enabled or not
            if (res.process && (this.device.configuration.planMode || p.enabled)) {
                let o: ValueByIdPayload = <ValueByIdPayload>{};
                o[p._id] = this.device.configuration.planMode ? Utils.formatValue(p.string, runloopPropertiesValues[i]) : (p.mock ? p.mock._value : Utils.formatValue(p.string, p.value));
                Object.assign(payload, o);
            }
        }
        return payload;
    }

    async updateSensorValue(p: Property, propertySensorTimers: any, process: boolean) {

        // sensors are not supported in plan mode yet
        if (p.mock === undefined) { return; }

        let slice = 0;
        let randomFromRange = Utils.getRandomNumberBetweenRange(1, 10, false);

        // this block deals with calculating the slice val to apply to the current sensor value
        if (propertySensorTimers[p._id]) {
            slice = propertySensorTimers[p._id].sliceMs;
            let sliceRemaining = propertySensorTimers[p._id].remainingMs - 1000;

            if (sliceRemaining > 0) {
                propertySensorTimers[p._id].remaining = sliceRemaining;
            } else {
                delete propertySensorTimers[p._id];
            }
        } else {
            slice = p.mock._value;
        }

        /* very simple calculations on line to give them some realistic behavior */

        if (p.mock._type === "fan") {
            var variance = p.mock.variance / p.mock.running * 100;
            p.mock._value = randomFromRange >= 5 ? p.mock.running - variance : p.mock.running + variance;
        }

        if (p.mock._type === "hotplate") {
            var newCurrent = p.mock._value + (slice - (slice * p.mock.variance));
            p.mock._value = newCurrent <= p.mock.running ? newCurrent : p.mock.running;
        }

        if (p.mock._type === "battery") {
            var newCurrent = p.mock._value - (slice + (slice * p.mock.variance));
            p.mock._value = newCurrent > p.mock.running ? newCurrent : p.mock.running;
        }

        if (p.mock._type === "random") {
            p.mock._value = Math.floor(Math.random() * Math.floor(Math.pow(10, p.mock.variance) + 1));
        }

        if (p.mock._type === "function" && process) {
            const res: any = await this.getFunctionPost(p.mock.function, p.mock._value);
            p.mock._value = res;
        }
    }

    getFunctionPost(url: string, value: any) {
        return new Promise((resolve, reject) => {
            try {
                request.post({
                    headers: { 'content-type': 'application/json' },
                    url: url,
                    body: JSON.stringify({ "value": value })
                }, (err, response, body) => {
                    if (err) {
                        this.log(`FUNCTION ERROR: ${err.toString()}`, MSG_FNC, '', MSG_SEND);
                        reject(err);
                    }
                    else {
                        let payload = JSON.parse(body);
                        resolve(payload.value ? parseFloat(payload.value) : payload.body);
                    }
                });
            }
            catch (err) {
                this.log(`FUNCTION FAILED: ${err.toString()}`, MSG_FNC, '', MSG_SEND);
                reject(err);
            }
        })
    }

    processCountdown(p: Property, timeRemain, originalPlanTime) {

        let res: any = {};

        // countdown and go to next property
        if (timeRemain != 0) {
            timeRemain = timeRemain - 1000;
            res.process = false;
        }

        // reset and process
        if (timeRemain === 0) {
            if (this.device.configuration.planMode) {
                timeRemain = this.device.plan.loop ? originalPlanTime : -1;
            } else {
                let mul = p.runloop.unit === "secs" ? 1000 : 60000
                timeRemain = p.runloop.value * mul;
            }
            res.process = true;
        }

        res.timeRemain = timeRemain;
        return res;
    }

    transformPayload(payload: any) {
        // this converts an id based json array to a name based array
        // if the name is duped then last one wins. this is ok for now
        // but a better solution is required.
        let remap = { pnp: [], legacy: {} };
        for (let i = 0; i < this.device.comms.length; i++) {
            if (this.device.comms[i]._type != "property") { continue; }

            let p: Property = this.device.comms[i];
            if (payload[p._id] != undefined) {
                if (p.propertyObject) {
                    var val = p.string ? "\"" + payload[p._id] + "\"" : payload[p._id];
                    switch (p.propertyObject.type) {
                        case 'templated':
                            try {
                                var replacement = p.propertyObject.template.replace(new RegExp(/\"AUTO_VALUE\"/, 'g'), val);
                                var object = JSON.parse(replacement);
                                this.resolveRandom(object)
                                remap.legacy[p.name] = object;
                                remap.pnp.push({ id: p._id, name: p.name, value: object })
                            } catch (ex) {
                                remap.legacy[p.name] = "ERR - transformPayload: " + ex;
                                remap.pnp.push({ id: p._id, name: p.name, value: object })
                            }
                            break;
                        default:
                            remap.legacy[p.name] = this.resolveAuto(payload[p._id]);
                            remap.pnp.push({ id: p._id, name: p.name, value: this.resolveAuto(payload[p._id]) })
                            break;
                    }
                } else {
                    remap.legacy[p.name] = this.resolveAuto(payload[p._id]);
                    remap.pnp.push({ id: p._id, name: p.name, value: this.resolveAuto(payload[p._id]) })
                }
            }
        }
        return remap;
    }

    resolveAuto(macro: string) {
        if (macro === "AUTO_STRING") {
            return rw();
        } else if (macro === "AUTO_BOOLEAN") {
            return Utils.getRandomValue("boolean");
        } else if (macro === "AUTO_INTEGER" || macro === "AUTO_LONG") {
            return Utils.getRandomValue("integer", this.ranges["AUTO_INTEGER"]["min"], this.ranges["AUTO_INTEGER"]["max"]);
        } else if (macro === "AUTO_DOUBLE" || (macro === "AUTO_FLOAT")) {
            return Utils.getRandomValue("double", this.ranges["AUTO_DOUBLE"]["min"], this.ranges["AUTO_DOUBLE"]["max"]);
        } else if (macro === "AUTO_DATE") {
            return Utils.getRandomValue("date")
        } else if (macro === "AUTO_DATETIME") {
            return Utils.getRandomValue("dateTime")
        } else if (macro === "AUTO_TIME" || macro === "AUTO_DURATION") {
            return Utils.getRandomValue("time")
        } else if (macro === "AUTO_GEOPOINT") {
            return Utils.getRandomGeo(this.geo["latitude"], this.geo["longitude"], this.geo["altitude"], this.geo["radius"])
        } else if (macro === "AUTO_VECTOR") {
            return Utils.getRandomVector(this.ranges["AUTO_VECTOR"]["min"], this.ranges["AUTO_VECTOR"]["max"]);
        } else if (macro === "AUTO_MAP") {
            return Utils.getRandomMap()
        } else if (macro && macro.toString().startsWith("AUTO_ENUM")) {
            let parts = macro.split('/');
            if (parts.length === 2 && parts[0] === "AUTO_ENUM") {
                let arr = JSON.parse(parts[1]);
                const index = Utils.getRandomNumberBetweenRange(0, arr.length, true)
                return arr[index];
            }
        }
        return macro;
    }

    resolveRandom(node: any) {
        for (let key in node) {
            if (typeof node[key] == 'object') {
                this.resolveRandom(node[key])
            } else {
                node[key] = this.resolveAuto(node[key]);
            }
        }
    }

    log(message, type, operation, direction?) {
        let msg = `[${new Date().toISOString()}][${type}][${operation}][${this.device._id}]`;
        if (direction) { msg += `[${direction}]` }
        this.messageService.sendConsoleUpdate(`${msg} ${message}`)
    }

    // handler - PoC
    pnpPropertyUpdateHandler(interfaceInstance, propertyName, reportedValue, desiredValue, version) {
        console.log('Received an update for ' + propertyName + ': ' + JSON.stringify(desiredValue));
        interfaceInstance[propertyName].report(desiredValue, {
            code: 200,
            description: 'helpful descriptive text',
            version: version
        })
            .then(() => console.log('updated the property'))
            .catch(() => console.log('failed to update the property'));
    };

    // handler - PoC
    pnpCommandHandler(request, response) {
        console.log('received command: ' + request.commandName + ' for interfaceInstance: ' + request.interfaceInstanceName);
        response.acknowledge(200, 'helpful response text')
            .then(() => console.log('acknowledgement succeeded.'))
            .catch(() => console.log('acknowledgement failed'));
    }
} 