import { Config } from '../config';
import { AssociativeStore } from '../framework/AssociativeStore'
import { SensorStore } from './sensorStore'
import { Method, Device, Property } from '../interfaces/device';
import { MockDevice } from '../core/mockDevice';
import { MessageService } from '../interfaces/messageService';
import { ValueByIdPayload } from '../interfaces/payload';
import * as uuidV4 from 'uuid/v4';
import * as Utils from '../core/utils';
import * as crypto from 'crypto';
import { SimulationStore } from '../store/simulationStore';

export class DeviceStore {

    private store: AssociativeStore<Device>;

    private runners: any = {};

    private sensorStore: SensorStore;

    private liveUpdatesService: MessageService = null;

    private simulationStore = null;
    private simColors = null;
    private bulkRun = null;

    constructor(messageService: MessageService) {
        this.liveUpdatesService = messageService;
        this.init();
    }

    public init() {
        this.simulationStore = new SimulationStore();
        this.store = new AssociativeStore();
        this.sensorStore = new SensorStore();
        this.simColors = this.simulationStore.get()["colors"];
        this.bulkRun = this.simulationStore.get()["bulk"];
    }

    public deleteDevice = (d: Device) => {
        this.store.deleteItem(d._id);
    }

    public addDevice = (d: Device) => {

        // set this up by default
        d.plan = {
            loop: false,
            startup: [],
            timeline: [],
            random: [],
            receive: []
        }

        if (d.configuration.mockDeviceCloneId) {
            const origDevice: Device = Object.assign({}, this.store.getItem(d.configuration.mockDeviceCloneId) || {});
            if (Object.keys(origDevice).length != 0) {
                origDevice.running = false;
                d.configuration.capabilityUrn = origDevice.configuration.capabilityUrn;
                for (let i = 0; i < origDevice.comms.length; i++) {
                    let p = origDevice.comms[i];
                    const origPropertyId = p._id;
                    const newPropertyId = uuidV4();
                    p._id = newPropertyId;
                    if (p.mock) { p.mock._id = uuidV4(); }

                    for (const property in origDevice.plan.startup) {
                        if (origDevice.plan.startup[property].property === origPropertyId) { origDevice.plan.startup[property].property = newPropertyId };
                    }

                    for (const property in origDevice.plan.timeline) {
                        if (origDevice.plan.timeline[property].property === origPropertyId) { origDevice.plan.timeline[property].property = newPropertyId };
                    }

                    for (const property in origDevice.plan.random) {
                        if (origDevice.plan.random[property].property === origPropertyId) { origDevice.plan.random[property].property = newPropertyId };
                    }

                    for (const property in origDevice.plan.receive) {
                        if (origDevice.plan.receive[property].propertyIn === origPropertyId) { origDevice.plan.receive[property].propertyIn = newPropertyId };
                        if (origDevice.plan.receive[property].propertyOut === origPropertyId) { origDevice.plan.receive[property].propertyOut = newPropertyId };
                    }
                }
                d.comms = origDevice.comms;
                d.plan = origDevice.plan;
                d.configuration.planMode = origDevice.configuration.planMode;
            }
        }

        delete d.configuration._deviceList;
        delete d.configuration.mockDeviceCount;
        delete d.configuration.mockDeviceCountMax;
        delete d.configuration.machineState;
        delete d.configuration.machineStateClipboard;
        delete d.configuration.capabilityModel;

        // TODO: need to refactor double device Id problem
        d.configuration.deviceId = d._id;

        this.store.setItem(d, d._id);
        let md = new MockDevice(d, this.liveUpdatesService, this);
        this.runners[d._id] = md;
    }

    public renameDevice = (id: string, name: string) => {
        let d: Device = this.store.getItem(id);
        d.configuration.mockDeviceName = name;
        this.store.setItem(d, d._id);
    }

