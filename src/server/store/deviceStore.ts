import { Config } from '../config';
import { AssociativeStore } from '../framework/AssociativeStore'
import { SensorStore } from './sensorStore'
import { Method, Device, Property } from '../interfaces/device';
import { MockDevice } from '../core/mockDevice';
import { ValueByIdPayload } from '../interfaces/payload';
import * as uuidV4 from 'uuid/v4';
import * as Utils from '../core/utils';
import * as crypto from 'crypto';
import { SimulationStore } from '../store/simulationStore';

export class DeviceStore {

    private store: AssociativeStore<Device>;

    private runners: any = null;

    private sensorStore: SensorStore;

    private messageService = null;

    private simulationStore = null;
    private simColors = null;
    private bulkRun = null;
    private runloop = null;

    constructor(messageService) {
        this.messageService = messageService;
        this.init();
    }

    public init() {
        this.simulationStore = new SimulationStore();
        this.store = new AssociativeStore();
        this.sensorStore = new SensorStore();
        this.runners = {};

        this.simColors = this.simulationStore.get()["colors"];
        this.bulkRun = this.simulationStore.get()["bulk"];
        this.runloop = this.simulationStore.get()["runloop"];
    }

    public reset() {
        this.stopAll();
        this.messageService.clearState();
        this.init();
    }

    public deleteDevice = (d: Device) => {
        this.store.deleteItem(d._id);
    }

    public addDeviceModule = (deviceId, moduleId, cloneId): string => {
        const d: Device = new Device();
        const moduleKey = Utils.getModuleKey(deviceId, moduleId);
        d._id = moduleKey
        d.configuration._kind = 'module';
        d.configuration.deviceId = moduleKey;
        d.configuration.mockDeviceCloneId = cloneId;
        d.configuration.mockDeviceName = moduleKey;
        return this.addDevice(d)
    }

    public removeDeviceModule = (d: Device, moduleId: string) => {
        const i = d.configuration.modules.indexOf(moduleId);
        if (i > -1) {
            const payload = {
                modules: d.configuration.modules.splice(i, 1)
            }
            this.updateDevice(d._id, payload);
        }
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

        if (d.configuration.mockDeviceCloneId) { this.cloneDeviceCommsAndPlan(d, d.configuration.mockDeviceCloneId); }

        delete d.configuration._deviceList;
        delete d.configuration.mockDeviceCount;
        delete d.configuration.mockDeviceCountMax;
        delete d.configuration.machineState;
        delete d.configuration.machineStateClipboard;

        // TODO: need to refactor double device Id problem
        d.configuration.deviceId = d._id;

        this.store.setItem(d, d._id);
        let md = new MockDevice(d, this.messageService);
        this.runners[d._id] = md;

        return d._id;
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
        if (type === 'module') {
            if (!d.configuration.modules) { d.configuration.modules = []; }
            const key = Utils.getModuleKey(id, payload.moduleId);
            const findIndex = d.configuration.modules.findIndex((m) => { return m === key; })
            if (findIndex === -1) {
                d.configuration.modules.push(this.addDeviceModule(id, payload.moduleId, payload.mockDeviceCloneId));
            } else {
                throw "This module has already been added"; //REFACTOR: new type of error
            }
        };

        this.store.setItem(d, d._id);

        let md = new MockDevice(d, this.messageService);
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
                    "enabled": true,
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
                        "_ms": 0,
                        "include": false,
                        "unit": "secs",
                        "value": this.runloop["secs"]["min"],
                        "valueMax": this.runloop["secs"]["max"]
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
                        d.comms[index].propertyObject["template"] = p[key] ? JSON.stringify(p[key], null, 2) : p[key];
                    }
                    d.comms[index].value = p[key] ? JSON.stringify(p[key], null, 2) : p[key];
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
            d.comms[index] = payload;
            this.store.setItem(d, d._id);

            // update the copy of the running instance
            let rd: MockDevice = this.runners[d._id];
            rd.updateDevice(d);

            if (d.comms[index]._type != 'property') { return; }

