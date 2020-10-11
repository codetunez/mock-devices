const isDocker = require('is-docker');
import { Router } from 'express';
import * as uuidV4 from 'uuid/v4';
import * as fs from 'fs';
import { REPORTING_MODES } from '../config';
var path = require('path');

export default function (dialog, app, globalContext, ms) {
    let api = Router();

    api.get('/ping', function (req, res) {
        res.status(200);
    });

    api.get('/ui', function (req, res) {
        res.json({
            container: isDocker(),
            edge: {
                deviceId: globalContext.IOTEDGE_DEVICEID,
                moduleId: globalContext.IOTEDGE_MODULEID
            },
            latest: globalContext.LATEST_VERSION
        });
    });

    api.get('/id', function (req, res) {
        res.status(200).send(uuidV4()).end();
    });

    api.get('/help', function (req, res) {
        res.status(200).send(fs.readFileSync(path.resolve(__dirname + '/../../../static/HELP.md'), { encoding: 'utf-8' })).end();
    })

    api.post('/setmode/:mode', function (req, res) {
        const mode = req.params.mode;
        switch (mode) {
            case "ux":
                globalContext.OPERATION_MODE = REPORTING_MODES.UX;
                break;
            case "server":
                globalContext.OPERATION_MODE = REPORTING_MODES.SERVER;
                break;
            case "mixed":
                globalContext.OPERATION_MODE = REPORTING_MODES.MIXED;
                break;
            default:
                globalContext.OPERATION_MODE = REPORTING_MODES.UX;
        }
        ms.sendConsoleUpdate(`DATA BACKEND CHANGED TO [${globalContext.OPERATION_MODE}] ${req.body.serverEndpoint}`);
        res.status(200).send(globalContext.OPERATION_MODE.toString()).end();
    });

    api.get('/openDialog', function (req, res, next) {
        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'JSON', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        }).then((result: any) => {
            if (result.canceled) { res.status(444).end(); return; }
            if (result.filePaths && result.filePaths.length > 0) {
                const fileNamePath = result.filePaths[0];
                fs.readFile(fileNamePath, 'utf-8', (error: any, data: any) => {
                    res.json(JSON.parse(data)).status(200).end();
                })
            }
        }).catch((error: any) => {
            console.error(error);
            res.status(500).end();
        });
    });

    api.post('/saveDialog', function (req, res, next) {
        dialog.showSaveDialog()
            .then((path: any) => {
                if (path.canceled) { res.status(444).end(); return; }
                if (path.filePath === "") { res.status(204).end(); return; }
                if (!path.filePath.toLocaleLowerCase().endsWith('.json')) { path.filePath += '.json'; }

                fs.writeFile(path.filePath, JSON.stringify(req.body, null, 2), 'utf8', (error) => {
                    if (error) { res.status(500).end(); }
                    else { res.status(200).end(); }
                })
            }).catch((error: any) => {
                console.error(error);
                res.status(500).end();
            });
    });

    return api;
}