    public updateDevice = (id: string, payload: any, type?: string) => {

        let d: Device = this.store.getItem(id);
        let newId: string = type === 'configuration' ? Utils.getDeviceId(payload.connectionString) || payload.deviceId || id : id;

        this.stopDevice(d);
        delete this.runners[d._id];

        if (id != newId) {
            d._id = newId;
            d.configuration.deviceId = newId;
            this.store.deleteItem(id);
        }

        if (type === 'urn') Object.assign(d.configuration.capabilityUrn, payload.capabilityUrn);
        if (type === 'plan') { d.plan = payload; }
        if (type === 'configuration') Object.assign(d.configuration, payload);

        this.store.setItem(d, d._id);

        let md = new MockDevice(d, this.liveUpdatesService, this);
        this.runners[d._id] = md;

        return newId;
    }

    public addDeviceMethod = (id: string, override: any = {}) => {

        let d: Device = this.store.getItem(id);
        this.stopDevice(d);

        let method: Method = {
            "_id": uuidV4(),
            "_type": "method",
            "execution": 'direct',
            "enabled": true,
            "name": "method" + crypto.randomBytes(2).toString('hex'),
            "color": this.simColors["Color1"],
            "interface": {
                "name": "Interface 1",
                "urn": "urn:interface:device:1"
            },
            "status": 200,
            "receivedParams": null,
            "asProperty": false,
            "payload": JSON.stringify({ "result": "OK" }, null, 2)
        }

        Object.assign(method, override);
        d.comms.push(method);

        this.store.setItem(d, d._id);
        let rd: MockDevice = this.runners[d._id];
        rd.updateDevice(d);
    }

    /* method  !!! unsafe !!! */
    public addDeviceProperty = (id: string, type: string, override: any = {}): string => {
        let d: Device = this.store.getItem(id);
        let property: Property = null;
        let _id = uuidV4();
        switch (type) {
            case "d2c":
                property = {
                    "_id": _id,
                    "_type": "property",
                    "name": "d2cProperty",
                    "color": this.simColors["Default"],
                    "enabled": false,
                    "interface": {
                        "name": "Interface 1",
                        "urn": "urn:interface:device:1"
                    },
                    "string": false,
                    "value": 0,
                    "sdk": "msg",
                    "propertyObject": {
                        "type": "default"
                    },
                    "version": 0,
                    "type": {
                        "mock": false,
                        "direction": "d2c"
                    },
                    "runloop": {
                        "include": false,
                        "unit": "secs",
                        "value": 15
                    }
                }
                break;
            case "c2d":
                property = {
                    "_id": _id,
                    "_type": "property",
                    "enabled": true,
                    "name": "c2dProperty",
                    "color": this.simColors["Color2"],
                    "interface": {
                        "name": "Interface 1",
                        "urn": "urn:interface:device:1"
                    },
                    "string": false,
                    "value": 0,
                    "sdk": "twin",
                    "propertyObject": {
                        "type": "default"
                    },
                    "version": 0,
                    "type": {
                        "mock": false,
                        "direction": "c2d"
                    }
                }
                break;
        }

        property.name = property.name + '_' + crypto.randomBytes(2).toString('hex');
        delete override._id;
        Object.assign(property, override);
        d.comms.push(property);
        this.store.setItem(d, d._id);
        let rd: MockDevice = this.runners[d._id];
        rd.updateDevice(d);
        return _id;
    }

    /* method !! warning !! */
    public deleteDevicePropertyMock = (id: string, propertyId: string) => {
        this.deleteDeviceProperty(id, propertyId, true);
    }

    /* method !!! unsafe !!! */
    public refreshDeviceProperty = (id: string, propertyId: string) => {
        let d: Device = this.store.getItem(id);

        var index = d.comms.findIndex(function (item: Property, i: number) {
            return item._id === propertyId;
        });

        if (index > -1) {
            let rd: MockDevice = this.runners[d._id];
            let p: any = rd.readTwin();
            // if the handler captures all twin.on events this will ensure only the one that is applicable is updated.
            for (let key in p) {
                if (d.comms[index].name === key) {
                    if (d.comms[index].propertyObject.type === "templated") {
                        d.comms[index].propertyObject["template"] = JSON.stringify(p[key], null, 2);
                    }
                    d.comms[index].value = JSON.stringify(p[key]);
                    d.comms[index].version = parseInt(p["$version"]);
                }
            }
            this.store.setItem(d, d._id);
        }
    }

