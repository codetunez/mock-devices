var classNames = require('classnames');
const cx = classNames.bind(require('./deviceTitle.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';

export function DeviceTitle() {
    const deviceContext: any = React.useContext(DeviceContext);
    const kind = deviceContext.device.configuration._kind;
    const planMode = deviceContext.device.configuration.planMode;

    return <div className='device-title-container'>
        <div>{deviceContext.device.configuration && deviceContext.device.configuration.mockDeviceName}</div>
        {kind === 'edge' ? null :
            <>
                <div className='btn-group' role='group' >
                    <button className={cx('btn btn-sm', !planMode ? 'btn-light' : 'btn-outline-light')}
                        title={RESX.device.title.interactiveMode_title}
                        type='button'
                        onClick={() => { deviceContext.updateDeviceConfiguration({ planMode: false }) }} >{RESX.device.title.interactiveMode}</button>
                    <button className={cx('btn btn-sm', planMode ? 'btn-light' : 'btn-outline-light')}
                        disabled={deviceContext.device['comms'].length === 0}
                        title={RESX.device.title.planMode_title}
                        type='button'
                        onClick={() => { deviceContext.updateDeviceConfiguration({ planMode: true }) }} >{RESX.device.title.planMode}</button>
                </div>
            </>
        }
    </div>
}