import { AssociativeStore } from '../framework/associativeStore'
import { Device, Property, MockSensor, Method } from '../interfaces/device';


import { Mqtt as M1, clientFromConnectionString } from 'azure-iot-device-mqtt';
import { Client } from 'azure-iot-device';
import { Message, SharedAccessSignature } from 'azure-iot-device';
import { anHourFromNow, ConnectionString } from 'azure-iot-common';

import { Mqtt as M2 } from 'azure-iot-provisioning-device-mqtt';
import { SymmetricKeySecurityClient } from 'azure-iot-security-symmetric-key';
import { ProvisioningDeviceClient } from 'azure-iot-provisioning-device';

import { ValueByIdPayload } from '../interfaces/payload';
import * as Utils from './utils';
import { LiveUpdatesService } from './liveUpdatesService';
import * as request from 'request';
import * as rw from 'random-words';
import * as Crypto from 'crypto';

const MSG_HUB_EVENT = ">> [RUNNER]-[HUB] - ";
const MSG_DPS_EVENT = ">> [RUNNER]-[DPS] - ";
const MSG_ENG_EVENT = ">> [RUNNER]-[DEV] - ";

export class MockDevice {

    private CONNECT_LOOP = 3000000;
    private CONNECT_RESTART: boolean = false;
    private useSasMode = true;

    // device is not mutable
    private connectionDPSTimer = null;
    private connectionTimer = null;
    private device: Device = null;
    private iotHubDevice: any = null;

    private methodRLTimer = null;
    private methodReturnPayload = null;

    private twinRLTimer = null;
    private twinRLProps: Array<Property> = [];
    private twinRLReportedTimers: Array<number> = [];
    private twinRLPayloadAdditions: ValueByIdPayload = <ValueByIdPayload>{};
    private twinDesiredPayloadRead = {};

    private msgRLTimer = null;
    private msgRLProps: Array<Property> = [];
    private msgRLReportedTimers: Array<number> = [];
    private msgRLPayloadAdditions: ValueByIdPayload = <ValueByIdPayload>{};

    private twinRLMockSensorTimers = {};
    private msgRLMockSensorTimers = {};
    private running: boolean = false;

    private liveUpdates: LiveUpdatesService = null;

    private receivedMethodParams = {}

    private registrationConnectionString: string = null;

    constructor(device, liveUpdates: LiveUpdatesService) {
        this.updateDevice(device);
        this.liveUpdates = liveUpdates;
    }

    configure() {
        this.twinRLProps = [];
        this.twinRLReportedTimers = [];
        this.twinRLMockSensorTimers = {};

        this.msgRLProps = [];
        this.msgRLReportedTimers = [];
        this.msgRLMockSensorTimers = {};

        for (let i = 0; i < this.device.comms.length; i++) {
            let comm = this.device.comms[i];

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
                        // re-think this. init might be < 0
                        startValue = comm.mock.init > 0 ? comm.mock.init : comm.mock.running;
                    } else {
                        // this is a little bit of a hack to wire a function
                        startValue = comm.mock.init
                        comm.mock.timeToRunning = 1;
                    }

                    slice = startValue / comm.mock.timeToRunning;
                    mockSensorTimerObject = { slice: slice, remaining: comm.mock.timeToRunning };
                    comm.mock._value = comm.mock.init;
                }

                if (comm.sdk === "twin") {
                    this.twinRLProps.push(comm);
                    this.twinRLReportedTimers.push(ms);
                    if (mockSensorTimerObject != null) { this.twinRLMockSensorTimers[comm._id] = mockSensorTimerObject; }
                }

