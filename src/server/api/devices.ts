import { Router } from 'express';
import { DeviceStore } from '../store/deviceStore'

export default function (deviceStore: DeviceStore) {
    let api = Router();

    api.get('/', function (req, res, next) {
        res.json(deviceStore.getListOfItems());
    });

    //TODO: this needs push to trap errors
    api.get('/start', function (req, res, next) {
        deviceStore.startAll();
        res.json(deviceStore.getListOfItems());
    });

    api.get('/stop', function (req, res, next) {
        deviceStore.stopAll();
        res.json(deviceStore.getListOfItems());
    });

    api.get('/reset', function (req, res, next) { 
        deviceStore.reset();
        res.json(deviceStore.getListOfItems());
    });

    api.get('/:id', function (req, res, next) {
        var id = req.params.id;
        res.json({ device: deviceStore.exists(id), devices: deviceStore.getListOfItems() });
    });

    return api;
}