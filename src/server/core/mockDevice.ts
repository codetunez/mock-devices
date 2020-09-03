import { GLOBAL_CONTEXT } from '../config';
import { Device, Property, Method } from '../interfaces/device';

import { SimulationStore } from '../store/simulationStore';

import { Mqtt as M1, clientFromConnectionString } from 'azure-iot-device-mqtt';
import { Client, ModuleClient } from 'azure-iot-device';
import { Message, SharedAccessSignature } from 'azure-iot-device';
import { ConnectionString } from 'azure-iot-common';

var Protocol = require('azure-iot-device-mqtt').Mqtt;

import { Mqtt as MqttDps } from 'azure-iot-provisioning-device-mqtt';
import { SymmetricKeySecurityClient } from 'azure-iot-security-symmetric-key';
import { ProvisioningDeviceClient } from 'azure-iot-provisioning-device';

import { ValueByIdPayload, DesiredPayload } from '../interfaces/payload';
import * as Utils from './utils';
import * as request from 'request';
import * as rw from 'random-words';
import * as Crypto from 'crypto';
import * as _ from 'lodash';

function ignoreKind(kind) {
    return kind === 'template' || kind === 'edge';
}

const LOGGING_TAGS = {
    CTRL: {
        HUB: 'HUB',
        DPS: 'DPS',
        DEV: 'DEV',
        DGT: 'DGT',
        EDG: 'EDG',
        MOD: 'MOD'
    },
    DATA: {
        FNC: 'FNC',
        RECV: 'RECV',
        SEND: 'SEND',
        METH: 'METH',
        C2D: 'C2D',
    },
    LOG: {
        OPS: 'PROC',
        EV: {
            ON: 'ON',
            OFF: 'OFF',
            INIT: 'INIT',
            SUCCESS: 'SUCCESS',
            CONNECTED: 'CONNECTED',
            TRYING: 'TRYING',
            ERROR: 'ERROR',
            DELAY: 'DELAY'
        },
    },
    MSG: {
        TWIN: 'TWIN',
        MSG: 'MSG'
    },
    STAT: {
        MSG: {
            FIRST: 'MSG_FIRST',
            LAST: 'MSG_LAST',
            COUNT: 'MSG_COUNT',
            RATE: 'MSG_RATE'
        },
        TWIN: {
            FIRST: 'TWIN_FIRST',
            LAST: 'TWIN_LAST',
            COUNT: 'TWIN_COUNT',
            RATE: 'TWIN_RATE'
        },
        ON: 'ON',
        OFF: 'OFF',
        CONNECTS: 'CONNECTS',
        COMMANDS: 'COMMANDS',
        DESIRED: 'DESIRED',
        RESTART: 'RESTART',
        ERRORS: 'ERRORS',
        DPS: 'DPS',
        RECONFIGURES: 'RECONFIGURES',
    }
}

interface IoTHubDevice {
    client: any;
}

interface Timers {
    timeRemain: number,
    originalTime: number
}

interface Stats {
    ON: number,
    OFF: number,
    MSG_FIRST: string
    MSG_LAST: string,
    MSG_COUNT: number,
    MSG_RATE: number,
    TWIN_FIRST: string
    TWIN_LAST: string,
    TWIN_COUNT: number,
    TWIN_RATE: number,
    CONNECTS: number,
    COMMANDS: number,
    DESIRED: number,
    RESTART: number,
    ERRORS: number,
    RECONFIGURES: number,
    DPS: number
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
    private iotHubDevice: IoTHubDevice = { client: undefined };
    private methodRLTimer = null;
    private methodReturnPayload = null;
    private receivedMethodParams = {}

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

    private desiredMergedCache = {};
    private desiredOverrides: DesiredPayload = <DesiredPayload>{};

    private twinRLMockSensorTimers = {};
    private msgRLMockSensorTimers = {};
    private running: boolean = false;

    private messageService = null;

    private registrationConnectionString: string = null;

    private planModeLastEventTime = 0;

    private dpsRetires: number = 10;

    private delayStartTimer = null;

    private resolversCollection = {
        desiredToId: {},
        desiredToIndex: {},
        methodToId: {},
        deviceCommsIndex: {},
        c2dIndex: {},
        directMethodIndex: {}
    }

    private stats: Stats;

    constructor(device: Device, messageService) {
        if (ignoreKind(device.configuration._kind)) { return; }
        this.messageService = messageService;
        this.initialize(device);
    }

    getRunning() {
        return this.running;
    }

    getSecondsFromHours(hours: number) {
        var raw = (Date.now() / 1000) + (3600 * hours)
        return Math.ceil(raw);
    }


    initialize(device) {
        this.ranges = this.simulationStore.get()['ranges'];
        this.geo = this.simulationStore.get()['geo'];

        const commands = this.simulationStore.get()['commands'];
        this.CMD_REBOOT = commands['reboot'];
        this.CMD_FIRMWARE = commands['firmware'];
        this.CMD_SHUTDOWN = commands['shutdown'];

        const simulation = this.simulationStore.get()['simulation'];
        this.FIRMWARE_LOOP = simulation['firmware'];
        this.CONNECT_POLL = simulation['connect'];
        const { min, max } = simulation['restart'];

        this.RESTART_LOOP = Utils.getRandomNumberBetweenRange(min, max, true) * 3600000;
        this.sasTokenExpiry = this.getSecondsFromHours(simulation['sasExpire']);

        this.stats = {
            MSG_COUNT: 0,
            MSG_FIRST: null,
            MSG_LAST: null,
            MSG_RATE: 0,
            TWIN_COUNT: 0,
            TWIN_FIRST: null,
            TWIN_LAST: null,
            TWIN_RATE: 0,
            CONNECTS: 0,
            DESIRED: 0,
            ON: 0,
            OFF: 0,
            RESTART: 0,
            RECONFIGURES: -1,
            COMMANDS: 0,
            DPS: 0,
            ERRORS: 0,
        }
        this.updateDevice(device, false);
    }