    /* method !!! unsafe !!! */
    public restartDevicePlan = (id: string) => {
        let rd: MockDevice = this.runners[id];
        rd.reconfigDeviceDynamically();
    }

    /* method !!! unsafe !!! */
    public updateDeviceProperty = (id: string, propertyId: string, payload: Property, sendValue: boolean) => {
        let d: Device = this.store.getItem(id);

        var index = d.comms.findIndex(function (item: Property, i: number) {
            return item._id === propertyId;
        });

        if (index > -1) {
            // update the source of truth
            let p: any = d.comms[index] = payload;
            p.version = payload.version;

            this.store.setItem(d, d._id);

            // update the copy of the running instance
            let rd: MockDevice = this.runners[d._id];
            rd.updateDevice(d);

            // build a reported payload and honor type
            let json: ValueByIdPayload = <ValueByIdPayload>{};
            let converted = Utils.formatValue(p.string, p.value);
            //TODO: Should deal with p.value not being set as it could be a Complex
            json[p._id] = converted

            // if this an immediate update, send to the runloop
            if (sendValue === true && p.sdk === "twin") { rd.updateTwin(json); }
            if (sendValue === true && p.sdk === "msg") { rd.updateMsg(json); }
        }
    }

    /* method modified safe */
    public addDevicePropertyMock = (id: string, propertyId: string, mockName?: string) => {

        let name = mockName || 'random'

        var items = this.sensorStore.getListOfItems();
        let i = items.findIndex((element) => {
            return element._type === name
        })

        let d: Device = this.store.getItem(id);
        var index = d.comms.findIndex(function (item: Property, i: number) {
            return item._id === propertyId;
        });

        if (d.comms[index]._type != "property") {
            return;
        }

        if (index > -1) {
            d.comms[index].type.mock = true;
            d.comms[index].mock = items[i];
            d.comms[index].runloop.include = true;
            d.comms[index].version = 0;
            d.comms[index].propertyObject.type = "default";
        }
        this.store.setItem(d, d._id);

        let rd: MockDevice = this.runners[d._id];
        rd.updateDevice(d);
    }

    /* method modified safe */
    public deleteDeviceProperty = (id: string, propertyId: string, mockOnly?: boolean) => {
        let d: Device = this.store.getItem(id);

        var index = d.comms.findIndex(function (item: Property, i: number) {
            return item._id === propertyId;
        });

        if (index > -1) {
            this.cleanPlan(d, d.comms[index]._id);
            if (d.comms[index]._type === "property" && mockOnly) {
                d.comms[index].type.mock = false;
                d.comms[index].runloop.include = false;
                delete d.comms[index].mock;
            } else {
                if (d.comms[index]._type === "method") {
                    this.stopDevice(d);
                }
                d.comms.splice(index, 1);
            }

            this.store.setItem(d, d._id);

            let rd: MockDevice = this.runners[d._id];
            rd.updateDevice(d);
        }
    }

    public cleanPlan = (device: Device, propertyId: string) => {
        const newPlan: any = {}
        newPlan.startup = device.plan.startup.filter((p) => { return p.property != propertyId })
        newPlan.timeline = device.plan.timeline.filter((p) => { return p.property != propertyId });
        newPlan.receive = device.plan.receive.filter((p) => { return p.propertyOut != propertyId });
        newPlan.random = device.plan.random.slice();
        device.plan = newPlan;
    }

    public updateDeviceMethod = (id: string, propertyId: string, payload: Property) => {

        let d: Device = this.store.getItem(id);
        this.stopDevice(d);

        var index = d.comms.findIndex(function (item: Property, i: number) {
            return item._id === propertyId;
        });

        if (index > -1) {
            // update the source of truth
            let p = d.comms[index] = payload;
            this.store.setItem(d, d._id);

            // update the copy of the running instance
            let rd: MockDevice = this.runners[d._id];
            rd.updateDevice(d);
        }
    }

