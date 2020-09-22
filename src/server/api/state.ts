import { Router } from 'express';
import * as Utils from '../core/utils';

export default function (deviceStore, simulationStore, ms) {
    let api = Router();

    api.get('/', function (req, res) {
        const payload = {
            devices: JSON.parse(JSON.stringify(deviceStore.getListOfItems())),
            simulation: simulationStore.get()
        }
        res.json(payload);
    });

    api.post('/', function (req, res) {
        try {
            let payload = req.body;
            deviceStore.stopAll();
            if (payload.simulation) { simulationStore.set(payload.simulation); }
            deviceStore.init();
            deviceStore.createFromArray(payload.devices);
            ms.sendAsStateChange({ 'devices': 'loaded' })
            res.json(deviceStore.getListOfItems());
        }
        catch (err) {
            res.status(500).send({ "message": "DATA ERROR: " + err.message })
        }
    });

    api.post('/merge', function (req, res) {
        try {
            let payload = req.body;
            deviceStore.stopAll();
            let currentDevices = JSON.parse(JSON.stringify(deviceStore.getListOfItems()));
            payload.devices = currentDevices.concat(payload.devices);
            deviceStore.init();
            deviceStore.createFromArray(payload.devices);
            ms.sendAsStateChange({ 'devices': 'loaded' })
            res.json(deviceStore.getListOfItems());
        }
        catch (err) {
            res.status(500).send({ "message": "Cannot merge this data" })
        }
    });

    return api;
}