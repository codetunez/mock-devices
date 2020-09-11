var classNames = require('classnames');
const cx = classNames.bind(require('./devicePower.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { ControlContext } from '../context/controlContext';
import { controlEvents } from '../ui/utilities';
import { Modal } from '../modals/modal';
import { Reapply } from '../modals/reapply';
import { RESX } from '../strings';

export function DevicePower({ control }) {

    const deviceContext: any = React.useContext(DeviceContext);
    const controlContext: any = React.useContext(ControlContext);
    const [power, setPower] = React.useState<any>({});
    const [showReapply, toggleReapply] = React.useState(false);

    const kind = deviceContext.device.configuration._kind;

    React.useEffect(() => {
        const on = control && control[deviceContext.device._id] ? control[deviceContext.device._id][2] != controlEvents.OFF : false;
        setPower({
            label: on ? RESX.device.toolbar.powerOff_label : RESX.device.toolbar.powerOn_label,
            title: on ? RESX.device.toolbar.powerOff_title : RESX.device.toolbar.powerOn_title,
            style: on ? "btn-success" : "btn-outline-secondary",
            handler: on ? deviceContext.stopDevice : deviceContext.startDevice
        })
    }, [deviceContext.device, control[deviceContext.device._id]])

    return <div className='device-toolbar-container'>
        <div className='power'>
            {kind === 'template' ?
                <button title={RESX.device.toolbar.reapply_title} className={cx('btn btn-outline-primary')} onClick={() => { toggleReapply(!showReapply) }}>{RESX.device.toolbar.reapply_label}</button>
                :
                <button title={kind === 'edge' ? RESX.core.edgeNoSupport : power.title} className={cx('btn', power.style)} disabled={kind === 'template' || kind === 'edge'} onClick={() => { power.handler() }}><span className='fas fa-power-off'></span>{power.label}</button>
            }
        </div>

        <div className='type'>
            {kind === 'template' ? RESX.device.toolbar.kindTemplate : kind === 'edge' ? RESX.device.toolbar.kindEdge : kind === 'module' ? RESX.device.toolbar.kindModule : RESX.device.toolbar.kindReal}
        </div>
        {showReapply ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><Reapply handler={toggleReapply} /></div></Modal> : null}
    </div>
}