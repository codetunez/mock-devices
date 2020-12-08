import { Router } from 'express';
import { DeviceStore } from '../store/deviceStore'
import { DCMtoMockDevice } from '../core/templates';

export default function (deviceStore: DeviceStore) {
    let api = Router();
    
    api.post('/reapply', function (req, res) {
        deviceStore.reapplyTemplate(req.body.payload.templateId, req.body.payload.devices, req.body.payload.all);
        res.json({ devices: deviceStore.getListOfItems() });
        res.end();
    });

    return api;
}