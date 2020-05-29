import { DeviceStore } from '../store/deviceStore'
import { Device, Property } from '../interfaces/device'
import { SimulationStore } from '../store/simulationStore';
import uuid = require('uuid');
import * as Utils from '../core/utils'

export function DCMtoMockDevice(deviceConfiguration: any, deviceStore: DeviceStore) {

    let simulationStore = new SimulationStore();
    let simRunloop = simulationStore.get()["runloop"];
    let simColors = simulationStore.get()["colors"];

    let t = new Device();
    t._id = uuid();
    t.configuration = deviceConfiguration;
    deviceStore.addDevice(t);

    if (deviceConfiguration.capabilityModel && Object.keys(deviceConfiguration.capabilityModel).length > 0) {
        var dcm = JSON.parse(deviceConfiguration.capabilityModel);
        //TOOD: get this fixed
        t.configuration.mockDeviceName = dcm.displayName ? (dcm.displayName.en || dcm.displayName) : 'DCM has no display name';
        t.configuration.capabilityUrn = dcm['@id'];
        dcm.implements.forEach(element => {

            const pnpInterface: any = {
                name: element.schema.displayName ? (element.schema.displayName.en || element.schema.displayName) : 'Interface has no display name',
                urn: element.schema['@id'],
                instanceName: element.displayName ? (element.displayName.en || element.displayName) : 'Interface Instance has no display name',
                instanceUrn: element['@id']
            }

            if (element.schema.contents) {
                element.schema.contents.forEach(item => {
                    DCMCapabilityToComm(item, t._id, deviceStore, simRunloop, simColors, pnpInterface);
                })
            }
        })
    }
}

function DCMCapabilityToComm(item: any, deviceId: string, deviceStore: DeviceStore, simRunloop: any, simColors: any, pnpInterface: any) {

    var o: any = {};
    o._id = uuid();
    o._type = 'property';
    o.name = item.name;
    o.interface = pnpInterface;

    if (isType(item['@type'], 'Command')) {
        o.name = item.name;
        o.color = simColors["Color1"];
        o._type = 'method';
        o.execution = !item.durable ? 'direct' : 'cloud';

        deviceStore.addDeviceMethod(deviceId, o);
        return;
    }

    //let addMock: boolean = false;
    let addRunLoop: boolean = false;
    let runLoopUnit: string = 'secs';

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
        o.string = item.schema.valueSchema === "string" ? true : false;
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
            'unit': runLoopUnit === 'mins' ? 'mins' : 'secs',
            'value': Utils.getRandomNumberBetweenRange(simRunloop[runLoopUnit]["min"], simRunloop[runLoopUnit]["max"], true)
        }
    }

    if ((isType(item['@type'], 'Property')) && item.writable) {
        o.color = simColors["Color2"];
    }

    // Add the item. This handles Telemetry/Property/Command
    deviceStore.addDeviceProperty(deviceId, ((isType(item['@type'], 'Property')) && item.writable ? 'c2d' : 'd2c'), o);

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
        oW.interface = pnpInterface;
        oW.propertyObject = {
            "type": "templated", template: JSON.stringify({
                "value": o.propertyObject && o.propertyObject.type === "templated" ? JSON.parse(o.propertyObject.template) : "",
                "status": "completed",
                "message": "a test message",
                "statusCode": 200,
                "desiredVersion": 1
            }, null, 1)
        }
        deviceStore.addDeviceProperty(deviceId, 'd2c', oW);
    }
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