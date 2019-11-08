import { Router } from 'express';
import { SensorStore } from '../store/sensorStore'

export default function (sensorStore: SensorStore) {
    let api = Router();

    api.get('/:type', function (req, res, next) {
        var type = req.params.type;
        res.json(sensorStore.getNewSensor(type));
        res.end();
    });

    api.get('/', function (req, res, next) {
        res.json(sensorStore.getListOfItems());
        res.end();
    });

    return api;
}