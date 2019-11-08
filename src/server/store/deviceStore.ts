import { Config } from '../config';
import { AssociativeStore } from '../framework/AssociativeStore'
import { SensorStore } from './sensorStore'
import { Method, Device, Property, MockSensor } from '../interfaces/device';
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

    private simulationStore = new SimulationStore();
    private simColors = this.simulationStore.get()["colors"];

    constructor(messageService: MessageService) {
        this.store = new AssociativeStore();
        this.sensorStore = new SensorStore();
        this.liveUpdatesService = messageService;
    }

    public deleteDevice = (d: Device) => {
        this.store.deleteItem(d._id);
    }

    public addDevice = (d: Device) => {

        if (d.configuration.mockDeviceCloneId && d.configuration.mockDeviceCloneId != null) {
            let origDevice: Device = JSON.parse(JSON.stringify(this.store.getItem(d.configuration.mockDeviceCloneId)));
            origDevice.running = false;
            for (let i = 0; i < origDevice.comms.length; i++) {
                let p = origDevice.comms[i];
                p._id = uuidV4();
                if (p.mock) { p.mock._id = uuidV4(); }
            }
            d.comms = origDevice.comms;
            delete d.configuration.mockDeviceCloneId;
        }

        this.store.setItem(d, d._id);
        let md = new MockDevice(d, this.liveUpdatesService, this);
        this.runners[d._id] = md;
    }

    public renameDevice = (id: string, name: string) => {
        let d: Device = this.store.getItem(id);
        d.configuration.mockDeviceName = name;
        this.store.setItem(d, d._id);
    }

    public updateDevice = (id: string, payload: any) => {

        let d: Device = this.store.getItem(id);
        let newId: string = Utils.getDeviceId(payload.connectionString) || payload.deviceId;

        this.stopDevice(d);
        delete this.runners[d._id];

        if (id != newId) {
            d._id = newId;
            this.store.deleteItem(id);
        }
        Object.assign(d.configuration, payload);
        this.store.setItem(d, d._id);

        let md = new MockDevice(d, this.liveUpdatesService, this);
        this.runners[d._id] = md;
    }

    public addDeviceMethod = (id: string, override: any = {}) => {

        let d: Device = this.store.getItem(id);
        this.stopDevice(d);

        let method: Method = {
            "_id": uuidV4(),
            "_type": "method",
            "enabled": true,
            "name": "method" + crypto.randomBytes(2).toString('hex'),
            "color": this.simColors["Color1"],
            "interface": "(single interface only)",
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
                    "interface": "(single interface only)",
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
                    "interface": "(single interface only)",
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

        let d: Device = this.store.getItem(id);
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

            if (d.comms[index]._type === "property" && mockOnly) {
                d.comms[index].type.mock = false;
                d.comms[index].runloop.include = false;
                delete d.comms[index].mock;
            } else {
                d.comms.splice(index, 1);
            }

            this.store.setItem(d, d._id);

            let rd: MockDevice = this.runners[d._id];
            rd.updateDevice(d);
        }
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
        let devices: Array<Device> = this.store.getAllItems();
        let count = devices.length;
        let from: number = 0;
        let to: number = 10;

        this.startAllBatch(from, count > to ? to : count, devices)
        let timer = setInterval(() => {
            from = to;
            if (to + 10 > count) {
                to = count;
                clearInterval(timer);
            } else {
                to += 10;
            }
            if (to <= devices.length) { this.startAllBatch(from, to, devices); }
        }, 5000);
    }

    public startAllBatch = (from: number, to: number, devices: Array<Device>) => {
        for (let i = from; i < to; i++) {
            this.startDevice(devices[i]);
        }
    }

    public stopAll = () => {
        let devices: Array<Device> = this.store.getAllItems();
        for (let i = 0; i < devices.length; i++) {
            this.stopDevice(devices[i]);
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

        // re-establish running store
        for (let i = 0; i < items.length; i++) {
            let rd = new MockDevice(items[i], this.liveUpdatesService, this);
            this.runners[items[i]._id] = rd;
        }
    }
}