            // build a reported payload and honor type
            let json: ValueByIdPayload = <ValueByIdPayload>{};
            let converted = Utils.formatValue(d.comms[index].string, d.comms[index].value);
            //TODO: Should deal with p.value not being set as it could be a Complex
            json[d.comms[index]._id] = converted

            // if this an immediate update, send to the runloop
            if (sendValue === true && d.comms[index].sdk === "twin") { rd.updateTwin(json); }
            if (sendValue === true && d.comms[index].sdk === "msg") { rd.updateMsg(json); }
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
        this.stopDevice(this.store.getItem(id));
        this.updateDeviceProperty(id, propertyId, payload, false);
    }

    //TODO: this needs to be refactored to work like the twin version
    public getDeviceMethodParams = (id: string, methodId: string) => {
        let rd: MockDevice = this.runners[id];
        return rd.readMethodParams();
    }

    public startDevice = (device: Device, delay?: number) => {

        if (device.configuration._kind === 'template') { return; }

        try {
            let rd: MockDevice = this.runners[device._id];
            if (rd) { rd.start(delay || undefined); }
        }
        catch (err) {
            console.error("[DEVICE ERR] " + err.message);
        }
    }

    public stopDevice = (device: Device) => {
        if (device.configuration._kind === 'template') { return; }
        let rd: MockDevice = this.runners[device._id];
        if (rd) { rd.stop(); }
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

        for (let index in devices) {
            const delay = Utils.getRandomNumberBetweenRange(min, max, true);
            this.startDevice(devices[index], delay);
        }
    }

    public startAllBatch = (from: number, to: number, devices: Array<Device>) => {
        for (let index = from; index < to; index++) { this.startDevice(devices[index]); }
    }

    public stopAll = () => {
        let errorCount = 0;
        const devices: Array<Device> = this.store.getAllItems();

        for (let index in devices) {
            try {
                this.stopDevice(devices[index]);
            } catch (err) {
                errorCount++;
                console.error(`[ERROR SHUTDOWN DEVICES RUNNER] ${devices[index]._id}`)
            }
        }

        if (errorCount === 0) {
            this.messageService.clearState();
            this.messageService.sendAsControlPlane({ "__clear": ["DEV", "PROC", "OFF"] });
        }
    }

    public exists = (id: string) => {
        return this.store.getItem(id);
    }

    public maxReached = () => {
        return !(this.store.count() < Config.MAX_NUM_DEVICES);
    }

    public getListOfItems = () => {
        return this.store.getAllItems();
    }

    public createFromArray = (items: Array<Device>) => {
        this.store.createStoreFromArray(items);
        for (const index in items) {
            let rd = new MockDevice(items[index], this.messageService);
            this.runners[items[index]._id] = rd;
        }
    }

    public reapplyTemplate(templateId: string, deviceList: Array<string>, applyAll: boolean) {
        const template = this.store.getItem(templateId);
        if (!template) { return; }

        const devices = this.store.getAllItems();
        for (let index in devices) {
            if (!applyAll && deviceList.indexOf(devices[index]._id) === -1) { continue; }
            if (devices[index].configuration._kind === 'edge' || devices[index].configuration._kind === 'template') { continue; }
            this.stopDevice(devices[index]);
            this.cloneDeviceCommsAndPlan(devices[index], templateId);
      
            let rd: MockDevice = this.runners[devices[index]._id];
            if (rd) { rd.updateDevice(devices[index]); }
        }
    }

    private cloneDeviceCommsAndPlan(device: Device, cloneId: string) {
        const origDevice: Device = JSON.parse(JSON.stringify(this.store.getItem(cloneId)));
        if (Object.keys(origDevice).length != 0) {
            device.configuration.capabilityUrn = origDevice.configuration.capabilityUrn;
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
                    if (origDevice.plan.receive[property].property === origPropertyId) { origDevice.plan.receive[property].property = newPropertyId };
                    if (origDevice.plan.receive[property].propertyOut === origPropertyId) { origDevice.plan.receive[property].propertyOut = newPropertyId };
                }
            }
            device.comms = origDevice.comms;
            device.plan = origDevice.plan;
            device.configuration.planMode = origDevice.configuration.planMode;
            device.configuration.mockDeviceCloneId = cloneId;
        }
    }
}