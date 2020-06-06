import { Router } from 'express';
import { DeviceStore } from '../store/deviceStore';
import { Device } from '../interfaces/device';
import { DCMtoMockDevice } from '../core/templates';
import * as Utils from '../core/utils';
import * as  Config from '../config';

export default function (deviceStore: DeviceStore) {
    let api = Router();

    // get a device
    api.get('/:id', function (req, res, next) {
        var id = req.params.id;
        res.json(deviceStore.exists(id));
        res.end();
    });

    // delete a device
    api.delete('/:id', function (req, res, next) {
        var id = req.params.id;
        deviceStore.stopDevice(deviceStore.exists(id));
        deviceStore.deleteDevice(deviceStore.exists(id));
        res.json(deviceStore.getListOfItems());
        res.end();
    });

    // start a device and return state of all devices
    api.get('/:id/start', function (req, res, next) {
        var id = req.params.id;
        deviceStore.startDevice(deviceStore.exists(id));
        res.json({ device: deviceStore.exists(id), devices: deviceStore.getListOfItems() });
        res.end();
    });

    // stop a device and return state of all devices
    api.get('/:id/stop', function (req, res, next) {
        var id = req.params.id;
        deviceStore.stopDevice(deviceStore.exists(id));
        res.json({ device: deviceStore.exists(id), devices: deviceStore.getListOfItems() });
        res.end();
    });

    // create a new device property, return the state of all devices
    api.post('/:id/property/new', function (req, res, next) {
        var id = req.params.id;
        var body = req.body;
        deviceStore.addDeviceProperty(id, body.type, body.pnpSdk);
        res.json({ device: deviceStore.exists(id), devices: deviceStore.getListOfItems() });
        res.end();
    });

    // create a new device method/C2D. as this stops the device, return the state of all devices
    api.post('/:id/method/new', function (req, res, next) {
        var id = req.params.id;
        deviceStore.addDeviceMethod(id);
        res.json({ device: deviceStore.exists(id), devices: deviceStore.getListOfItems() });
        res.end();
    });

    // delete a property
    api.delete('/:id/property/:propertyId', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        var body = req.body;
        deviceStore.deleteDeviceProperty(id, propertyId);
        res.json({ device: deviceStore.exists(id), devices: deviceStore.getListOfItems() });
        res.end();
    });

    // delete a method
    api.delete('/:id/method/:methodId', function (req, res, next) {
        var id = req.params.id;
        var methodId = req.params.methodId;
        deviceStore.deleteDeviceProperty(id, methodId);
        res.json({ device: deviceStore.exists(id), devices: deviceStore.getListOfItems() });
        res.end();
    });

    // NEED IMPLEMENTATION: required?
    api.get('/:id/method/:methodId/params', function (req, res, next) {
        var id = req.params.id;
        var methodId = req.params.methodId;
        res.json(deviceStore.getDeviceMethodParams(id, methodId));
        res.end();
    });

    // update a direct or c2d method. will result in stop device. return state of all devices
    api.put('/:id/method/:methodId', function (req, res, next) {
        var id = req.params.id;
        var methodId = req.params.methodId;
        var body = req.body;
        deviceStore.updateDeviceMethod(id, methodId, body);
        res.json({ device: deviceStore.exists(id), devices: deviceStore.getListOfItems() });
        res.end();
    });

    // update the value of a property and send the new value (not method)
    api.put('/:id/property/:propertyId/value', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        var body = req.body;
        deviceStore.updateDeviceProperty(id, propertyId, body, true);
        // must return the device        
        res.json({ device: deviceStore.exists(id), devices: deviceStore.getListOfItems() });
        res.end();
    });

    // update the value of a property but do not send the value (not method)
    api.put('/:id/property/:propertyId', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        var body = req.body;
        deviceStore.updateDeviceProperty(id, propertyId, body, false);
        // must return the device
        res.json({ device: deviceStore.exists(id), devices: deviceStore.getListOfItems() });
        res.end();
    });

    // restart the plan and send back just the device
    api.get('/:id/plan/restart', function (req, res, next) {
        var id = req.params.id;
        deviceStore.restartDevicePlan(id);
        res.json({ device: deviceStore.exists(id), devices: deviceStore.getListOfItems() });
        res.end();
    });

    // update the plan and send back just the device
    api.put('/:id/plan', function (req, res, next) {
        var id = req.params.id;
        deviceStore.updateDevice(id, req.body.payload, 'plan');
        res.json({ device: deviceStore.exists(id), devices: deviceStore.getListOfItems() });
        res.end();
    });

    // update the device's configuration. will stop the device. send back state of all devices
    api.put('/:id/configuration', function (req, res, next) {
        var id = req.params.id;
        const newId = deviceStore.updateDevice(id, req.body.payload, 'configuration');
        res.json({ device: deviceStore.exists(newId), devices: deviceStore.getListOfItems() });
        res.end();
    });

    // required?
    api.post('/:id/property/:propertyId/mock/new', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        deviceStore.addDevicePropertyMock(id, propertyId);
        res.json(deviceStore.exists(id));
        res.end();
    });

    // required?
    api.delete('/:id/property/:propertyId/mock', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        var body = req.body;
        deviceStore.deleteDevicePropertyMock(id, propertyId);
        // must return the device
        res.json(deviceStore.exists(id));
        res.end();
    });

    // required?
    api.get('/:id/property/:propertyId/value', function (req, res, next) {
        var id = req.params.id;
        var propertyId = req.params.propertyId;
        deviceStore.refreshDeviceProperty(id, propertyId);
        // must return the device
        res.json(deviceStore.exists(id));
        res.end();
    });

    // create a new device, template or bulk devices
    api.post('/new', function (req, res, next) {

        if (deviceStore.maxReached()) {
            res.status(500).json({ "message": "Max devices reached" });
            res.end();
            return;
        }

        var updatePayload = req.body;

        if (updatePayload._kind === 'template') {
            DCMtoMockDevice(updatePayload, deviceStore);
        } else {

            let items = deviceStore.getListOfItems();
            let capacity = Config.Config.MAX_NUM_DEVICES - items.length;

            let from = parseInt(updatePayload.mockDeviceCount)
            const to = parseInt(updatePayload.mockDeviceCountMax)
            const count = to - from === 0 ? 1 : to - from;

            let maxCount = count > capacity ? Config.Config.MAX_NUM_DEVICES - capacity : count;

            for (let i = 0; i < maxCount; i++) {
                let d: Device = new Device();
                let id = updatePayload._kind === 'dps' ? updatePayload.deviceId : Utils.getDeviceId(updatePayload.connectionString);
                id = count > 1 ? id + "-" + from : id;
                if (deviceStore.exists(id)) {
                    res.status(500).json({ "message": "Device already added" });
                    res.end();
                    return;
                }
                d._id = id;
                d.configuration = JSON.parse(JSON.stringify(updatePayload));
                d.configuration.mockDeviceName = count > 1 ? d.configuration.mockDeviceName + "-" + from : d.configuration.mockDeviceName;
                d.configuration.deviceId = d._id;
                deviceStore.addDevice(d);
                from++;
            }
        }

        res.json(deviceStore.getListOfItems());
        res.end();
    });

    return api;
}