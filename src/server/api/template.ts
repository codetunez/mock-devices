import { Router } from 'express';
import { DeviceStore } from '../store/deviceStore'
import { DCMtoMockDevice } from '../core/templates';

export default function (deviceStore: DeviceStore) {
    let api = Router();

    api.post('/dcm', function (req, res) {
        var dcm = req.body;
        DCMtoMockDevice({
            _kind: 'template',
            capabilityModel: JSON.stringify(dcm)
        }, deviceStore);
        res.json(deviceStore.getListOfItems());
        res.end();
    });

    return api;
}