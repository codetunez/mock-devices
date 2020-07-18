var classNames = require('classnames');
const cx = classNames.bind(require('./deviceToolbar.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { AppContext } from '../context/appContext';

import { RESX } from '../strings';

export function DeviceToolbar() {

    const deviceContext: any = React.useContext(DeviceContext);
    const appContext: any = React.useContext(AppContext);
    const [power, setPower] = React.useState<any>({});

    React.useEffect(() => {
        const on = appContext.control[deviceContext.device._id] && appContext.control[deviceContext.device._id][2] != 'OFF' || false;
        setPower({
            label: on ? RESX.device.toolbar.powerOff_label : RESX.device.toolbar.powerOn_label,
            title: on ? RESX.device.toolbar.powerOff_title : RESX.device.toolbar.powerOn_title,
            style: on ? "btn-success" : "btn-outline-secondary",
            handler: on ? deviceContext.stopDevice : deviceContext.startDevice
        })
    }, [deviceContext.device, appContext])

    const template = deviceContext.device.configuration._kind === 'template';

    return <div className='device-toolbar-container'>
        <div className='power'>
            <button title={template ? RESX.core.templateNoSupport : power.title} className={cx('btn', power.style)} disabled={deviceContext.device.configuration._kind === 'template'} onClick={() => { power.handler() }}><span className='fas fa-power-off'></span>{power.label}</button>
        </div>
        <div className='type'>
            {template ? RESX.device.toolbar.kindTemplate : RESX.device.toolbar.kindReal}
            {deviceContext.device.configuration.pnpSdk ? RESX.device.toolbar.sdkPnp : RESX.device.toolbar.sdkLegacy}
        </div>
    </div >
}