    public getDeviceMethodParams = (id: string, methodId: string) => {
        let rd: MockDevice = this.runners[id];
        return rd.readMethodParams();
    }

    public startDevice = (device: Device) => {

        if (device.configuration._kind === 'template') { return; }

        try {
            let rd: MockDevice = this.runners[device._id];
            rd.start();

            let d: Device = this.store.getItem(device._id);
            d.running = true;
            this.store.setItem(d, d._id);
        }
        catch (err) {
            console.error("[DEVICE ERR] " + err.message);
        }
    }

    public stopDevice = (device: Device) => {

        if (device.configuration._kind === 'template') { return; }

        try {
            let rd: MockDevice = this.runners[device._id];
            rd.end();

            let d: Device = this.store.getItem(device._id);
            d.running = false;
            this.store.setItem(d, d._id);
        }
        catch (err) {
            console.error("[DEVICE ERR] " + err.message);
        }
    }

    public startAll = () => {

        if (this.bulkRun != null && this.bulkRun["mode"] === 'random') {
            this.startAllRandom();
            return;
        }

        let devices: Array<Device> = this.store.getAllItems();
        let count = devices.length;
        let from: number = 0;
        let to: number = 10;
        const batch = this.bulkRun != null && this.bulkRun["mode"] ? this.bulkRun["mode"]["batch"]["size"] : 10;

        this.startAllBatch(from, count > to ? to : count, devices)
        let timer = setInterval(() => {
            from = to;
            if (to + batch > count) {
                to = count;
                clearInterval(timer);
            } else {
                to += batch;
            }
            if (to <= devices.length) { this.startAllBatch(from, to, devices); }
        }, this.bulkRun["mode"] ? this.bulkRun["mode"]["batch"]["delay"] : 5000);
    }

    public startAllRandom = () => {

        const min = this.bulkRun["random"]["min"];
        const max = this.bulkRun["random"]["max"];

        let devices: Array<Device> = this.store.getAllItems();

        for (let i = 0; i < devices.length; i++) {
            if (devices[i].configuration._kind === 'template') { continue; }
            if (devices[i].running) { continue; }
            const delay = Utils.getRandomNumberBetweenRange(min, max, true);
            this.liveUpdatesService.sendConsoleUpdate(`[${new Date().toISOString()}][${devices[i]._id}] DEVICE DELAYED START SECONDS: ${delay / 1000}`);
            setTimeout(() => {
                this.startDevice(devices[i]);
            }, delay)
        }
    }

    public startAllBatch = (from: number, to: number, devices: Array<Device>) => {
        for (let i = from; i < to; i++) {
            if (devices[i].running) { continue; }
            this.startDevice(devices[i]);
        }
    }

    public stopAll = () => {
        let devices: Array<Device> = this.store.getAllItems();
        for (let i = 0; i < devices.length; i++) {
            if (devices[i].running) { this.stopDevice(devices[i]); }
        }
    }

    public exists = (id: string) => {
        return this.store.getItem(id);
    }

    public maxReached = () => {
        return !(this.store.count() < Config.MAX_NUM_DEVICES);
    }

    public getListOfItems = () => {
        let devices: Array<Device> = this.store.getAllItems();

        for (const d in devices) {
            //TODO: _id refactor into configuration
            const rd: MockDevice = this.runners[devices[d]._id];
            devices[d].running = rd && rd.getRunning() || false;
        }

        return devices;
    }

    public createFromArray = (items: Array<Device>) => {
        this.store.createStoreFromArray(items);

        // re-establish running store
        for (let i = 0; i < items.length; i++) {
            let rd = new MockDevice(items[i], this.liveUpdatesService, this);
            this.runners[items[i]._id] = rd;
        }
    }
}