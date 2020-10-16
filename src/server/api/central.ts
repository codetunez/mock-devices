import { Router } from 'express';
import axios from 'axios';

export default function () {
    let api = Router();
    let templates = [];

    api.post('/templates', function (req, res, next) {
        const { name, token } = req.body;

        //TODO: non-production code
        if (templates.length > 0) { res.json(templates); return; }

        axios.get(`https://${name}.azureiotcentral.com/api/preview/deviceTemplates`, {
            headers: {
                Authorization: token
            }
        })
            .then((res2) => {
                templates = res2.data && res2.data.value || [];
                res.json(templates);
            })
            .catch((err) => {
                console.error(err);
                res.sendStatus(500);
            })
            .finally(() => {
                res.end();
            })
    });

    api.post('/create', function (req, res, next) {
        const { id, deviceId } = req.body;
        res.end();
    });

    return api;
}