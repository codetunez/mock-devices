import { Router } from 'express';
import { SensorStore } from '../store/sensorStore'

export default function (sensorStore: SensorStore) {
    let api = Router();

    api.get('/', function (req, res, next) {
        res.json(sensorStore.getListOfItems());
        res.end();
    });

    return api;
}