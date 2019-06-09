import { Router } from 'express';
import { DeviceStore } from '../store/deviceStore'
import { Device } from '../interfaces/device'
import * as Utils from '../core/utils'
import { ConnectionString } from 'azure-iot-common';
import { IotHub } from '../core/iotHub';
import uuid = require('uuid');
import { Config } from '../config';

export default function (deviceStore: DeviceStore) {
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
                t.configuration.mockDeviceName = dcm.displayName;
                dcm.implements.forEach(element => {
                    if (element.contents) {
                        element.contents.forEach(item => {

                            if (item['@type'] === 'Command') {
                                var o: any = {};
                                o._id = uuid();
                                o.name = item.name;
                                deviceStore.addDeviceMethod(t._id, o);
                                return;
                            }

                            var o: any = {};
                            o._id = uuid();
                            o.name = item.name;
                            o.string = (item.schema != 'string' ? false : true);


                            // if this is Telemetry set up a timer
                            if (item['@type'] === 'Telemetry') {
                                o.sdk = 'msg';
                                o.runloop = {
                                    'include': true,
                                    'unit': 'secs',
                                    'value': Math.floor(Math.random() * (90 - 45)) + 45
                                }
                            }

                            // add the property
                            let propertyId = deviceStore.addDeviceProperty(t._id, (item['@type'] === 'Property' && item.writable ? 'c2d' : 'd2c'), o);

                            if (item['@type'] === 'Telemetry') { deviceStore.addDevicePropertyMock(t._id, propertyId, 'random'); }

                            // if this is a writable property create a D2C for settings
                            if (item['@type'] === 'Property' && item.writable) {
                                var oP: any = {};
                                oP._id = uuid();
                                oP.name = item.name;
                                oP.sdk = 'twin';
                                oP.string = (item.schema != 'string' ? false : true);
                                oP.propertyObject = { type: 'templated', template: "{\n\t\"value\" : _VALUE_,\n\t\"status\" : \"completed\",\n\t\"message\" : \"test message\",\n\t\"statusCode\" : 200,\n\t\"desiredVersion\" : 1\n}" }
                                deviceStore.addDeviceProperty(t._id, 'd2c', oP);
                            }
                        })
                    }
                })
            }
        } else {

            let items = deviceStore.getListOfItems();
            let capacity = Config.MAX_NUM_DEVICES - items.length;
            let maxCount = parseInt(updatePayload.mockCreateCount) > capacity ? Config.MAX_NUM_DEVICES - capacity : parseInt(updatePayload.mockCreateCount);

            for (let i = 0; i < maxCount; i++) {

                let d: Device = new Device();
                let id = updatePayload._kind === 'dps' ? updatePayload.deviceId : Utils.getDeviceId(updatePayload.connectionString);
                id = updatePayload.mockCreateCount > 1 ? id + "-" + (i + 1) : id;
                if (deviceStore.exists(id)) {
                    res.status(500).json({ "message": "Device already added" });
                    res.end();
                    return;
                }
                d._id = id;
                d.configuration = JSON.parse(JSON.stringify(updatePayload));
                d.configuration.mockDeviceName = updatePayload.mockCreateCount > 1 ? d.configuration.mockDeviceName + "-" + (i + 1) : d.configuration.mockDeviceName;
                d.configuration.deviceId = d._id;
                deviceStore.addDevice(d);
            }
        }

        res.json(deviceStore.getListOfItems());
        res.end();
    });

    return api;
}