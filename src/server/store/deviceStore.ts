import { Config } from '../config';
import { AssociativeStore } from '../framework/AssociativeStore'
import { SensorStore } from './sensorStore'
import { Method, Device, Property } from '../interfaces/device';
import { MockDevice, LOGGING_TAGS } from '../core/mockDevice';
import { ValueByIdPayload } from '../interfaces/payload';
import * as uuidV4 from 'uuid/v4';
import * as Utils from '../core/utils';
import * as crypto from 'crypto';
import { SimulationStore } from '../store/simulationStore';

export class DeviceStore {

    private store: AssociativeStore<Device>;

    private runners: { [deviceId: string]: MockDevice } = null;
    private edgeManagers: any = {};

    private sensorStore: SensorStore;

    private messageService = null;

    private simulationStore = null;
    private simColors = null;
    private bulkRun = null;
    private runloop = null;

    private plugIns = null;

    constructor(messageService, plugIns) {
        this.messageService = messageService;
        this.plugIns = plugIns;
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
        if (d.configuration.modules) {
            for (const index in d.configuration.modules) {
                this.store.deleteItem(d.configuration.modules[index]);
                this.messageService.removeStatsOrControl(d.configuration.modules[index]);
            }
        }
        this.store.deleteItem(d._id);
        this.messageService.removeStatsOrControl(d._id);
    }

    public addDeviceModule = (deviceId, moduleId, cloneId, gatewayScopeId, gatewaySasKey, type, isMasterKey: boolean, plugIn: string): string => {
        const d: Device = new Device();
        const moduleKey = Utils.getModuleKey(deviceId, moduleId);
        d._id = moduleKey;
        d.configuration._kind = type;
        d.configuration.deviceId = moduleKey;
        d.configuration.mockDeviceCloneId = cloneId;
        d.configuration.mockDeviceName = moduleKey;
        d.configuration.gatewayDeviceId = deviceId;
        d.configuration.gatewayScopeId = gatewayScopeId;
        d.configuration.gatewaySasKey = gatewaySasKey;
        d.configuration.isMasterKey = isMasterKey;
        d.configuration.plugIn = plugIn;
        return this.addDevice(d);
    };

    //TODO: refactor. moduleId working is a ok but naming is all wrong now
    public removeDeviceModule = (d: Device, moduleId: string) => {
        let i = d.configuration.modules ? d.configuration.modules.indexOf(moduleId) : -1;
        if (i > -1) {
            const payload = {
                modules: d.configuration.modules.splice(i, 1),
            };
            this.updateDevice(d._id, payload);
            return;
        }

        i = d.configuration.leafDevices ? d.configuration.leafDevices.indexOf(moduleId) : -1;
        if (i > -1) {
            const payload = {
                leafDevices: d.configuration.leafDevices.splice(i, 1),
            };
            this.updateDevice(d._id, payload);
        }
    };

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

        const modules = d.configuration._modules?.slice() || [];

        delete d.configuration._deviceList;
        delete d.configuration._plugIns;
        delete d.configuration._modules;
        delete d.configuration.mockDeviceCount;
        delete d.configuration.mockDeviceCountMax;
        delete d.configuration.machineState;
        delete d.configuration.machineStateClipboard;

        // TODO: need to refactor double device Id problem
        d.configuration.deviceId = d._id;

        this.store.setItem(d, d._id);
        let md = new MockDevice(d, this.messageService, this.resolvePlugin(d, this.plugIns), this.updateDeviceConfiguration.bind(this));
        this.runners[d._id] = md;

