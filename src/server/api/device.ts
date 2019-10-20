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
    let simColors = simulationStore.get()["colors"];

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
                //TOOD: get this fixed
                t.configuration.mockDeviceName = dcm.displayName ? (dcm.displayName.en || dcm.displayName) : 'DCM has no display name';
                dcm.implements.forEach(element => {
                    if (element.schema.contents) {
                        element.schema.contents.forEach(item => {

                            if (isType(item['@type'], 'Command')) {
                                var o: any = {};
                                o._id = uuid();
                                o.name = item.name;
                                o.color = simColors["Color1"];
                                deviceStore.addDeviceMethod(t._id, o);
                                return;
                            }

                            //let addMock: boolean = false;
                            let addRunLoop: boolean = false;
                            let runLoopUnit: string = 'secs';

                            var o: any = {};
                            o._id = uuid();
                            o.name = item.name;
                            o.color = simColors["Default"];

                            // Telemetry is sent via Msg SDK API
                            if (isType(item['@type'], 'Telemetry')) {
                                o.sdk = 'msg';
                                addRunLoop = true;
                            }

                            // Twins live on a different SDK API
                            if (isType(item['@type'], 'Property')) {
                                o.sdk = 'twin';
                                runLoopUnit = 'mins'
                                addRunLoop = true;
                            }

                            // Maps need key information so do not auto start regardless of Type
                            if (item.schema['@type'] === "Map") {
                                addRunLoop = false;
                                o.value = "AUTO_MAP"
                            }

                            // only some schema should be treaded as string
                            if (item.schema === "string" || item.schema === "date" || item.schema === "dateTime" || item.schema === "time" || item.schema === "duration") {
                                o.string = true;
                            }

                            // Set up Value fields

                            // This will set a primative value but nothing for complex
                            if (hasAuto(item.schema)) {
                                o.value = item.writable ? "Waiting for Read ..." : "AUTO_" + item.schema.toString().toUpperCase()
                            }

                            // This State will be dealt with differently to Object ones
                            if (isType(item['@type'], "SemanticType/State")) {
                                o.string = item.schema.valueSchema === "string" ? true : false;
                                o.value = buildEnumAsValue(item.schema.enumValues);
                            }

                            if (isType(item['@type'], "SemanticType/Event")) {
                                runLoopUnit = 'mins'
                                o.string = item.schema === "string" ? true : false;
                                o.value = item.schema === "string" ? "AUTO_STRING" : "AUTO_INTEGER";
                            }

                            // Setup Complex                                

                            if (item.schema['@type'] === "Enum") {
                                o.value = buildEnumAsValue(item.schema.enumValues);
                            }

                            if (item.schema['@type'] === "Object") {
                                var ct = {};
                                buildComplexType(item, item.name, ct);
                                o.value = "COMPLEX"
                                o.propertyObject = { type: 'templated', template: JSON.stringify(ct[item.name], null, 2) };
                                addRunLoop = true;
                            }

                            // If we are are not a writable property, report out by mins
                            if ((isType(item['@type'], 'Property')) && item.writable) {
                                addRunLoop = false;
                            }

                            // Add a runloop based on settings
                            if (addRunLoop) {
                                o.runloop = {
                                    'include': true,
                                    'unit': runLoopUnit,
                                    'value': Utils.getRandomNumberBetweenRange(simRunloop[runLoopUnit]["min"], simRunloop[runLoopUnit]["max"], true)
                                }
                            }

                            if ((isType(item['@type'], 'Property')) && item.writable) {
                                o.color = simColors["Color2"];
                            }

                            // Add the item. This handles Telemetry/Property/Command
                            deviceStore.addDeviceProperty(t._id, ((isType(item['@type'], 'Property')) && item.writable ? 'c2d' : 'd2c'), o);

                            // if this is a writable property create a copy desired property to do settings
                            if ((isType(item['@type'], 'Property')) && item.writable) {
                                addRunLoop = false;
                                var oW: any = {};
                                oW._id = uuid();
                                oW.name = item.name;
                                oW.color = simColors["Color2"];
                                oW.sdk = 'twin';
                                oW.string = o.string;
                                oW.value = o.string ? "" : 0;
                                oW.propertyObject = {
                                    "type": "templated", template: JSON.stringify({
                                        "value": o.propertyObject && o.propertyObject.type === "templated" ? JSON.parse(o.propertyObject.template) : "",
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

function hasAuto(schema: string) {
    if (schema === 'double' ||
        schema === 'float' ||
        schema === 'integer' ||
        schema === 'long' ||
        schema === 'boolean' ||
        schema === 'string' ||
        schema === 'dateTime' ||
        schema === 'date' ||
        schema === 'time' ||
        schema === 'duration' ||
        schema === 'geopoint' ||
        schema === 'vector' ||
        schema === 'map') {
        return true;
    }
    return false;
}

function buildEnumAsValue(enums: any) {
    let states = [];
    enums.forEach(ele => {
        states.push(ele.enumValue);
    })
    return "AUTO_ENUM/" + JSON.stringify(states);
}

function buildComplexType(node: any, nodeName: any, o: any) {
    o[nodeName] = {};
    if (node.schema.fields) {
        for (let f of node.schema.fields) {
            if (f.schema['@type'] && f.schema['@type'] === "Object") {
                buildComplexType(f, f.name, o[nodeName]);
            } else if (f.schema['@type'] && f.schema['@type'] === "Enum") {
                o[nodeName][f.name] = buildEnumAsValue(f.schema.enumValues);
            } else if (f.schema['@type'] && f.schema['@type'] === "Map") {
                o[nodeName][f.name] = "AUTO_MAP";
            } else {
                o[nodeName][f.name] = "AUTO_" + f.schema.toString().toUpperCase();
            }
        }
    } else {
        o[nodeName] = "AUTO_" + node.schema.toString().toUpperCase();
    }

}