                if (comm.sdk === "msg") {
                    this.msgRLProps.push(comm);
                    this.msgRLReportedTimers.push(ms);
                    if (mockSensorTimerObject != null) { this.msgRLMockSensorTimers[comm._id] = mockSensorTimerObject; }
                }
            }
        }
    }

    updateDevice(device: Device) {
        if (this.device != null && this.device.configuration.connectionString != device.configuration.connectionString) {
            this.liveUpdates.sendConsoleUpdate(MSG_ENG_EVENT + "[" + this.device._id + "] DEVICE UPDATE ERROR. CONNECTION STRING HAS CHANGED. DELETE DEVICE");
        } else {
            this.device = JSON.parse(JSON.stringify(device));
            this.configure();
        }
    }

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

    /// starts a device
    start() {
        if (this.device.configuration._kind === 'template') { return; }
        this.liveUpdates.sendConsoleUpdate(MSG_HUB_EVENT + "[" + this.device._id + "] CLIENT START");

        if (this.device.configuration._kind === 'dps') {
            this.registrationConnectionString = null;
            this.connectionDPSTimer = setInterval(() => {
                this.liveUpdates.sendConsoleUpdate(MSG_DPS_EVENT + "[" + this.device._id + "] WAITING FOR REGISTRATION");
                if (this.registrationConnectionString != null && this.registrationConnectionString != 'init') {
                    clearInterval(this.connectionDPSTimer);
                    this.connectLoop(this.registrationConnectionString);
                    return;
                }
                this.dpsRegistration();
            }, 2000);
        }
        else {
            this.connectLoop(this.device.configuration.connectionString);
        }
    }

    connectLoop(connectionString?: string) {
        this.liveUpdates.sendConsoleUpdate(MSG_HUB_EVENT + "[" + this.device._id + "] CLIENT STARTING CONNECT LOOP");
        this.connectClient(connectionString);
        this.mainLoop();
        this.connectionTimer = setInterval(() => {
            this.liveUpdates.sendConsoleUpdate(MSG_HUB_EVENT + "[" + this.device._id + "] CLIENT READY");
            this.CONNECT_RESTART = true;
            this.cleanUp();
            this.connectClient(connectionString);
            this.mainLoop();
        }, this.CONNECT_LOOP)
    }

    end() {
        this.liveUpdates.sendConsoleUpdate(MSG_HUB_EVENT + "[" + this.device._id + "] RUNLOOP ENDING");
        clearInterval(this.connectionDPSTimer);
        if (this.running === true && this.iotHubDevice.client != null) {
            clearInterval(this.connectionTimer);
            this.cleanUp();
        }
    }

    mainLoop() {
        if (this.running === false) {
            try {
                this.iotHubDevice.client.open(() => {
                    this.running = true;
                    this.liveUpdates.sendConsoleUpdate(MSG_HUB_EVENT + "[" + this.device._id + "] CLIENT OPEN");

                    this.setupCommands();

                    this.iotHubDevice.client.getTwin((err, twin) => {

                        // desired properties are cached
                        twin.on('properties.desired', ((delta) => {
                            if (!this.CONNECT_RESTART) { Object.assign(this.twinDesiredPayloadRead, delta); }
                            this.liveUpdates.sendConsoleUpdate("[" + new Date().toUTCString() + "][" + this.device._id + "][RECV] <- " + (this.CONNECT_RESTART ? "RESTART " : "STORED ") + JSON.stringify(delta));
                            this.CONNECT_RESTART = false;
                        }))

                        this.methodRLTimer = setInterval(() => {
                            if (this.methodReturnPayload != null) {
                                twin.properties.reported.update(this.methodReturnPayload, ((err) => {
                                    this.liveUpdates.sendConsoleUpdate("[" + new Date().toUTCString() + "][" + this.device._id + "][M_TW] -> " + (err ? err.toString() : JSON.stringify(this.methodReturnPayload)));
                                    this.methodReturnPayload = null;
                                }))
                            }
                        }, 500);

                        // reported properties are cleared every runloop cycle
                        this.twinRLTimer = setInterval(() => {

                            let payload: ValueByIdPayload = <ValueByIdPayload>this.calcPropertyValues(this.twinRLProps, this.twinRLReportedTimers, this.twinRLMockSensorTimers);
                            this.liveUpdates.sendAsLiveUpdate(payload);
                            this.runloopTwin(this.twinRLPayloadAdditions, payload, twin);
                            this.twinRLPayloadAdditions = <ValueByIdPayload>{};
                        }, 1000);
                    })

                    this.msgRLTimer = setInterval(() => {

                        let payload: ValueByIdPayload = <ValueByIdPayload>this.calcPropertyValues(this.msgRLProps, this.msgRLReportedTimers, this.msgRLMockSensorTimers);
                        this.liveUpdates.sendAsLiveUpdate(payload);

                        this.runloopMsg(this.msgRLPayloadAdditions, payload);
                        this.msgRLPayloadAdditions = <ValueByIdPayload>{};
                    }, 1000);

                })
            }
            catch (err) {
                this.liveUpdates.sendConsoleUpdate(MSG_HUB_EVENT + "[" + this.device._id + "] OPEN ERROR: " + err.message);
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
            this.liveUpdates.sendConsoleUpdate(MSG_HUB_EVENT + "[" + this.device._id + "] TEAR DOWN ERROR: " + err.message);
        } finally {
            this.running = false;
        }
    }

    connectClient(connectionString) {
        this.iotHubDevice = {};

        if (this.useSasMode) {
            const cn = ConnectionString.parse(connectionString);
            let sas: any = SharedAccessSignature.create(cn.HostName, cn.DeviceId, cn.SharedAccessKey, anHourFromNow());
            this.iotHubDevice.client = Client.fromSharedAccessSignature(sas, M1);
            this.liveUpdates.sendConsoleUpdate(MSG_HUB_EVENT + "[" + this.device._id + "] CONNECTING VIA SAS CONNECTION STRING. RESTARTS AFTER " + (this.CONNECT_LOOP / 60000) + " MINUTES");
        } else {
            this.iotHubDevice.client = clientFromConnectionString(connectionString);
            this.liveUpdates.sendConsoleUpdate(MSG_HUB_EVENT + "[" + this.device._id + "] CONNECTING VIA CONN STRING API");
        }
    }

    dpsRegistration() {

        if (this.registrationConnectionString === 'init') { return; }

        let config = this.device.configuration;
        this.iotHubDevice = {};
        this.registrationConnectionString = 'init';

        let transformedSasKey = config.isMasterKey ? this.computeDrivedSymmetricKey(config.sasKey, config.deviceId) : config.sasKey;
        let dpsPayload = config.dpsPayload && Object.keys(config.dpsPayload).length > 0 ? JSON.parse(config.dpsPayload) : {};
        var provisioningSecurityClient = new SymmetricKeySecurityClient(config.deviceId, transformedSasKey);
        var provisioningClient = ProvisioningDeviceClient.create('global.azure-devices-provisioning.net', config.scopeId, new M2(), provisioningSecurityClient);

        provisioningClient.setProvisioningPayload(dpsPayload);
        this.liveUpdates.sendConsoleUpdate(MSG_DPS_EVENT + "[" + this.device._id + "] REGISTERING ...");
        provisioningClient.register((err: any, result) => {
            if (err) {
                let msg = err.result && err.result.registrationState && err.result.registrationState.errorMessage || err;
                this.liveUpdates.sendConsoleUpdate(MSG_DPS_EVENT + "[" + this.device._id + "] REGISTERING ERROR " + msg);
                this.registrationConnectionString = null;
                return;
            }
            this.registrationConnectionString = 'HostName=' + result.assignedHub + ';DeviceId=' + result.deviceId + ';SharedAccessKey=' + transformedSasKey;
        })
    }

    // creates the HMAC key
    computeDrivedSymmetricKey(masterKey, regId) {
        return Crypto.createHmac('SHA256', Buffer.from(masterKey, 'base64'))
            .update(regId, 'utf8')
            .digest('base64');
    }

    setupCommands() {
        // this block needs a refactor
        for (let i = 0; i < this.device.comms.length; i++) {
            let comm: any = this.device.comms[i];
            if (comm._type === "method") {

                let m: Method = comm;
                let payload = m.asProperty ? { result: m.payload } : JSON.parse(m.payload);

                this.iotHubDevice.client.onDeviceMethod(m.name, (request, response) => {
                    this.liveUpdates.sendConsoleUpdate("[" + new Date().toUTCString() + "][" + this.device._id + "][METH] <- " + request.methodName + " " + JSON.stringify(request.payload));
                    Object.assign(this.receivedMethodParams, { [m._id]: { date: new Date().toUTCString(), payload: JSON.stringify(request.payload) } });
                    response.send((m.status), payload, (err) => {
                        if (m.asProperty) { this.methodReturnPayload = Object.assign({}, { [m.name]: m.payload }) }
                        this.liveUpdates.sendConsoleUpdate("[" + new Date().toUTCString() + "][" + this.device._id + "][RESP] -> " + (err ? err.toString() : JSON.stringify(payload)));
                        this.liveUpdates.sendAsLiveUpdate({ [m._id]: new Date().toUTCString() });
                    })
                });
            }
        }
    }

    /// runs the device
    runloopTwin(additions: ValueByIdPayload, payload, twin) {

        if (payload != null) {
            Object.assign(payload, additions);

            if (Object.keys(payload).length > 0) {
                let wire = this.transformPayload(payload);
                twin.properties.reported.update(wire, ((err) => {
                    this.liveUpdates.sendConsoleUpdate("[" + new Date().toUTCString() + "][" + this.device._id + "][TWIN] -> " + (err ? err.toString() : JSON.stringify(wire)));
                    this.liveUpdates.sendAsLiveUpdate(payload);
                }))
            }
        }
    }

    /// runs the device
    runloopMsg(additions: ValueByIdPayload, payload) {

        if (payload != null) {
            Object.assign(payload, additions);

            if (Object.keys(payload).length > 0) {
                let wire = this.transformPayload(payload);
                let msg = new Message(JSON.stringify(wire));
                this.iotHubDevice.client.sendEvent(msg, ((err) => {
                    this.liveUpdates.sendConsoleUpdate("[" + new Date().toUTCString() + "][" + this.device._id + "][MSG] -> " + (err ? err.toString() : JSON.stringify(wire)));
                    this.liveUpdates.sendAsLiveUpdate(payload);
                }))
            }
        }
    }

    calcPropertyValues(runloopProperties: any, runloopTimers: any, propertySensorTimers: any) {
        if (this.iotHubDevice === null || this.iotHubDevice.client === null) {
            clearInterval(this.msgRLTimer);
            return null;
        }

        // first get all the values to report
        let payload = {};
        for (let i = 0; i < runloopProperties.length; i++) {
            let p: Property = runloopProperties[i];
            let res = this.processCountdown(p, runloopTimers[i]);
            runloopTimers[i] = res.timeRemain;

            // we need to adjust the mock sensor value regardless of runloop
            // 2nd block appears to be required due to a typescript bug
            if (p.mock && p.mock._type != "function") {
                this.updateSensorValue(p, propertySensorTimers);
            }
            if (p.mock && p.mock._type === "function" && res.process === true) {
                this.updateSensorValue(p, propertySensorTimers);
            }

            if (res.process === true) {
                let o: ValueByIdPayload = <ValueByIdPayload>{};
                o[p._id] = (p.mock ? p.mock._value : Utils.formatValue(p.string, p.value));
                Object.assign(payload, o);
            }
        }
        return payload;
    }

    async updateSensorValue(p: Property, propertySensorTimers: any) {

        let slice = 0;
        let randomFromRange = Utils.getRandomNumberBetweenRange(1, 10);

        // this block deals with calculating the slice val to apply to the current sensor value
        if (propertySensorTimers[p._id]) {
            slice = propertySensorTimers[p._id].slice;
            let sliceRemaining = propertySensorTimers[p._id].remaining - 1;
            if (sliceRemaining > 0) {
                propertySensorTimers[p._id].remaining = sliceRemaining;
            } else {
                delete propertySensorTimers[p._id];
            }
        } else {
            slice = p.mock._value;
        }

        /* very simple calculations on line to give them some realistic behavoir */

        if (p.mock._type === "fan") {
            var variance = p.mock.variance / p.mock.running * 100;
            p.mock._value = randomFromRange >= 5 ? p.mock.running - variance : p.mock.running + variance;
        }

        if (p.mock._type === "hotplate") {
            var newCurrent = p.mock._value + (slice + (slice * p.mock.variance));
            p.mock._value = newCurrent <= p.mock.running ? newCurrent : p.mock.running;
        }

        if (p.mock._type === "battery") {
            var newCurrent = p.mock._value - (slice + (slice * p.mock.variance));
            p.mock._value = newCurrent > p.mock.running ? newCurrent : p.mock.running;
        }

        if (p.mock._type === "random") {
            p.mock._value = Math.floor(Math.random() * Math.floor(Math.pow(10, p.mock.variance) + 1));
        }

        if (p.mock._type === "function") {
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
                }, function (error, response, body) {
                    if (error) {
                        this.liveUpdates.sendConsoleUpdate('[FUNCTION REQUEST][ERR] - ' + error)
                        reject(error);
                    }
                    else {
                        let payload = JSON.parse(body);
                        resolve(payload.value ? parseFloat(payload.value) : payload.body);
                    }
                });
            }
            catch (err) {
                this.liveUpdates.sendConsoleUpdate('[FUNCTION REQUEST][FAILED] - ' + err.message);
            }
        })
    }

    processCountdown(p: Property, remainingTime) {

        let res: any = {};
        let timeRemain = remainingTime;

        // countdown and go to next property
        if (timeRemain != 0) {
            timeRemain = timeRemain - 1000;
            res.process = false;
        }

        // reset and process
        if (timeRemain === 0) {
            let mul = p.runloop.unit === "secs" ? 1000 : 60000
            timeRemain = p.runloop.value * mul;
            res.process = true;
        }

        res.timeRemain = timeRemain;
        return res;
    }

    transformPayload(payload: any) {
        // this converts an id based json array to a name based array
        // if the name is duped then last one wins. this is ok for now
        // but a better solution is required.
        let remap = {};
        for (let i = 0; i < this.device.comms.length; i++) {
            if (this.device.comms[i]._type != "property") { continue; }

            let p: Property = this.device.comms[i];
            if (payload[p._id] != undefined) {
                if (p.propertyObject) {
                    var val = p.string ? "\"" + payload[p._id] + "\"" : payload[p._id];
                    switch (p.propertyObject.type) {
                        case 'templated':
                            try {
                                if (p.propertyObject.random) {
                                    var o = JSON.parse(p.propertyObject.template);
                                    replaceRandom(o)
                                    remap[p.name] = o;
                                } else {
                                    remap[p.name] = JSON.parse(p.propertyObject.template.replace(new RegExp(/_VALUE_/, 'g'), val));
                                }
                            } catch (ex) {
                                remap[p.name] = { "error": "JSON parse error." + ex }
                            }
                            break;
                        default:
                            remap[p.name] = payload[p._id]
                            break;
                    }

                } else {
                    remap[p.name] = payload[p._id]
                }
            }
        }
        return remap;
    }
}

function replaceRandom(node) {
    for (let key in node) {
        if (typeof node[key] == 'object' || node[key] == 'map') {
            replaceRandom(node[key])
        } else {
            if (node[key] === "RND_STRING") {
                node[key] = rw();
            } else if (node[key] === "RND_BOOLEAN") {
                node[key] = Math.random() >= 0.5;
            } else {
                node[key] = Math.random() * (10000 - 1) + 1;
            }
        }
    }
}