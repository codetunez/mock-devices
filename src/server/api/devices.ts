import { Router } from 'express';
import { DeviceStore } from '../store/deviceStore'

export default function (deviceStore: DeviceStore) {
    let api = Router();

    api.get('/', function (req, res, next) {
        res.json(deviceStore.getListOfItems());
        res.end();
    });

    api.get('/start', function (req, res, next) {
        deviceStore.startAll();
        res.json(deviceStore.getListOfItems());
        res.end();

        //TODO: this needs push to trap errors
    });

    api.get('/stop', function (req, res, next) {
        deviceStore.stopAll();
        res.json(deviceStore.getListOfItems());
        res.end();
    });

    return api;
}