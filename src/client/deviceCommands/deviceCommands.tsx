var classNames = require('classnames');
const cx = classNames.bind(require('./deviceCommands.scss'));

import * as React from 'react';
import { Modal } from '../modals/modal';
import { Edit } from '../modals/edit';
import { RESX } from '../strings';

import { DeviceContext } from '../context/deviceContext';

export function DeviceCommands() {

    const deviceContext: any = React.useContext(DeviceContext);
    const [showEdit, toggleEdit] = React.useState(false);

    const template = deviceContext.device.configuration._kind === 'template';
    const pnpSdk = deviceContext.device.configuration.pnpSdk;

    const index = deviceContext.devices.findIndex((x) => x._id == deviceContext.device._id);

    return <>{deviceContext.device.configuration.planMode ?
        <div className='device-commands-container'>
            <div className='btn-bar'>
                <button title={template ? RESX.core.templateNoSupport : RESX.device.commands.restart_title} className='btn btn-outline-primary' disabled={template} onClick={() => { deviceContext.planRestart() }}>{RESX.device.commands.restart_label}</button>
            </div>
        </div>
        :
        <div className='device-commands-container'>
            <div className='btn-bar'>
                <button title={RESX.device.commands.sendData_title} className='btn btn-info' onClick={() => { deviceContext.createCapability('property', 'd2c', pnpSdk) }}><span className='fas fa-plus'></span>{RESX.device.commands.sendData_label}</button>
                {!deviceContext.device.configuration.pnpSdk ?
                    <>
                        <button title={RESX.device.commands.receiveData_title} className='btn btn-info' onClick={() => { deviceContext.createCapability('property', 'c2d', pnpSdk) }}><span className='fas fa-plus'></span>{RESX.device.commands.receiveData_label}</button>
                        <button title={RESX.device.commands.method_title} className='btn btn-info' onClick={() => { deviceContext.createCapability('method', pnpSdk) }}><span className='fas fa-plus'></span>{RESX.device.commands.method_label}</button>
                    </>
                    : null}
            </div>
            <div className='btn-bar'>
                <button title={RESX.device.commands.config_title} className='btn btn-warning' onClick={() => { toggleEdit(!showEdit) }}><span className='fas fa-wrench'></span></button>
                <button title={RESX.device.commands.delete_title} className='btn btn-danger' onClick={() => { deviceContext.deleteDevice() }}><span className={'fas fa-lg fa-trash-alt'}></span></button>
            </div>
            {showEdit ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><Edit handler={toggleEdit} index={index} /></div></Modal> : null}
        </div>
    }</>
}