var classNames = require('classnames');
const cx = classNames.bind(require('./devicePower.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { ControlContext } from '../context/controlContext';
import { controlEvents } from '../ui/utilities';
import { RESX } from '../strings';

export function DevicePower({ control }) {

    const deviceContext: any = React.useContext(DeviceContext);
    const controlContext: any = React.useContext(ControlContext);
    const [power, setPower] = React.useState<any>({});
    const kind = deviceContext.device.configuration._kind;

    React.useEffect(() => {
        const on = control && control[deviceContext.device._id] ? control[deviceContext.device._id][2] != controlEvents.OFF : false;
        setPower({
            label: on ? RESX.device.toolbar.powerOff_label : RESX.device.toolbar.powerOn_label,
            title: on ? RESX.device.toolbar.powerOff_title : RESX.device.toolbar.powerOn_title,
            style: on ? "btn-success" : "btn-outline-secondary",
            handler: on ? deviceContext.stopDevice : deviceContext.startDevice
        })
    }, [deviceContext.device, control])

    React.useEffect(() => {
        return () => {
            controlContext.killConnection();
        }
    }, []);

    return <div className='device-toolbar-container'>
        <div className='power'>
            <button title={kind === 'template' ? RESX.core.templateNoSupport : kind === 'edge' ? RESX.core.edgeNoSupport : power.title} className={cx('btn', power.style)} disabled={kind === 'template' || kind === 'edge'} onClick={() => { power.handler() }}><span className='fas fa-power-off'></span>{power.label}</button>
        </div>
        <div className='type'>
            {kind === 'template' ? RESX.device.toolbar.kindTemplate : kind === 'edge' ? RESX.device.toolbar.kindEdge : kind === 'module' ? RESX.device.toolbar.kindModule : RESX.device.toolbar.kindReal}
        </div>
    </div>
}