import { Router } from 'express';
import axios from 'axios';
import { DeviceStore } from '../store/deviceStore';
import { ServerSideMessageService } from '../core/messageService';
import { Device } from '../interfaces/device';
import { DCMtoMockDevice } from '../core/templates';

interface Cache {
    templates: [];
}

export default function (deviceStore: DeviceStore, ms: ServerSideMessageService) {
    let api = Router();

    let cache: Cache = { templates: [] };

    api.post('/templates', function (req, res, next) {
        const { appUrl, token } = req.body;

        if (cache.templates.length > 0) { res.json(cache.templates); return; }

        axios.get(`https://${appUrl}/api/preview/deviceTemplates`, {
            headers: {
                Authorization: token
            }
        })
            .then((res2) => {
                cache.templates = res2.data && res2.data.value || [];
                res.json(cache.templates);
            })
            .catch((err) => {
                res.sendStatus(500);
            })
            .finally(() => {
                res.end();
            })
    });

    api.post('/create', function (req, res, next) {
        const { appUrl, token, id, deviceId } = req.body;

        let dcm = null;
        axios.put(`https://${appUrl}/api/preview/devices/${deviceId}`, { instanceOf: id }, { headers: { Authorization: token } })
            .then(() => {
                return axios.get(`https://${appUrl}/api/preview/deviceTemplates/${id}`, { headers: { Authorization: token } });
            })
            .then((response) => {
                dcm = response.data.capabilityModel;
                return axios.get(`https://${appUrl}/api/preview/devices/${deviceId}/credentials`, { headers: { Authorization: token } });
            })
            .then((response) => {

                const deviceConfiguration: any = {
                    "_kind": "dps",
                    "deviceId": deviceId,
                    "mockDeviceName": deviceId,
                    "scopeId": response.data.idScope,
                    "dpsPayload": {
                        "iotcModelId": id
                    },
                    "sasKey": response.data.symmetricKey.primaryKey,
                    "isMasterKey": false,
                    "capabilityModel": dcm,
                    "capabilityUrn": id,
                    "centralAdded": true
                }

                let d: Device = new Device();
                d._id = deviceId;
                d.configuration = deviceConfiguration;
                d.configuration.deviceId = deviceId;
                deviceStore.addDevice(d);

                if (dcm) { DCMtoMockDevice(deviceStore, d); }

                ms.sendAsStateChange({ 'devices': 'loaded' })

                deviceStore.startDevice(d);
                res.sendStatus(200);
            })
            .catch((err) => {
                res.sendStatus(500);
                console.log(err);
            })
            .finally(() => {
                res.end();
            })
    });

    return api;
}