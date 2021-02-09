import { Router } from 'express';

export default function (plugIns: any) {
    let api = Router();

    api.get('/', function (req, res, next) {
        const items = [];
        for (const p in plugIns) {
            items.push(p);
        }
        res.json(items);
    });

    return api;
}