        for (const module of modules) {
            this.updateDevice(d._id, {
                _kind: 'module',
                deviceId: d.configuration.deviceId,
                scopeId: d.configuration.scopeId,
                sasKey: d.configuration.sasKey,
                isMasterKey: d.configuration.isMasterKey,
                connectionString: d.configuration.connectionString,
                moduleId: module['id'],
                plugIn: d.configuration.plugIn,
                mockDeviceCloneId: module['templateId']
            }, 'module');
        }
        return d._id;
    }

    public renameDevice = (id: string, name: string) => {
        let d: Device = this.store.getItem(id);
        d.configuration.mockDeviceName = name;
        this.store.setItem(d, d._id);
    }

    // EDGE
    public updateDevice = (id: string, payload: any, type?: string) => {

        let d: Device = this.store.getItem(id);
        let newId: string = type === 'configuration' ? Utils.getDeviceId(payload.connectionString) || payload.deviceId || id : id;

        if (type != undefined && type != 'module') {
            this.stopDevice(d);
            delete this.runners[d._id];
        }

        if (id != newId) {
            d._id = newId;
            d.configuration.deviceId = newId;
            this.store.deleteItem(id);
        }

        if (type === 'urn') { Object.assign(d.configuration.capabilityUrn, payload.capabilityUrn); }
        if (type === 'plan') { d.plan = payload; }
        if (type === 'configuration') Object.assign(d.configuration, payload);
        if (type === 'module') {
            if (!d.configuration.modules) { d.configuration.modules = []; }

            const key = Utils.getModuleKey(id, payload.moduleId);
            const findIndex = d.configuration.modules.findIndex((m) => { return m === key; });

            if (findIndex === -1) {
                d.configuration.modules.push(this.addDeviceModule(id, payload.moduleId, payload.mockDeviceCloneId, payload.scopeId, payload.sasKey, payload._kind, payload.isMasterKey || false, payload.plugIn || ''));
                if (!d.configuration.modulesDocker) { d.configuration.modulesDocker = {}; }
                d.configuration.modulesDocker[Utils.getModuleKey(id, payload.moduleId)] = payload._kind === "module" ? false : true;
            } else {
                throw 'This module has already been added'; //REFACTOR: new type of error
            }
        }

        if (type === 'leafDevice') {
            if (!d.configuration.leafDevices) {
                d.configuration.leafDevices = [];
            }

            const findIndex = d.configuration.leafDevices.findIndex((m) => {
                return m === id;
            });
            if (findIndex === -1) {
                let items = this.getListOfItems();
                let capacity = Config.MAX_NUM_DEVICES - items.length;

                let from = parseInt(payload.mockDeviceCount);
                const to = parseInt(payload.mockDeviceCountMax) + 1;
                const count = to - from === 0 ? 1 : to - from;

                let maxCount = count > capacity ? capacity : count;

                for (let i = 0; i < maxCount; i++) {
                    let leafDevice: Device = new Device();

                    let createId = null;
                    if (payload._kind === 'dps' || payload._kind === 'leafDevice') {
                        createId = payload.deviceId;
                    } else if (payload._kind === 'hub') {
                        createId = Utils.getDeviceId(payload.connectionString);
                    } else {
                        createId = payload.deviceId;
                    }

                    createId = count > 1 ? createId + '-' + from : createId;
                    if (this.exists(createId)) {
                        throw new Error('This leafDevice has already been added'); //REFACTOR: new type of error
                    }

                    const rename = !payload.mockDeviceName ? createId : payload.mockDeviceName === '' ? createId : count > 1 ? payload.mockDeviceName + '-' + count : payload.mockDeviceName;
                    leafDevice._id = createId;
                    leafDevice.configuration = JSON.parse(JSON.stringify(payload));
                    leafDevice.configuration.mockDeviceName = rename;
                    leafDevice.configuration.deviceId = createId;
                    this.addDevice(leafDevice);
                    d.configuration.leafDevices.push(createId);
                    from++;
                }
            } else {
                throw 'This leafDevice has already been added';
            }
        }

        this.store.setItem(d, d._id);

        // if edge, also re-add its modules
        //TODO: needed for modules?
        let md = new MockDevice(d, this.messageService, this.resolvePlugin(d, this.plugIns), this.updateDeviceConfiguration.bind(this));
        this.runners[d._id] = md;

        return newId;
    };

    public addDeviceMethod = (id: string, override: any = {}, insert: boolean) => {

        let d: Device = this.store.getItem(id);
        this.stopDevice(d);

        let method: Method = {
            "_id": uuidV4(),
            "_type": "method",
            "execution": 'direct',
            "enabled": true,
            "name": "method" + crypto.randomBytes(2).toString('hex'),
            "component": {
                "enabled": false,
                "name": "Component"
            },
            "color": this.simColors["Color1"],
            "status": "200",
            "receivedParams": null,
            "asProperty": false,
            "payload": JSON.stringify({ "result": "OK" }, null, 2)
        }

        Object.assign(method, override);
        d.comms[insert ? 'unshift' : 'push'](method);

        this.store.setItem(d, d._id);
        let rd: MockDevice = this.runners[d._id];
        rd.updateDevice(d, false);
    }

    /* method  !!! unsafe !!! */
    public addDeviceProperty = (id: string, type: string, override: any = {}, insert: boolean): string => {
        let d: Device = this.store.getItem(id);
        let property: Property = null;
        let _id = uuidV4();
        switch (type) {
            case "d2c":
                property = {
                    "_id": _id,
                    "_type": "property",
                    "name": "d2cProperty",
                    "component": {
                        "enabled": false,
                        "name": "Component"
                    },
                    "color": this.simColors["Default"],
                    "enabled": true,
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
                    "component": {
                        "enabled": false,
                        "name": "Component"
                    },
                    "color": this.simColors["Color2"],
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
        d.comms[insert ? 'unshift' : 'push'](property);
        this.store.setItem(d, d._id);
        let rd: MockDevice = this.runners[d._id];
        rd.updateDevice(d, false);
        return _id;
    }

    /* method !! warning !! */
    public deleteDevicePropertyMock = (id: string, propertyId: string) => {
        this.deleteDeviceProperty(id, propertyId, true);
    }

    public getDeviceProperty = (id: string, propertyId: string) => {
        const d: Device = this.store.getItem(id);
        var index = d.comms.findIndex(function (item: Property, i: number) {
            return item._id === propertyId;
        });
        return index != -1 ? d.comms[index] : null;
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
        rd.reconfigDeviceDynamically(false);
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
            rd.updateDevice(d, sendValue);

            if (d.comms[index]._type != 'property') { return; }
            if (!sendValue) { return; }

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
        rd.updateDevice(d, false);
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
            rd.updateDevice(d, false);
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

    // EDGE
    public startDevice = (device: Device, delay?: number, shallowStart?: boolean) => {
        if (device.configuration._kind === 'template') { return; }

        try {

            // if there is a gateway device i.e. this device is a module or leaf device start the gateway
            if (device.configuration.gatewayDeviceId) {
                const gatewayDevice: MockDevice = this.runners[device.configuration.gatewayDeviceId];
                if (gatewayDevice.getControlStatus() === LOGGING_TAGS.LOG.EV.OFF) {
                    const gd = this.store.getItem(device.configuration.gatewayDeviceId);
                    this.startDevice(gd, 0, true);
                }

                // if the device is a module then ensure the gateway has start before starting
                if (device.configuration._kind === 'module') {
                    let moduleTimer = setInterval(() => {
                        if (gatewayDevice.getControlStatus() === LOGGING_TAGS.LOG.EV.CONNECTED) {
                            clearInterval(moduleTimer);
                            let md: MockDevice = this.runners[device._id];
                            md.start(0, gatewayDevice.getIoTHubHostname());
                        }
                    }, 2000);
                    return // needed
                }
            }

            // this will start every type of device except module and template
            let rd: MockDevice = this.runners[device._id];
            rd.start(delay || 0);


            // if we are starting a edge device, start everything under it
            if (device.configuration._kind === 'edge') {

                this.edgeManagers[device.configuration.deviceId] = setInterval(() => {
                    const moduleStatus: any = {};
                    for (const compositeKey of device.configuration.modules) {
                        const runner = this.runners[compositeKey];
                        const { deviceId, moduleId } = Utils.decodeModuleKey(compositeKey);
                        moduleStatus[moduleId] = runner.getControlStatus() === LOGGING_TAGS.LOG.EV.CONNECTED ? true : false;
                    }
                    rd.updateEdgeModules(moduleStatus);
                }, 10000);

                for (const id of device.configuration.modules) {
                    let md: MockDevice = this.runners[id];
                    if (!md.getRunningStatus()) { md.waitForInstruction(); }
                }

                const min = this.bulkRun["random"]["min"];
                const max = this.bulkRun["random"]["max"];

                if (!shallowStart && device.configuration.leafDevices) {
                    for (const id of device.configuration.leafDevices) {
                        const delay = Utils.getRandomNumberBetweenRange(min, max, true);
                        const leafDevice = this.store.getItem(id);
                        this.startDevice(leafDevice, delay)
                    }
                }

                let startAllTimer = setInterval(() => {
                    if (rd.getControlStatus() === LOGGING_TAGS.LOG.EV.CONNECTED) {
                        clearInterval(startAllTimer);

                        for (const id of device.configuration.modules) {
                            const module = this.store.getItem(id);
                            this.startDevice(module, 0)
                        }
                    }
                }, 2000);
            }

        } catch (err) {
            console.error('[DEVICE ERR] ' + err.message);
        }
    }

    //EDGE
    public stopDevice = (device: Device) => {
        if (device.configuration._kind === 'template') { return; }

        if (device.configuration.modules) {
            for (const id of device.configuration.modules) {
                const d = this.store.getItem(id);
                if (d) {
                    this.stopDevice(d);
                }
            }
            clearInterval(this.edgeManagers[device.configuration.deviceId]);
            this.edgeManagers[device.configuration.deviceId] = false;
            // TODO: needs better orchestration but will do for now
        }

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
        if (!items) { return; }
        this.store.createStoreFromArray(items);
        for (const index in items) {
            let rd = new MockDevice(items[index], this.messageService, this.resolvePlugin(items[index], this.plugIns), this.updateDeviceConfiguration.bind(this));
            this.runners[items[index]._id] = rd;
        }
    }

    public reapplyTemplate(templateId: string, deviceList: Array<string>, applyAll: boolean) {
        const template = this.store.getItem(templateId);
        if (!template) { return; }

        const devices = this.store.getAllItems();
        for (let index in devices) {
            if (!applyAll && deviceList.indexOf(devices[index]._id) === -1) { continue; }
            this.stopDevice(devices[index]);
            this.cloneDeviceCommsAndPlan(devices[index], templateId);
            devices[index].configuration.capabilityUrn = template.configuration.capabilityUrn;

            let rd: MockDevice = this.runners[devices[index]._id];
            if (rd) { rd.updateDevice(devices[index], false); }
        }
    }

    // BETA - This should only be called when the device has its configuration updated by the device itself.
    private updateDeviceConfiguration(configuration: any) {
        const device: Device = this.store.getItem(configuration.deviceId);
        device.configuration = configuration;
        this.store.setItem(device, device._id);
    }

    // BETA
    public getCommonCapabilities(deviceList: Array<string>, applyAll: boolean) {

        const capabilities = [];
        const devices: any = applyAll ? this.store.getAllItems() : deviceList;

        for (const i in devices) {
            const deviceId = applyAll ? devices[i].configuration.deviceId : devices[i];
            const device = this.store.getItem(deviceId);
            if (device) {
                for (let index in device.comms) {
                    if (capabilities.indexOf(device.comms[index].name) === -1) {
                        capabilities.push(device.comms[index].name);
                    }
                }
            }
        }
        return capabilities;
    }

    // BETA
    public setCommonCapabilities(update: any) {

        const { devicesList, capabilitiesList, allDevices, allCapabilities, payload } = update;
        const devices: any = allDevices ? this.store.getAllItems() : devicesList;

        for (const i in devices) {
            const deviceId = allDevices ? devices[i].configuration.deviceId : devices[i];
            const device = this.store.getItem(deviceId);

            if (!device) { continue; }

            for (let index in device.comms) {
                const comm = device.comms[index];

                if (allCapabilities || capabilitiesList.indexOf(comm.name) > -1) {
                    // common to all
                    if (payload.include.component) { comm.component = { "enabled": payload.data.component ? true : false, "name": payload.data.component || '' } }
                    if (payload.include.geo) { device.configuration.geo = parseInt(payload.data.geo || 0); }

                    // these are only applicable to properties
                    if (comm['_type'] === 'property' && comm.type.direction === 'd2c') {
                        if (payload.include.override) {
                            if (!comm.runloop) { comm.runloop = {}; }
                            comm.runloop.include = true;
                            comm.runloop.override = payload.data.override || false;
                        }
                        if (payload.include.loop || (comm.runloop && !comm.runloop.override)) {
                            comm.runloop = {
                                "include": true,
                                "unit": payload.data.loop_unit || 'secs',
                                "value": payload.data.loop_min || 30,
                                "valueMax": payload.data.loop_max || 90,
                            }
                        }
                        if (payload.include.startup) {
                            if (!comm.runloop) { comm.runloop = {}; }
                            comm.runloop.onStartUp = payload.data.startup || false;
                        }
                        if (payload.include.value) {
                            if (!payload.data.value) {
                                // empty/null/clear
                                comm.value = Utils.formatValue(comm.string, 0);
                            } else if (Utils.isNumeric(payload.data.value)) {
                                // number first because JSON/string can never be a number
                                comm.value = parseFloat(payload.data.value);
                            } else if ((payload.data.value.startsWith('[') && payload.data.value.endsWith(']')) ||
                                (payload.data.value.startsWith('{') && payload.data.value.endsWith('}'))) {
                                // JSON 2nd but check string for special characters    
                                try {
                                    JSON.parse(payload.data.value)
                                    comm.propertyObject = {
                                        "type": "templated",
                                        "template": payload.data.value
                                    }
                                } catch {
                                    // This is a malformed JSON. save it as the value
                                    comm.value = Utils.formatValue(comm.string, payload.data.value);
                                }
                            } else {
                                // Catches all other primitives
                                comm.propertyObject.type = "default";
                                comm.value = Utils.formatValue(comm.string, payload.data.value);
                            }
                        }
                    }
                }
            }

            // // make sure things get reconfigured
            let rd: MockDevice = this.runners[deviceId];
            if (rd) { rd.updateDevice(device, false); }
        }
    }

    private cloneDeviceCommsAndPlan(device: Device, cloneId: string) {
        const origDevice: Device = JSON.parse(JSON.stringify(this.store.getItem(cloneId)));
        if (Object.keys(origDevice).length != 0) {
            device.configuration.capabilityUrn = origDevice.configuration.capabilityUrn;

            const cache = {};
            for (let p of origDevice.comms) {
                const origPropertyId = p._id;
                const newPropertyId = uuidV4();
                p._id = newPropertyId;
                if (p.mock) { p.mock._id = uuidV4(); }
                cache[origPropertyId] = newPropertyId;

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

            // second pass required once all old to new ids are known
            for (let p of origDevice.comms) { if (cache[p.asPropertyId]) { p.asPropertyId = cache[p.asPropertyId]; } }

            device.comms = origDevice.comms;
            device.plan = origDevice.plan;
            device.configuration.planMode = origDevice.configuration.planMode;
            device.configuration.mockDeviceCloneId = cloneId;
        }
    }

    private resolvePlugin(device: Device, plugIns) {
        if (device.configuration.plugIn && device.configuration.plugIn !== '') {
            return plugIns[device.configuration.plugIn] || undefined;
        } else {
            return undefined;
        }
    }


}
