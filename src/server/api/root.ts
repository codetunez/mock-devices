import { Router } from 'express';
import * as uuidV4 from 'uuid/v4';

export default function() {
    let api = Router();

    api.get('/ping', function(req, res) {
        res.status(200).end();
    });

    api.get('/id', function(req, res) {
        res.status(200).send(uuidV4()).end();
    });

    return api;
}