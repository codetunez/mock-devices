var classNames = require('classnames');
const cx = classNames.bind(require('./deviceToolbar.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';

export function DeviceToolbar() {

    const deviceContext: any = React.useContext(DeviceContext);
    const [power, setPower] = React.useState<any>({});

    React.useEffect(() => {
        setPower({
            label: deviceContext.device.running ? RESX.device.toolbar.powerOff_label : RESX.device.toolbar.powerOn_label,
            title: deviceContext.device.running ? RESX.device.toolbar.powerOff_title : RESX.device.toolbar.powerOff_title,
            style: deviceContext.device.running ? "btn-success" : "btn-outline-secondary",
            handler: deviceContext.device.running ? deviceContext.stopDevice : deviceContext.startDevice
        })
    }, [deviceContext.device])


    React.useEffect(() => {
        const p = deviceContext.powers[deviceContext.device._id];
        if (p != null || p != undefined) {
            setPower({
                label: p ? RESX.device.toolbar.powerOff_label : RESX.device.toolbar.powerOn_label,
                title: p ? RESX.device.toolbar.powerOff_title : RESX.device.toolbar.powerOff_title,
                style: p ? "btn-success" : "btn-outline-secondary",
                handler: p ? deviceContext.stopDevice : deviceContext.startDevice
            })
        }
    }, [deviceContext.powers])

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