import { Router } from 'express';
import { DeviceStore } from '../store/deviceStore'
import { DCMtoMockDevice } from '../core/templates';

export default function (deviceStore: DeviceStore) {
    let api = Router();

    api.post('/properties', function (req, res) {
        const caps = deviceStore.getCommonCapabilities(req.body.devices, req.body.allDevices);
        res.json({ devices: req.body.devices, capabilities: caps });
        res.end();
    });

    api.post('/update', function (req, res) {
        const caps = deviceStore.setCommonCapabilities(req.body.payload);
        res.json({ devices: deviceStore.getListOfItems() });
        res.end();
    });

    return api;
}