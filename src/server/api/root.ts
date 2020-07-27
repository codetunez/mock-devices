import { Router } from 'express';
import * as uuidV4 from 'uuid/v4';
import * as fs from 'fs';

export default function (dialog, app, container) {
    let api = Router();

    api.get('/ping', function (req, res) {
        res.status(200);
    });

    api.get('/container', function (req, res) {
        res.json({ container });
    });

    api.get('/id', function (req, res) {
        res.status(200).send(uuidV4()).end();
    });

    api.get('/openDialog', function (req, res, next) {
        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'JSON', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        }).then((result: any) => {
            if (result.filePaths && result.filePaths.length > 0) {
                const fileNamePath = result.filePaths[0];
                fs.readFile(fileNamePath, 'utf-8', (error: any, data: any) => {
                    res.json(JSON.parse(data)).status(200).end();
                })
            }
        }).catch((error: any) => {
            res.status(500).end();
        });
    });

    api.post('/saveDialog', function (req, res, next) {
        var body = JSON.stringify(req.body);
        dialog.showSaveDialog(app.getPath('desktop'), (path: string) => {
            if (path === "") {
                res.status(400).end();
                return;
            }
            if (!path.toLocaleLowerCase().endsWith('.json')) { path += '.json'; }
            fs.writeFile(path, body, 'utf8', (error) => {
                if (error) { res.status(500).end(); }
                else { res.status(200).end(); }
            })
        })
    });

    return api;
}