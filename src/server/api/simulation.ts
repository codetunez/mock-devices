import { Router } from 'express';
import * as Utils from '../core/utils';

export default function (deviceStore, simulationStore) {
    let api = Router();

    api.get('/', function (req, res) {
        res.send(simulationStore.get());
        res.end();
    });

    api.post('/', function (req, res) {
        try {
            let payload = req.body;
            deviceStore.stopAll();
            simulationStore.set(JSON.parse(payload.simulation));
            let d = JSON.parse(JSON.stringify(deviceStore.getListOfItems()));
            deviceStore.createFromArray(d);
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