    // Start of device setup and update code

    updateDevice(device: Device, valueOnlyUpdate: boolean) {
        if (ignoreKind(device.configuration._kind)) { return; }
        if (this.device != null && this.device.configuration.connectionString != device.configuration.connectionString) {
            this.log('DEVICE/MODULE UPDATE ERROR. CONNECTION STRING HAS CHANGED. DELETE DEVICE', LOGGING_TAGS.CTRL.DEV, LOGGING_TAGS.LOG.OPS);
        } else {
            this.device = Object.assign({}, device);
            this.reconfigDeviceDynamically(valueOnlyUpdate);
        }
    }

    reconfigDeviceDynamically(valueOnlyUpdate: boolean) {

        if (valueOnlyUpdate) { return; }
        this.logStat(LOGGING_TAGS.STAT.RECONFIGURES);

        this.resolversCollection = {
            desiredToId: {},
            desiredToIndex: {},
            methodToId: {},
            deviceCommsIndex: {},
            c2dIndex: {},
            directMethodIndex: {}
        }

        this.twinRLProps = [];
        this.twinRLPropsPlanValues = [];
        this.twinRLReportedTimers = [];
        this.twinRLMockSensorTimers = {};

        this.msgRLProps = [];
        this.msgRLPropsPlanValues = [];
        this.msgRLReportedTimers = [];
        this.msgRLMockSensorTimers = {};

        this.buildIndexes();

        // for PM we are only interested in the list. the rest has been defined in IM mode
        if (this.device.configuration.planMode) {

            const config = this.simulationStore.get()['plan'];

            this.device.plan.startup.forEach((item) => {
                const comm = this.device.comms[this.resolversCollection.deviceCommsIndex[item.property]];
                if (comm.sdk === 'twin') {
                    this.twinRLProps.push(comm);
                    this.twinRLPropsPlanValues.push(item.value);
                    this.twinRLReportedTimers.push({ timeRemain: config['startDelay'], originalTime: config['startDelay'] });
                } else if (comm.sdk === 'msg') {
                    this.msgRLProps.push(comm);
                    this.msgRLPropsPlanValues.push(item.value);
                    this.msgRLReportedTimers.push({ timeRemain: config['startDelay'], originalTime: config['startDelay'] });
                }
            })

            this.device.plan.timeline.forEach((item) => {
                // find the last event
                this.planModeLastEventTime = (item.time * 1000) + config['timelineDelay'];
                const comm = this.device.comms[this.resolversCollection.deviceCommsIndex[item.property]];
                if (comm.sdk === 'twin') {
                    this.twinRLProps.push(comm);
                    this.twinRLPropsPlanValues.push(item.value);
                    this.twinRLReportedTimers.push({ timeRemain: this.planModeLastEventTime, originalTime: this.planModeLastEventTime });
                } else if (comm.sdk === 'msg') {
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

            // only twin/msg require the runloop. methods are always on and not part of the runloop
            if (this.device.comms[i]._type != 'property') { continue; }

            // set up runloop reporting
            if (comm.runloop && comm.runloop.include === true) {

                // Adding for back compat. This will also update the UX for any configuration missing valueMax
                if (!comm.runloop.valueMax) { comm.runloop.valueMax = comm.runloop.value; }
                const newRunloopValue = Utils.getRandomNumberBetweenRange(comm.runloop.value, comm.runloop.valueMax, true);
                comm.runloop._ms = newRunloopValue * (comm.runloop.unit === 'secs' ? 1000 : 60000);

                let mockSensorTimerObject = null;

                if (comm.mock) {

                    let slice = 0;
                    let startValue = 0;
                    if (comm.mock._type != 'function') {
                        // if the sensor is a 'active' sensor then us the running expected as the start value
                        startValue = comm.mock.running && comm.mock.running > 0 ? comm.mock.running : comm.mock.init;
                    } else {
                        startValue = comm.mock.init
                        // this is a little bit of a hack to wire a function
                        comm.mock.timeToRunning = 1;
                    }

                    slice = startValue / (comm.mock.timeToRunning / 1000);
                    mockSensorTimerObject = { sliceMs: slice, remainingMs: comm.mock.timeToRunning };
                    comm.mock._value = Utils.formatValue(false, comm.mock.init);
                }

                if (comm.sdk === 'twin') {
                    this.twinRLProps.push(comm);
                    this.twinRLReportedTimers.push({ timeRemain: comm.runloop._ms, originalTime: comm.runloop._ms });
                    if (mockSensorTimerObject != null) { this.twinRLMockSensorTimers[comm._id] = mockSensorTimerObject; }
                }

                if (comm.sdk === 'msg') {
                    this.msgRLProps.push(comm);
                    this.msgRLReportedTimers.push({ timeRemain: comm.runloop._ms, originalTime: comm.runloop._ms });
                    if (mockSensorTimerObject != null) { this.msgRLMockSensorTimers[comm._id] = mockSensorTimerObject; }
                }
            }
        }
    }

    buildIndexes() {
        this.device.comms.forEach((comm, index) => {
            this.resolversCollection.deviceCommsIndex[comm._id] = index;
            if (comm._type === 'property' && comm.sdk === 'twin' && comm.type.direction === 'c2d') {
                this.resolversCollection.desiredToId[comm.name] = comm._id;
                this.resolversCollection.desiredToIndex[comm.name] = index;
            }
            if (comm._type === 'method') {
                this.resolversCollection.methodToId[comm.name] = comm._id;
                if (comm.execution === 'cloud') {
                    this.resolversCollection.c2dIndex[comm.name] = index;
                }
                if (comm.execution === 'direct') {
                    this.resolversCollection.directMethodIndex[comm.name] = index;
                }
            }
        })
    }

    // End of device setup and update code

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
            this.log('DEVICE/MODULE METHOD SHUTDOWN ... STOPPING IMMEDIATELY', LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS);
            this.stop();
            return;
        }

        if (methodName === this.CMD_REBOOT) {
            this.log('DEVICE/MODULE METHOD REBOOT ... RESTARTING IMMEDIATELY', LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS);
            this.stop();
            this.start(undefined);
            return;
        }

        if (methodName === this.CMD_FIRMWARE) {
            this.log(`DEVICE/MODULE METHOD FIRMWARE ... RESTARTING IN ${this.FIRMWARE_LOOP / 1000} SECONDS`, LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS);
            this.stop();
            setTimeout(() => {
                this.start(undefined);
            }, this.FIRMWARE_LOOP)
        }
    }

    /// starts a device
    start(delay) {
        if (ignoreKind(this.device.configuration._kind)) { return; }
        if (this.delayStartTimer || this.running) { return; }

        if (delay) {
            this.log(`DEVICE/MODULE DELAYED START SECONDS: ${delay / 1000}`, LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS);
            this.logCP(LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.DELAY);
            this.delayStartTimer = setTimeout(() => {
                this.startDevice();
                setTimeout(() => {
                    this.delayStartTimer = null;
                }, 100);
            }, delay);
        } else {
            this.startDevice();
        }
    }

    /// starts a device
    async startDevice() {

        this.running = true;

        if (this.device.configuration._kind === 'module') {
            this.log('MODULE IS SWITCHED ON', LOGGING_TAGS.CTRL.MOD, LOGGING_TAGS.LOG.OPS);
            this.logCP(LOGGING_TAGS.CTRL.DEV, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.ON);
            this.logStat(LOGGING_TAGS.STAT.ON);
            this.iotHubDevice = { client: undefined };

            this.log('MODULE INIT', LOGGING_TAGS.CTRL.MOD, LOGGING_TAGS.LOG.OPS);
            this.logCP(LOGGING_TAGS.CTRL.MOD, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.TRYING);

            const { deviceId, moduleId } = Utils.decodeModuleKey(this.device._id);

            if (!GLOBAL_CONTEXT.IOTEDGE_WORKLOADURI && !GLOBAL_CONTEXT.IOTEDGE_DEVICEID && !GLOBAL_CONTEXT.IOTEDGE_MODULEID && !GLOBAL_CONTEXT.IOTEDGE_MODULEGENERATIONID && !GLOBAL_CONTEXT.IOTEDGE_IOTHUBHOSTNAME && !GLOBAL_CONTEXT.IOTEDGE_AUTHSCHEME) {
                this.log(`MODULE '${moduleId}' ENVIRONMENT CHECK FAILED - MISSING IOTEDGE_*`, LOGGING_TAGS.CTRL.MOD, LOGGING_TAGS.LOG.OPS);
                this.log('MODULE WILL SHUTDOWN', LOGGING_TAGS.CTRL.DEV, LOGGING_TAGS.LOG.OPS);
                this.logCP(LOGGING_TAGS.CTRL.MOD, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.OFF);
                return;
            }

            if (GLOBAL_CONTEXT.IOTEDGE_DEVICEID != deviceId || GLOBAL_CONTEXT.IOTEDGE_MODULEID != moduleId) {
                this.log(`MODULE '${moduleId}' DOES NOT MATCH THE MANIFEST CONFIGURATION FOR HOST DEVICE/MODULE (NOT A FAILURE)`, LOGGING_TAGS.CTRL.MOD, LOGGING_TAGS.LOG.OPS);
                this.log('MODULE WILL SHUTDOWN', LOGGING_TAGS.CTRL.DEV, LOGGING_TAGS.LOG.OPS);
                this.logCP(LOGGING_TAGS.CTRL.MOD, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.OFF);
                return;
            }

            try {
                this.iotHubDevice.client = await ModuleClient.fromEnvironment(Protocol);
                this.log(`MODULE '${moduleId}' CHECK PASSED. ENTERING MAIN LOOP`, LOGGING_TAGS.CTRL.MOD, LOGGING_TAGS.LOG.OPS);
                this.logCP(LOGGING_TAGS.CTRL.MOD, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.CONNECTED);
                this.mainLoop();
            } catch (err) {
                this.log(`MODULE '${moduleId}' FAILED TO CONNECT THROUGH ENVIRONMENT TO IOT HUB: ${err}`, LOGGING_TAGS.CTRL.MOD, LOGGING_TAGS.LOG.OPS);
                this.log(`MODULE '${moduleId}' WILL SHUTDOWN`, LOGGING_TAGS.CTRL.DEV, LOGGING_TAGS.LOG.OPS);
                this.logCP(LOGGING_TAGS.CTRL.MOD, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.OFF);
                return;
            }
            return // needed
        }

        this.log('DEVICE IS SWITCHED ON', LOGGING_TAGS.CTRL.DEV, LOGGING_TAGS.LOG.OPS);
        this.logCP(LOGGING_TAGS.CTRL.DEV, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.ON);
        this.logStat(LOGGING_TAGS.STAT.ON);

        if (this.device.configuration._kind === 'dps') {
            const simulation = this.simulationStore.get()['simulation'];
            this.dpsRetires = simulation['dpsRetries'] || 10;
            this.registrationConnectionString = null;

            this.connectionDPSTimer = setInterval(() => {
                if (this.registrationConnectionString != null && this.registrationConnectionString != 'init') {
                    clearInterval(this.connectionDPSTimer);
                    this.connectLoop(this.registrationConnectionString);
                    return;
                }

                if (this.dpsRetires <= 0) {
                    clearInterval(this.connectionDPSTimer);
                    this.stop();
                    this.logStat(LOGGING_TAGS.STAT.ERRORS);
                    return;
                }

                this.log('ATTEMPTING DPS REGISTRATION', LOGGING_TAGS.CTRL.DPS, LOGGING_TAGS.LOG.OPS);
                this.logCP(LOGGING_TAGS.CTRL.DPS, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.TRYING);
                this.dpsRegistration();
            }, this.CONNECT_POLL);
        }
        else {
            this.connectLoop(this.device.configuration.connectionString);
        }
    }

    connectLoop(connectionString?: string) {
        this.log('IOT HUB INITIAL CONNECT START', LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS);
        this.logCP(LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.INIT);
        this.connectClient(connectionString);
        this.mainLoop();
        this.connectionTimer = setInterval(() => {
            this.log('IOT HUB RECONNECT LOOP START', LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS);
            this.logCP(LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.INIT);
            this.logStat(LOGGING_TAGS.STAT.RESTART);
            this.CONNECT_RESTART = true;
            this.cleanUp();
            this.running = true; // Quick fix to change restart behavior
            this.connectClient(connectionString);
            this.mainLoop();
        }, this.RESTART_LOOP)
    }

    stop() {
        if (this.delayStartTimer) {
            clearTimeout(this.delayStartTimer);
            this.delayStartTimer = null;
            this.log(`DEVICE/MODULE DELAYED START CANCELED`, LOGGING_TAGS.CTRL.DEV, LOGGING_TAGS.LOG.OPS);
            this.logCP(LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.OFF);
        } else if (this.running) {
            if (this.device.configuration._kind === 'module') {
                this.log('MODULE WILL SHUTDOWN', LOGGING_TAGS.CTRL.DEV, LOGGING_TAGS.LOG.OPS);
            } else {
                this.log('DEVICE WILL SHUTDOWN', LOGGING_TAGS.CTRL.DEV, LOGGING_TAGS.LOG.OPS);
            }
        }
        this.logCP(LOGGING_TAGS.CTRL.DEV, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.OFF);
        if (!this.running) { return; }
        this.final();
    }

    final() {
        this.dpsRetires = 0;
        clearInterval(this.connectionTimer);
        this.cleanUp();
    }

    cleanUp() {
        clearInterval(this.twinRLTimer);
        clearInterval(this.msgRLTimer);
        clearInterval(this.methodRLTimer);

        try {
            if (this.iotHubDevice && this.iotHubDevice.client) {
                this.iotHubDevice.client.removeAllListeners();
                this.iotHubDevice.client.close();
                this.iotHubDevice.client = null;
            }
        } catch (err) {
            this.log(`DEVICE/MODULE CLIENT TEARDOWN ERROR: ${err.message}`, LOGGING_TAGS.CTRL.DEV, LOGGING_TAGS.LOG.OPS);
            this.logStat(LOGGING_TAGS.STAT.ERRORS);
        } finally {
            this.running = false;
            this.logStat(LOGGING_TAGS.STAT.OFF);
        }
    }


    mainLoop() {
        if (!this.running) { return; }
        this.legacyMainLoop();
    }

    legacyMainLoop() {
        try {
            this.iotHubDevice.client.open(() => {
                this.registerDirectMethods();
                this.registerC2D();

                this.log('IOT HUB CLIENT CONNECTED', LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS);
                this.log(this.device.configuration.planMode ? 'PLAN MODE' : 'INTERACTIVE MODE', LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS);
                this.logCP(LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.CONNECTED);

                this.iotHubDevice.client.getTwin((err, twin) => {

                    // desired properties are cached
                    twin.on('properties.desired', ((delta) => {
                        this.logStat(LOGGING_TAGS.STAT.DESIRED);
                        _.merge(this.desiredMergedCache, delta);

                        Object.assign(this.twinDesiredPayloadRead, delta);

                        this.log(JSON.stringify(delta), LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.MSG.TWIN, LOGGING_TAGS.DATA.RECV);
                        this.CONNECT_RESTART = false;

                        // this deals with a full twin or a single desired
                        for (let name in delta) {
                            if (this.device.configuration.planMode) {
                                this.sendPlanResponse(this.resolversCollection.desiredToId, name);
                            } else {
                                const property: Property = this.device.comms[this.resolversCollection.desiredToIndex[name]];
                                if (!property) { continue; }

                                //REFACTOR: this needs to update the UI
                                property.value = delta[name];
                                property.version = delta['$version'];

                                //REFACTOR: this custom schema needs rethinking
                                if (property.asProperty && property.asPropertyId && property.asPropertyVersion) {

                                    let value = property.value;

                                    // the hub will always send the full desired for a given property in the twin
                                    // so only do when selecting the convention which may only send the patch
                                    if (property.asPropertyConvention) { value = this.desiredMergedCache[name]; }

                                    this.desiredOverrides[property.asPropertyId] = <DesiredPayload>{
                                        payload: property.asPropertyVersionPayload,
                                        convention: property.asPropertyConvention,
                                        value: value,
                                        version: property.version,
                                    }
                                }

                                const p = this.device.comms.filter((x) => { return x._id === property.asPropertyId })
                                // should only be 1
                                for (const send in p) {
                                    let json: ValueByIdPayload = <ValueByIdPayload>{};
                                    let converted = Utils.formatValue(p[send].string, p[send].value);
                                    json[p[send]._id] = converted

                                    // if this an immediate update, send to the runloop
                                    if (p[send].sdk === 'twin') { this.updateTwin(json); }
                                    if (p[send].sdk === 'msg') { this.updateMsg(json); }
                                }
                            }
                        }
                    }))

                    // this loop is a poller to check a payload the will be used to send the method response 
                    // as a reported property with the same name. once it processes the payload it clears it.
                    this.methodRLTimer = setInterval(() => {
                        if (this.methodReturnPayload != null) {
                            twin.properties.reported.update(this.methodReturnPayload, ((err) => {
                                this.log(err ? err.toString() : JSON.stringify(this.methodReturnPayload), LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.MSG.TWIN, LOGGING_TAGS.DATA.SEND);
                                this.methodReturnPayload = null;
                            }))
                        }
                    }, 500);

                    // reported properties are cleared every runloop cycle
                    this.twinRLTimer = setInterval(() => {
                        let payload: ValueByIdPayload = <ValueByIdPayload>this.calcPropertyValues(this.twinRLProps, this.twinRLReportedTimers, this.twinRLMockSensorTimers, this.twinRLPropsPlanValues);
                        this.runloopTwin(this.twinRLPayloadAdditions, payload, twin);
                        this.twinRLPayloadAdditions = <ValueByIdPayload>{};
                    }, 1000);
                })

                this.msgRLTimer = setInterval(() => {
                    let payload: ValueByIdPayload = null;
                    payload = <ValueByIdPayload>this.calcPropertyValues(this.msgRLProps, this.msgRLReportedTimers, this.msgRLMockSensorTimers, this.msgRLPropsPlanValues);
                    this.runloopMsg(this.msgRLPayloadAdditions, payload);
                    this.msgRLPayloadAdditions = <ValueByIdPayload>{};
                }, 1000);

            })
        }
        catch (err) {
            this.log(`SDK OPEN ERROR (CHECK CONN STRING): ${err.message}`, LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS);
            this.logCP(LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.ERROR);
            setTimeout(() => {
                this.stop();
            }, 5000);
        }
    }

    sendPlanResponse(index, name) {
        // this is from the hub where desired twin contains a meta tag
        if (name === '$version') { return; }

        const propertyId = index[name];
        const property = this.device.plan.receive.find((prop) => { return prop.property === propertyId });
        if (property) {
            const outboundProperty: Property = this.device.comms[this.resolversCollection.deviceCommsIndex[property.propertyOut]];
            if (!outboundProperty) { return; }
            const payload = <ValueByIdPayload>{ [outboundProperty._id]: property.value }
            if (outboundProperty.sdk === 'twin') { this.updateTwin(payload); } else { this.updateMsg(payload); }
        }
    }

    sendMethodResponse(method: Method) {
        if (this.device.configuration.planMode) {
            this.sendPlanResponse(this.resolversCollection.methodToId, method.name);
        } else if (!this.device.configuration.planMode && method.asProperty && method.asPropertyId) {
            const p = this.device.comms.filter((x) => { return x._id === method.asPropertyId })
            for (const send in p) {
                let json: ValueByIdPayload = <ValueByIdPayload>{};
                let converted = Utils.formatValue(p[send].string, p[send].value);
                json[p[send]._id] = converted

                // if this an immediate update, send to the runloop
                if (p[send].sdk === 'twin') { this.updateTwin(json); }
                if (p[send].sdk === 'msg') { this.updateMsg(json); }
            }
        } else if (!this.device.configuration.planMode && method.asProperty) {
            this.methodReturnPayload = Object.assign({}, { [method.name]: method.payload })
        }

        // intentional delay to allow any properties to be sent
        setTimeout(() => {
            this.processMockDevicesCMD(method.name);
        }, 2000);
    }

    registerC2D() {
        this.iotHubDevice.client.on('message', (msg) => {
            if (msg === undefined || msg === null) { return; }

            let error = false;
            try {
                const cloudName = msg.properties.getValue('method-name');
                const cloudNameParts = cloudName.split(':');
                const cloudMethod = cloudNameParts.length === 2 ? cloudNameParts[1] : cloudNameParts[0]
                let cloudMethodPayload = msg.data.toString();
                try {
                    cloudMethodPayload = JSON.parse(cloudMethodPayload);
                } catch (err) { }

                if (this.resolversCollection.c2dIndex[cloudMethod]) {
                    const method: Method = this.device.comms[this.resolversCollection.c2dIndex[cloudMethod]];
                    this.log(cloudMethod + ' ' + JSON.stringify(cloudMethodPayload), LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.DATA.METH, LOGGING_TAGS.DATA.RECV, 'C2D REQUEST AND PAYLOAD');
                    Object.assign(this.receivedMethodParams, { [method._id]: { date: new Date().toUTCString(), payload: JSON.stringify(cloudMethodPayload, null, 2) } });

                    this.sendMethodResponse(method);
                }
            }
            catch (err) {
                error = true;
                this.log(`${err.toString()}`, LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.DATA.METH, LOGGING_TAGS.DATA.SEND, 'C2D ERROR PARSING MESSAGE BODY');
            }

            this.iotHubDevice.client.complete(msg, (err) => {
                this.log(`${err ? err.toString() : error ? 'FAILED' : 'SUCCESS'}`, LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS, null, 'C2D COMPLETE');
            });
        });
    }

    registerDirectMethods() {

        for (const key in this.resolversCollection.directMethodIndex) {
            const clientMethodKey = this.device.configuration._kind === 'module' ? 'onMethod' : 'onDeviceMethod';
            this.iotHubDevice.client[clientMethodKey](key, (request, response) => {
                const method: Method = this.device.comms[this.resolversCollection.directMethodIndex[key]];
                const methodPayload = JSON.parse(method.payload || {});

                this.log(`${request.methodName} : ${request.payload ? JSON.stringify(request.payload) : '<NO PAYLOAD>'}`, LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.DATA.METH, LOGGING_TAGS.DATA.RECV, 'DIRECT METHOD REQUEST AND PAYLOAD');
                Object.assign(this.receivedMethodParams, { [method._id]: { date: new Date().toUTCString(), payload: request.payload } });

                // this response is the payload of the device
                response.send((method.status), methodPayload, (err) => {
                    this.log(err ? err.toString() : `${method.name} : ${JSON.stringify(methodPayload)}`, LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.DATA.METH, LOGGING_TAGS.DATA.SEND, 'DIRECT METHOD RESPONSE PAYLOAD');
                    this.messageService.sendAsLiveUpdate(this.device._id, { [method._id]: new Date().toUTCString() });

                    this.sendMethodResponse(method);
                })
            });
        }
    }

    async connectClient(connectionString) {
        this.iotHubDevice = { client: undefined };

        if (this.useSasMode) {
            const cn = ConnectionString.parse(connectionString);

            let sas: any = SharedAccessSignature.create(cn.HostName, cn.DeviceId, cn.SharedAccessKey, this.sasTokenExpiry);
            this.iotHubDevice.client = Client.fromSharedAccessSignature(sas, M1);

            const trueHours = Math.ceil((this.sasTokenExpiry - Math.round(Date.now() / 1000)) / 3600);
            this.log(`CONNECTING VIA SAS.TOKEN EXPIRES AFTER ${trueHours} HOURS`, LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS);
        } else {
            // get a connection string from the RP in the Portal            
            this.iotHubDevice.client = clientFromConnectionString(connectionString);
            this.log(`CONNECTING VIA CONN STRING`, LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS);
        }
        this.logStat(LOGGING_TAGS.STAT.CONNECTS);
        this.log(`DEVICE/MODULE AUTO RESTARTS EVERY ${this.RESTART_LOOP / 60000} MINUTES`, LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.LOG.OPS);
    }

    dpsRegistration() {

        if (this.registrationConnectionString === 'init') { return; }
        if (this.dpsRetires === 0) { return; }

        let config = this.device.configuration;
        this.iotHubDevice = { client: undefined };
        this.registrationConnectionString = 'init';

        let transformedSasKey = config.isMasterKey ? this.computeDrivedSymmetricKey(config.sasKey, config.deviceId) : config.sasKey;

        // this provides back compat for all pre 5.3 state files
        let dpsPayload = {};
        if (config.dpsPayload) {
            try {
                dpsPayload = JSON.parse(config.dpsPayload);
            }
            catch {
                dpsPayload = config.dpsPayload;
            }
        }

        let provisioningSecurityClient = new SymmetricKeySecurityClient(config.deviceId, transformedSasKey);
        let provisioningClient = ProvisioningDeviceClient.create('global.azure-devices-provisioning.net', config.scopeId, new MqttDps(), provisioningSecurityClient);

        provisioningClient.setProvisioningPayload(dpsPayload);
        this.log('WAITING FOR REGISTRATION', LOGGING_TAGS.CTRL.DPS, LOGGING_TAGS.LOG.OPS);
        this.logCP(LOGGING_TAGS.CTRL.DPS, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.TRYING);
        provisioningClient.register((err: any, result) => {
            if (err) {
                let msg = err.result && err.result.registrationState && err.result.registrationState.errorMessage || err;
                this.log(`REGISTRATION ERROR ${this.dpsRetires}: ${err}`, LOGGING_TAGS.CTRL.DPS, LOGGING_TAGS.LOG.OPS);
                this.logCP(LOGGING_TAGS.CTRL.DPS, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.ERROR);
                this.registrationConnectionString = null;
                this.dpsRetires--;
                return;
            }
            this.registrationConnectionString = 'HostName=' + result.assignedHub + ';DeviceId=' + result.deviceId + ';SharedAccessKey=' + transformedSasKey;
            this.log('DEVICE REGISTRATION SUCCESS', LOGGING_TAGS.CTRL.DPS, LOGGING_TAGS.LOG.OPS);
            this.logCP(LOGGING_TAGS.CTRL.DPS, LOGGING_TAGS.LOG.OPS, LOGGING_TAGS.LOG.EV.SUCCESS);
            this.logStat(LOGGING_TAGS.STAT.DPS);
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
                const transformed = this.transformPayload(payload);
                twin.properties.reported.update(transformed.legacy, ((err) => {
                    this.log(JSON.stringify(transformed.legacy), LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.MSG.TWIN, LOGGING_TAGS.DATA.SEND);
                    this.logStat(LOGGING_TAGS.STAT.TWIN.COUNT);
                    this.messageService.sendAsLiveUpdate(this.device._id, transformed.live);
                }))
            }
        }
    }

    /// runs the device
    async runloopMsg(additions: ValueByIdPayload, payload) {

        if (payload != null) {
            Object.assign(payload, additions);

            if (Object.keys(payload).length > 0) {
                const transformed = this.transformPayload(payload);
                let msg = new Message(JSON.stringify(transformed.legacy));
                this.iotHubDevice.client.sendEvent(msg, ((err) => {
                    this.log(JSON.stringify(transformed.legacy), LOGGING_TAGS.CTRL.HUB, LOGGING_TAGS.MSG.MSG, LOGGING_TAGS.DATA.SEND);
                    this.logStat(LOGGING_TAGS.STAT.MSG.COUNT);
                    this.messageService.sendAsLiveUpdate(this.device._id, transformed.live);
                }))
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

            // for plan mode we send regardless of enabled or not
            if (res.process && (this.device.configuration.planMode || p.enabled)) {
                let o: ValueByIdPayload = <ValueByIdPayload>{};
                o[p._id] = this.device.configuration.planMode ? Utils.formatValue(p.string, runloopPropertiesValues[i]) : (p.mock ? p.mock._value || Utils.formatValue(false, p.mock.init) : Utils.formatValue(p.string, p.value));
                Object.assign(payload, o);
            }

            this.updateSensorValue(p, propertySensorTimers, res.process);
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

        if (p.mock._type === 'fan') {
            var variance = p.mock.variance / p.mock.running * 100;
            p.mock._value = randomFromRange >= 5 ? p.mock.running - variance : p.mock.running + variance;
        }

        if (p.mock._type === 'hotplate') {
            if (p.mock.reset && Utils.isNumeric(p.mock.reset) && Utils.formatValue(false, p.mock.reset) === p.mock._value) {
                p.mock._value = Utils.formatValue(false, p.mock.init);
            } else {
                var newCurrent = p.mock._value + (slice - (slice * p.mock.variance));
                p.mock._value = newCurrent <= p.mock.running ? newCurrent : p.mock.running;
            }
        }

        if (p.mock._type === 'battery') {
            if (p.mock.reset && Utils.isNumeric(p.mock.reset) && Utils.formatValue(false, p.mock.reset) === p.mock._value) {
                p.mock._value = Utils.formatValue(false, p.mock.init);
            } else {
                var newCurrent = p.mock._value - (slice + (slice * p.mock.variance));
                p.mock._value = newCurrent > p.mock.running ? newCurrent : p.mock.running;
            }
        }

        if (p.mock._type === 'random') {
            p.mock._value = Math.floor(Math.random() * Math.floor(Math.pow(10, p.mock.variance) + 1));
        }

        if (p.mock._type === 'function' && process) {
            const res: any = await this.getFunctionPost(p.mock.function, p.mock._value);
            p.mock._value = res;
        }

        if (p.mock._type === 'inc' && process) {
            const inc = p.mock.variance && Utils.isNumeric(p.mock.variance) ? Utils.formatValue(false, p.mock.variance) : 1;
            if (p.mock.reset && Utils.isNumeric(p.mock.reset) && Utils.formatValue(false, p.mock.reset) === p.mock._value) {
                p.mock._value = Utils.formatValue(false, p.mock.init);
            } else {
                p.mock._value = p.mock._value + inc;
            }
        }

        if (p.mock._type === 'dec' && process) {
            const dec = p.mock.variance && Utils.isNumeric(p.mock.variance) ? Utils.formatValue(false, p.mock.variance) : 1;
            if (p.mock.reset && Utils.isNumeric(p.mock.reset) && Utils.formatValue(false, p.mock.reset) === p.mock._value) {
                p.mock._value = Utils.formatValue(false, p.mock.init);
            } else {
                p.mock._value = p.mock._value - dec;
            }
        }
    }

    getFunctionPost(url: string, value: any) {
        return new Promise((resolve, reject) => {
            try {
                request.post({
                    headers: { 'content-type': 'application/json' },
                    url: url,
                    body: JSON.stringify({ 'value': value })
                }, (err, response, body) => {
                    if (err) {
                        this.log(`FUNCTION ERROR: ${err.toString()}`, LOGGING_TAGS.DATA.FNC, '', LOGGING_TAGS.DATA.SEND);
                        reject(err);
                    }
                    else {
                        let payload = JSON.parse(body);
                        resolve(payload.value ? parseFloat(payload.value) : payload.body);
                    }
                });
            }
            catch (err) {
                this.log(`FUNCTION FAILED: ${err.toString()}`, LOGGING_TAGS.DATA.FNC, '', LOGGING_TAGS.DATA.SEND);
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
                timeRemain = p.runloop._ms;
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
        let remap = { pnp: [], legacy: {}, live: {} };

        // this should be more efficient
        for (let i = 0; i < this.device.comms.length; i++) {
            if (this.device.comms[i]._type != 'property') { continue; }
            let p: Property = this.device.comms[i];
            if (payload[p._id] != undefined) {
                if (p.propertyObject) {
                    var val = p.string ? "\"" + payload[p._id] + "\"" : payload[p._id];

                    /* REFACTOR: this concept does not scale well. desired and reported for a setting
                       are separate items in the array therefore there is no concept of version we the event
                       loop arrives here. Address in V6 */
                    if (this.desiredOverrides[p._id]) {
                        const payload: DesiredPayload = this.desiredOverrides[p._id];
                        let override: any = null;
                        try {
                            override = JSON.parse(payload.payload);
                            if (payload.convention) { Object.assign(override, payload.value) }
                            this.resolveRandom(override, payload);
                        } catch (err) {
                            override = this.resolveAuto(payload.payload, payload)
                            // this can be ignored
                        }
                        remap.legacy[p.name] = override;
                        remap.live[p._id] = override;
                        remap.pnp.push({ id: p._id, name: p.name, value: override })
                        delete this.desiredOverrides[p._id];
                    } else if (p.propertyObject.type === 'templated') {
                        try {
                            var replacement = p.propertyObject.template.replace(new RegExp(/\"AUTO_VALUE\"/, 'g'), val);
                            var object = JSON.parse(replacement);
                            this.resolveRandom(object)
                            remap.legacy[p.name] = object;
                            remap.live[p._id] = object;
                            remap.pnp.push({ id: p._id, name: p.name, value: object })
                        } catch (ex) {
                            const err = 'ERR - transformPayload: ' + ex;
                            remap.legacy[p.name] = err;
                            remap.live[p._id] = err;
                            remap.pnp.push({ id: p._id, name: p.name, value: err })
                        }
                    } else {
                        const resolve = this.resolveAuto(payload[p._id]);;
                        remap.legacy[p.name] = resolve;
                        remap.live[p._id] = resolve;
                        remap.pnp.push({ id: p._id, name: p.name, value: resolve })
                        break;
                    }

                } else {
                    const resolve = this.resolveAuto(payload[p._id]);;
                    remap.legacy[p.name] = resolve;
                    remap.live[p._id] = resolve;
                    remap.pnp.push({ id: p._id, name: p.name, value: resolve })
                }
            }
        }
        return remap;
    }

    resolveAuto(macro: string, parameters?: any) {
        if (macro === 'AUTO_STRING') {
            return rw();
        } else if (macro === 'AUTO_BOOLEAN') {
            return Utils.getRandomValue('boolean');
        } else if (macro === 'AUTO_INTEGER' || macro === 'AUTO_LONG') {
            return Utils.getRandomValue('integer', this.ranges['AUTO_INTEGER']['min'], this.ranges['AUTO_INTEGER']['max']);
        } else if (macro === 'AUTO_DOUBLE' || (macro === 'AUTO_FLOAT')) {
            return Utils.getRandomValue('double', this.ranges['AUTO_DOUBLE']['min'], this.ranges['AUTO_DOUBLE']['max']);
        } else if (macro === 'AUTO_DATE') {
            return Utils.getRandomValue('date')
        } else if (macro === 'AUTO_DATETIME') {
            return Utils.getRandomValue('dateTime')
        } else if (macro === 'AUTO_TIME' || macro === 'AUTO_DURATION') {
            return Utils.getRandomValue('time')
        } else if (macro === 'AUTO_GEOPOINT') {
            return Utils.getRandomGeo(this.geo['latitude'], this.geo['longitude'], this.geo['altitude'], this.geo['radius'])
        } else if (macro === 'AUTO_VECTOR') {
            return Utils.getRandomVector(this.ranges['AUTO_VECTOR']['min'], this.ranges['AUTO_VECTOR']['max']);
        } else if (macro === 'AUTO_MAP') {
            return Utils.getRandomMap()
        } else if (macro && macro.toString().startsWith('AUTO_ENUM')) {
            let parts = macro.split('/');
            if (parts.length === 2 && parts[0] === 'AUTO_ENUM') {
                let arr = JSON.parse(parts[1]);
                const index = Utils.getRandomNumberBetweenRange(0, arr.length, true)
                return arr[index];
            }
        } else if (macro === 'DESIRED_VALUE') {
            return parameters.value;
        } else if (macro === 'DESIRED_VERSION') {
            return parameters.version;
        }
        return macro;
    }

    resolveRandom(node: any, parameters?: any) {
        for (let key in node) {
            if (typeof node[key] == 'object') {
                this.resolveRandom(node[key], parameters)
            } else {
                node[key] = this.resolveAuto(node[key], parameters);
            }
        }
    }

    log(message, type, operation, direction?, submsg?) {
        let msg = `[${type}][${operation}][${this.device._id}]`;
        if (direction) { msg += `[${direction}]` }
        if (submsg) { msg += `[${submsg}]` }
        this.messageService.sendConsoleUpdate(`${msg} ${message}`)
    }

    logCP(type, operation, event) {
        this.messageService.sendAsControlPlane({ [this.device._id]: [type, operation, event] });
    }

    logStat(type) {
        if (ignoreKind(this.device.configuration._kind)) { return; }

        const parts = type.split('_');
        const update = parts.length === 2 ? parts[0] : 'METER';
        const date = new Date().toISOString();

        if (update === 'MSG' && !this.stats.MSG_FIRST) { this.stats.MSG_FIRST = date; }
        if (update === 'TWIN' && !this.stats.TWIN_FIRST) { this.stats.TWIN_FIRST = date; }

        if (update === 'MSG') { this.stats.MSG_LAST = date; }
        if (update === 'TWIN') { this.stats.TWIN_LAST = date; }

        this.stats[type] = this.stats[type] + 1;
        if (this.stats.MSG_FIRST && this.stats.MSG_LAST && update === 'MSG') {
            const s = Date.parse(this.stats.MSG_FIRST);
            const f = Date.parse(this.stats.MSG_LAST);
            this.stats[LOGGING_TAGS.STAT.MSG.RATE] = (this.stats[type] / (Math.round((f - s) / 60000))).toFixed(2)
        }

        if (this.stats.TWIN_FIRST && this.stats.TWIN_LAST && update === 'TWIN') {
            const s = Date.parse(this.stats.TWIN_FIRST);
            const f = Date.parse(this.stats.TWIN_LAST);
            this.stats[LOGGING_TAGS.STAT.TWIN.RATE] = (this.stats[type] / (Math.round((f - s) / 60000))).toFixed(2)
        }

        this.messageService.sendAsStats({ [this.device._id]: this.stats });
    }
}