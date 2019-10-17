import { Router } from 'express';
import * as Utils from '../core/utils';

export default function (deviceStore, simulationStore) {
    let api = Router();

    api.get('/', function (req, res) {
        res.send(simulationStore.getSimulation());
        res.end();
    });

    api.post('/', function (req, res) {
        try {
            let payload = req.body;
            simulationStore.setSimulation(payload.simulation);
            // return the list of devices.
            res.json(deviceStore.getListOfItems());
            res.end();
        }
        catch (err) {
            res.status(500).send({ "message": "Cannot import this simulation data" })
            res.end();
        }
    });

    return api;
}