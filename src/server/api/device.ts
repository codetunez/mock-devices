import { Router } from 'express';
import { DeviceStore } from '../store/deviceStore'
import { Device } from '../interfaces/device'
import * as Utils from '../core/utils'
import { ConnectionString } from 'azure-iot-common';
import { IotHub } from '../core/iotHub';

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
        var body = req.body;
        var cloneId = req.body.cloneId;

        if (!deviceStore.maxReached()) {

            let id: string = Utils.getDeviceId(body.connectionString);

            if (id) {
                /* this is using a device connection string */
                if (!deviceStore.exists(id)) {

                    let d = new Device();
                    d._id = id;
                    d.name = !body.name || body.name === "" ? id : body.name;
                    d.connectionString = body.connectionString;
                    d.hubConnectionString = body.hubConnectionString || null;
                    d.template = false;

                    if (cloneId) { d.cloneId = cloneId; }

                    deviceStore.addDevice(d);

                    res.json(deviceStore.getListOfItems());
                    res.end();
                } else {
                    res.status(500).json({ "message": "Device already added" });
                    res.end();
                }
            } else {
                var cn = ConnectionString.parse(body.connectionString);
                if (cn.HostName && cn.HostName != "" &&
                    cn.SharedAccessKeyName && cn.SharedAccessKeyName != "" &&
                    cn.SharedAccessKey && cn.SharedAccessKey != "") {

                    IotHub.CreateDevice(body.connectionString)
                        .then((deviceInfo: any) => {
                            let id = deviceInfo.deviceId;
                            let name = body.name === "" ? deviceInfo.deviceId : body.name;
                            let hostName = cn.HostName;
                            let key = deviceInfo.authentication.symmetricKey.primaryKey;

                            let connString = "HostName=" + hostName + ";DeviceId=" + id + ";SharedAccessKey=" + key;

                            let d = new Device();
                            d._id = id;
                            d.name = name;
                            d.connectionString = connString;
                            d.hubConnectionString = body.connectionString;
                            d.template = false;

                            deviceStore.addDevice(d);
                            res.json(deviceStore.getListOfItems());
                            res.end();
                        })
                        .catch((err) => {
                            res.status(500).json({ "message": err.toString() });
                            res.end();
                        })
                }
                else {
                    res.status(500).json({ "message": "Cannot find the device id in connection string" });
                    res.end();
                }
            }
        }
        else {
            res.status(500).json({ "message": "Max devices reached" });
            res.end();
        }
    });

    return api;
}