import { Router } from 'express';
import { DeviceStore } from '../store/deviceStore'
import { Device } from '../interfaces/device'
import * as Utils from '../core/utils'
import { ConnectionString } from 'azure-iot-common';
import { IotHub } from '../core/iotHub';
import uuid = require('uuid');
import * as  Config from '../config';
import { SimulationStore } from '../store/simulationStore';

export default function (deviceStore: DeviceStore) {
    let simulationStore = new SimulationStore();
    let simRunloop = simulationStore.get()["runloop"];
    let simSemantics = simulationStore.get()["semantics"];

    let api = Router();

    api.get('/:id', function (req, res, next) {
        var id = req.params.id;
        res.json(deviceStore.exists(id));
        res.end();
    });

    api.put('/:id', function (req, res, next) {
        var id = req.params.id;
        deviceStore.updateDevice(id, req.body);
        res.json(deviceStore.getListOfItems());
        res.end();
    });

    api.get('/:id/start', function (req, res, next) {
        var id = req.params.id;
        deviceStore.startDevice(deviceStore.exists(id));
        res.json(deviceStore.getListOfItems());
        res.end();
    });

    api.get('/:id/stop', function (req, res, next) {
        var id = req.params.id;
        deviceStore.stopDevice(deviceStore.exists(id));
        res.json(deviceStore.getListOfItems());
        res.end();
    });

    api.post('/:id/delete', function (req, res, next) {
        var id = req.params.id;
        deviceStore.stopDevice(deviceStore.exists(id));
        deviceStore.deleteDevice(deviceStore.exists(id));
        res.json(deviceStore.getListOfItems());
        res.end();
    });

    api.post('/:id/rename', function (req, res, next) {
        var id = req.params.id;
        var body = req.body;
        deviceStore.renameDevice(id, body.name);
        res.json(deviceStore.getListOfItems());
        res.end();
    });

    api.post('/:id/property/new', function (req, res, next) {
        var id = req.params.id;
        var body = req.body;
        deviceStore.addDeviceProperty(id, body.type);
        res.json(deviceStore.exists(id));
        res.end();
    });

    api.post('/:id/method/new', function (req, res, next) {
        var id = req.params.id;
        deviceStore.addDeviceMethod(id);
        res.json(deviceStore.exists(id));
        res.end();
    });

    api.delete('/:id/property/:propertyId', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        var body = req.body;
        deviceStore.deleteDeviceProperty(id, propertyId);
        // must return the device
        res.json(deviceStore.exists(id));
        res.end();
    });

    api.delete('/:id/method/:methodId', function (req, res, next) {
        var id = req.params.id;
        var methodId = req.params.methodId;
        deviceStore.deleteDeviceProperty(id, methodId);
        // must return the device
        res.json(deviceStore.exists(id));
        res.end();
    });

    api.put('/:id/property/:propertyId', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        var body = req.body;
        deviceStore.updateDeviceProperty(id, propertyId, body, false);
        // must return the device
        res.json(deviceStore.exists(id));
        res.end();
    });

    api.put('/:id/method/:methodId', function (req, res, next) {
        var id = req.params.id;
        var methodId = req.params.methodId;
        var body = req.body;
        deviceStore.updateDeviceMethod(id, methodId, body);
        // must return the device
        res.json(deviceStore.exists(id));
        res.end();
    });

    api.post('/:id/property/:propertyId/mock/new', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        deviceStore.addDevicePropertyMock(id, propertyId);
        res.json(deviceStore.exists(id));
        res.end();
    });

    api.post('/:id/property/:propertyId', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        var body = req.body;
        deviceStore.updateDeviceProperty(id, propertyId, body, false);
        res.json(deviceStore.exists(id));
        res.end();
    });

    api.post('/:id/property/:propertyId/value', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        var body = req.body;
        deviceStore.updateDeviceProperty(id, propertyId, body, true);
        // must return the device        
        res.json(deviceStore.exists(id));
        res.end();
    });

    api.get('/:id/property/:propertyId/value', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        deviceStore.refreshDeviceProperty(id, propertyId);
        // must return the device
        res.json(deviceStore.exists(id));
        res.end();
    });

    api.get('/:id/method/:methodId/params', function (req, res, next) {
        var id = req.params.id;
        var methodId = req.params.methodId;
        res.json(deviceStore.getDeviceMethodParams(id, methodId));
        res.end();
    });

    api.delete('/:id/property/:propertyId/mock', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        var body = req.body;
        deviceStore.deleteDevicePropertyMock(id, propertyId);
        // must return the device
        res.json(deviceStore.exists(id));
        res.end();
    });

    api.post('/new', function (req, res, next) {

        if (deviceStore.maxReached()) {
            res.status(500).json({ "message": "Max devices reached" });
            res.end();
            return;
        }

        var updatePayload = req.body;

        if (updatePayload._kind === 'template') {

            let t = new Device();
            t._id = uuid();
            t.configuration = updatePayload;
            deviceStore.addDevice(t);

            if (updatePayload.capabilityModel && Object.keys(updatePayload.capabilityModel).length > 0) {
                var dcm = JSON.parse(updatePayload.capabilityModel);
                t.configuration.mockDeviceName = dcm.displayName.en;
                dcm.implements.forEach(element => {
                    if (element.schema.contents) {
                        element.schema.contents.forEach(item => {

                            if (isType(item['@type'], 'Command')) {
                                var o: any = {};
                                o._id = uuid();
                                o.name = item.name;
                                deviceStore.addDeviceMethod(t._id, o);
                                return;
                            }

                            var o: any = {};
                            o._id = uuid();
                            o.name = item.name;
                            const value = Utils.getRandomValue(item.schema, 0, 100);
                            o.string = Utils.isNumeric(value) ? false : true;
                            o.value = value;

                            let addMock: boolean = false;
                            let addRunLoop: boolean = false;
                            let runLoopUnit: string = 'secs';

                            // Telemetry is sent a normal device information
                            if (isType(item['@type'], 'Telemetry')) {
                                o.sdk = 'msg';
                                addMock = true;
                                addRunLoop = true;
                            }

                            // Twins live on a different SDK API
                            if (isType(item['@type'], 'Property')) {
                                o.sdk = 'twin';
                                addRunLoop = false;
                            }

                            // Maps need key information so do not auto start
                            if (item.schema['@type'] === "Map") {
                                addMock = false;
                                addRunLoop = false;
                            }

                            // Add the AUTO templates for semantics
                            for (let semantic in simSemantics) {
                                if ((isType(item['@type'], semantic))) {
                                    o.propertyObject = { type: 'templated', template: JSON.stringify(simSemantics[semantic], null, 2) }
                                }
                            }

                            // Add the AUTO templates for Objects. If it is an semantic, this will overwrite the semantic
                            if (item.schema['@type'] === "Object" || item.schema['@type'] === "Array") {
                                var ct = {};
                                buildComplexType(item, item.name, ct);
                                o.propertyObject = { type: 'templated', template: JSON.stringify(ct[item.name], null, 2) }
                            }

                            // If we are are not a writable property, report out by mins
                            if ((isType(item['@type'], 'Property')) && !item.writable) {
                                addRunLoop = true;
                                runLoopUnit = 'mins'
                            }

                            // Add a runloop based on settings
                            if (addRunLoop) {
                                o.runloop = {
                                    'include': true,
                                    'unit': runLoopUnit,
                                    'value': Math.floor(Math.random() * (simRunloop[runLoopUnit]["max"] - simRunloop[runLoopUnit]["min"])) + simRunloop[runLoopUnit]["min"]
                                }
                            }

                            // Add the item. This handles Telemetry/Property/Command
                            let propertyId = deviceStore.addDeviceProperty(t._id, ((isType(item['@type'], 'Property')) && item.writable ? 'c2d' : 'd2c'), o);

                            // Only for basic Telemetry we add a random number mock sensor
                            if (addMock && !o.string && (isType(item['@type'], 'Telemetry'))) { deviceStore.addDevicePropertyMock(t._id, propertyId, 'random'); }

                            // if this is a writable property create a copy desired property to do settings
                            if ((isType(item['@type'], 'Property')) && item.writable) {
                                var oW: any = {};
                                oW._id = uuid();
                                oW.name = item.name;
                                oW.sdk = 'twin';
                                oW.string = (item.schema != 'string' ? false : true);
                                oW.value = (item.schema === 'string' ? "Hello World" : 101);
                                oW.propertyObject = {
                                    "type": "templated", template: JSON.stringify({
                                        "value": "AUTO_VALUE",
                                        "status": "completed",
                                        "message": "a test message",
                                        "statusCode": 200,
                                        "desiredVersion": 1
                                    }, null, 1)
                                }
                                deviceStore.addDeviceProperty(t._id, 'd2c', oW);
                            }
                        })
                    }
                })
            }
        } else {

            let items = deviceStore.getListOfItems();
            let capacity = Config.Config.MAX_NUM_DEVICES - items.length;
            let maxCount = parseInt(updatePayload.mockDeviceCount) > capacity ? Config.Config.MAX_NUM_DEVICES - capacity : parseInt(updatePayload.mockDeviceCount);

            for (let i = 0; i < maxCount; i++) {
                let d: Device = new Device();
                let id = updatePayload._kind === 'dps' ? updatePayload.deviceId : Utils.getDeviceId(updatePayload.connectionString);
                id = updatePayload.mockDeviceCount > 1 ? id + "-" + (i + 1) : id;
                if (deviceStore.exists(id)) {
                    res.status(500).json({ "message": "Device already added" });
                    res.end();
                    return;
                }
                d._id = id;
                d.configuration = JSON.parse(JSON.stringify(updatePayload));
                d.configuration.mockDeviceName = updatePayload.mockDeviceCount > 1 ? d.configuration.mockDeviceName + "-" + (i + 1) : d.configuration.mockDeviceName;
                d.configuration.deviceId = d._id;
                deviceStore.addDevice(d);
            }
        }

        res.json(deviceStore.getListOfItems());
        res.end();
    });

    return api;
}

function isType(node: any, type: string) {
    if (Array.isArray(node)) {
        if (node.findIndex((x) => x === type) > -1) { return true; }
    } else {
        return type === node ? true : false;
    }
    return false;
}

function buildComplexType(node: any, nodeName: any, o: any) {

    o[nodeName] = {};

    if (node.schema.fields) {
        for (let f of node.schema.fields) {
            if (f.schema['@type'] && f.schema['@type'] === "Object") {
                buildComplexType(f, f.name, o[nodeName]);
            } else if (f.schema['@type'] && f.schema['@type'] === "Enum") {
                o[nodeName][f.name] = "AUTO_ENUM_" + f.schema.valueSchema.toString().toUpperCase();
            } else {
                o[nodeName][f.name] = "AUTO_" + f.schema.toString().toUpperCase();
            }
        }
    } else {
        o[nodeName] = "AUTO_" + node.schema.toString().toUpperCase();
    }
}