var classNames = require('classnames');
const cx = classNames.bind(require('./deviceOptions.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { decodeModuleKey } from '../ui/utilities';
import { RESX } from '../strings';

export function DeviceOptions({ selection, handler }) {
    const deviceContext: any = React.useContext(DeviceContext);
    const kind = deviceContext.device.configuration._kind;

    let leafDevice = decodeModuleKey(deviceContext.device._id);
    if (kind === 'leafDevice') {
        leafDevice = {
            deviceId: deviceContext.device.configuration.gatewayDeviceId
        }
    }

    return <div className='device-options'>
        {kind === 'module' || kind === 'moduleHosted' || kind === 'leafDevice' ?
            <button title={RESX.device.commands.edge_device_title} className='btn btn-outline-primary' onClick={() => { { deviceContext.getDevice(leafDevice.deviceId) } }}>{RESX.device.commands.edge_device_label}</button>
            :
            <div className='btn-group' role='group' >
                <button className={cx('btn btn-sm', !selection ? 'btn-light' : 'btn-outline-light')}
                    title="Edge Capabilities"
                    type='button'
                    onClick={() => { handler(false) }} >Edge Capabilities</button>
                <button className={cx('btn btn-sm', selection ? 'btn-light' : 'btn-outline-light')}
                    title="Edge Devices and Modules"
                    type='button'
                    onClick={() => { handler(true) }} >Modules and leaf devices</button>
            </div>
        }
    </div>
}