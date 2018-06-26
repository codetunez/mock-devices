import { Router } from 'express';
import { DeviceStore } from '../store/deviceStore'
import { IotHub } from '../core/iotHub';

export default function (deviceStore: DeviceStore) {
    let api = Router();

    api.post('/list', function (req, res) {
        var body = req.body;

        IotHub.GetDevices(body.connectionString)
            .then((deviceList: any) => {
                res.json(deviceList);
                res.status(200).end();
            })
            .catch((err: any) => {
                res.status(500).end(err);
            })
    });

    api.post('/:id/delete', function (req, res) {
        var body = req.body;
        var deviceId = req.params.id;

        IotHub.DeleteDevice(body.connectionString, deviceId)
            .then((deviceList: any) => {
                res.json(deviceList);
                res.status(200).end();
            })
            .catch((err: any) => {
                res.status(500).end(err);
            })            
    });

    api.post('/:id/twinRead', function (req, res) {
        var body = req.body;
        var deviceId = req.params.id;

        IotHub.GetTwin(body.connectionString, deviceId)
            .then((twin: any) => {
                res.json(twin);
                res.status(200).end();
            })
            .catch((err: any) => {
                res.status(500).end(err);
            })            
    });

    api.post('/:id/twinWrite', function (req, res) {
        var body = req.body;
        var deviceId = req.params.id;

        IotHub.WriteTwin(body.connectionString, body.properties, deviceId)
            .then((twin: any) => {
                res.json(twin);
                res.status(200).end();
            })
            .catch((err: any) => {
                res.status(500).end(err);
            })            
    });

    return api;
}