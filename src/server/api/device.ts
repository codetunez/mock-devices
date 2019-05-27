import { Router } from 'express';
import { DeviceStore } from '../store/deviceStore'
import { Device } from '../interfaces/device'
import * as Utils from '../core/utils'
import { ConnectionString } from 'azure-iot-common';
import { IotHub } from '../core/iotHub';
import uuid = require('uuid');

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

            var dcm = JSON.parse(updatePayload.capabilityModel);

            let t = new Device();
            t._id = uuid();
            t.configuration = updatePayload;
            t.configuration.mockDeviceName = dcm.displayName;
            deviceStore.addDevice(t);

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
                        let propertyId = deviceStore.addDeviceProperty(t._id, 'd2c', o);
                        if (item['@type'] === 'Telemetry') { deviceStore.addDevicePropertyMock(t._id, propertyId, 'random'); }

                        // if this is a writable property create a C2D for settings
                        if (item['@type'] === 'Property' && item.writable) {
                            var o: any = {};
                            o._id = uuid();
                            o.name = item.name;
                            o.string = (item.schema != 'string' ? false : true);
                            o.propertyObject = { type: 'templated' };
                            deviceStore.addDeviceProperty(t._id, 'c2d', o);
                        }
                    })
                }
            })
        } else {

            let d = new Device();
            let id = updatePayload._kind === 'dps' ? updatePayload.deviceId : Utils.getDeviceId(updatePayload.connectionString);

            if (deviceStore.exists(id)) {
                res.status(500).json({ "message": "Device already added" });
                res.end();
                return;
            }

            d._id = id;
            d.configuration = updatePayload;
            d.name = !updatePayload.name || updatePayload.name === "" ? id : updatePayload.name;
            d.cloneId = updatePayload.mockDeviceCloneId ? updatePayload.mockDeviceCloneId : undefined
            deviceStore.addDevice(d);
        }

        res.json(deviceStore.getListOfItems());
        res.end();
    });

    return api;
}