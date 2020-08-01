var classNames = require('classnames');
const cx = classNames.bind(require('./deviceTitle.scss'));

import * as React from 'react';
import Toggle from 'react-toggle';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';

export function DeviceTitle() {

    const deviceContext: any = React.useContext(DeviceContext);

    const kind = deviceContext.device.configuration._kind;

    return <div className='device-title-container'>
        <div>{deviceContext.device.configuration && deviceContext.device.configuration.mockDeviceName}</div>
        {kind === 'edge' ? null : <>
            <div style={{ display: 'flex' }}>
                <div style={{ paddingRight: '8px' }}>{RESX.device.title.planMode}</div>
                <div title={kind === 'edge' ? RESX.core.edgeNoSupport : RESX.device.title.planMode_title}>
                    <Toggle name={'plan-mode'} disabled={kind === 'edge' || deviceContext.device['comms'].length === 0} defaultChecked={false} checked={deviceContext.device.configuration.planMode} onChange={(e) => { deviceContext.updateDeviceConfiguration({ planMode: e.target.checked }) }} />
                </div>
            </div>
        </>
        }
    </div>
}