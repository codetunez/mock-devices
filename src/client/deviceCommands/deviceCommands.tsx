var classNames = require('classnames');
const cx = classNames.bind(require('./deviceCommands.scss'));

import * as React from 'react';
import { Modal } from '../modals/modal';
import { Module } from '../modals/module';
import { Edit } from '../modals/edit';
import { RESX } from '../strings';
import { decodeModuleKey } from '../ui/utilities';
import { DeviceContext } from '../context/deviceContext';

export function DeviceCommands() {

    const deviceContext: any = React.useContext(DeviceContext);
    const [showEdit, toggleEdit] = React.useState(false);
    const [showModule, toggleModule] = React.useState(false);

    const kind = deviceContext.device.configuration._kind;
    const pnpSdk = deviceContext.device.configuration.pnpSdk;

    const index = deviceContext.devices.findIndex((x) => x._id == deviceContext.device._id);
    const edgeDevice = decodeModuleKey(deviceContext.device._id);

    return <div className='device-commands-container'>
        <div className='btn-bar'>
            {deviceContext.device.configuration.planMode ?
                <><button title={kind === 'template' ? RESX.core.templateNoSupport : RESX.device.commands.restart_title} className='btn btn-outline-primary' disabled={kind === 'template'} onClick={() => { deviceContext.planRestart() }}>{RESX.device.commands.restart_label}</button></>
                :
                <>{kind != 'edge' ? <>
                    <button title={RESX.device.commands.sendData_title} className='btn btn-info' onClick={() => { deviceContext.createCapability('property', 'd2c', pnpSdk) }}><span className='fas fa-plus'></span>{RESX.device.commands.sendData_label}</button>
                    <button title={RESX.device.commands.receiveData_title} className='btn btn-info' onClick={() => { deviceContext.createCapability('property', 'c2d', pnpSdk) }}><span className='fas fa-plus'></span>{RESX.device.commands.receiveData_label}</button>
                    <button title={RESX.device.commands.method_title} className='btn btn-info' onClick={() => { deviceContext.createCapability('method', pnpSdk) }}><span className='fas fa-plus'></span>{RESX.device.commands.method_label}</button>
                </>
                    :
                    <button title={RESX.device.commands.module_title} className='btn btn-info' onClick={() => { toggleModule(!showModule) }}><span className='fas fa-plus'></span>{RESX.device.commands.module_label}</button>
                }</>
            }
        </div>
        {kind === 'module' ?
            <div className='btn-bar'>
                <button title={RESX.device.commands.edge_device_title} className='btn btn-outline-primary' onClick={() => { { deviceContext.getDevice(edgeDevice.deviceId) } }}>{RESX.device.commands.edge_device_label}</button>
            </div>
            :
            <div className='btn-bar'>
                <button title={RESX.device.commands.config_title} className='btn btn-warning' onClick={() => { toggleEdit(!showEdit) }}><span className='fas fa-wrench'></span></button>
                <button title={RESX.device.commands.delete_title} className='btn btn-danger' onClick={() => { deviceContext.deleteDevice() }}><span className={'fas fa-lg fa-trash-alt'}></span></button>
            </div>
        }
        {showEdit ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><Edit handler={toggleEdit} index={index} /></div></Modal> : null}
        {showModule ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal small-modal'><Module handler={toggleModule} index={index} /></div></Modal> : null}
    </div>
}