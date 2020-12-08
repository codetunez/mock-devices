import { Router } from 'express';
import { DtdlStore } from '../store/DtdlStore'

export default function (dtdlStore: DtdlStore) {
    let api = Router();

    api.get('/:name', function (req, res, next) {
        res.json(dtdlStore.getDtdl(req.params.name));
        res.end();
    });

    api.get('/', function (req, res, next) {
        res.json(dtdlStore.getListOfItems());
        res.end();
    });

    return api;
}