import { Router } from 'express';
import * as Utils from '../core/utils';

export default function (deviceStore, simulationStore) {
    let api = Router();

    api.get('/', function (req, res) {
        // cloning here because we want to change the running state just for the export payload
        let changedDeviceState = JSON.parse(JSON.stringify(deviceStore.getListOfItems()));
        changedDeviceState.forEach(function (element) {
            element.running = false;
            if (!element._id) { element._id = Utils.getDeviceId(element.connString); }
        }, this);

        let payload = {
            devices: changedDeviceState,
            simulation: simulationStore.get()
        }
        res.send(payload);
        res.end();
    });

    api.post('/', function (req, res) {
        try {
            let payload = req.body;
            deviceStore.stopAll();
            if (payload.simulation) { simulationStore.set(payload.simulation); }
            deviceStore.init();
            deviceStore.createFromArray(payload.devices);
            res.json(deviceStore.getListOfItems());
            res.end();
        }
        catch (err) {
            res.status(500).send({ "message": "Cannot import this data" })
            res.end();
        }
    });

    api.post('/merge', function (req, res) {
        try {
            let payload = req.body;
            deviceStore.stopAll();
            if (payload.simulation) { simulationStore.set(payload.simulation); }
            let currentDevices = JSON.parse(JSON.stringify(deviceStore.getListOfItems()));
            payload.devices = currentDevices.concat(payload.devices);
            deviceStore.init();
            deviceStore.createFromArray(payload.devices);
            res.json(deviceStore.getListOfItems());
            res.end();
        }
        catch (err) {
            res.status(500).send({ "message": "Cannot merge this data" })
            res.end();
        }
    });

    return api;
}