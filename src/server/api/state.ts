import { Router } from 'express';
import * as Utils from '../core/utils';

export default function (deviceStore, simulationStore) {
    let api = Router();

    api.get('/', function (req, res) {
        // cloning here because we want to change the running state just for the export payload
        let changedDeviceState = JSON.parse(JSON.stringify(deviceStore.getListOfItems()));
        let semanticsState = simulationStore.getSimulation();
        changedDeviceState.forEach(function (element) {
            element.running = false;
            if (!element._id) { element._id = Utils.getDeviceId(element.connString); }
        }, this);

        let payload = {
            devices: changedDeviceState,
            simulaton: semanticsState
        }
        res.send(payload);
        res.end();
    });

    api.post('/', function (req, res) {
        try {
            let payload = req.body;
            deviceStore.stopAll();
            deviceStore.createFromArray(payload.devices);
            simulationStore.setSimulation(payload.simulation)
            res.json(deviceStore.getListOfItems());
            res.end();
        }
        catch (err) {
            res.status(500).send({ "message": "Cannot import this data" })
            res.end();
        }
    });

    return api;
}