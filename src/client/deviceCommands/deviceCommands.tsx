var classNames = require('classnames');
const cx = classNames.bind(require('./deviceCommands.scss'));

import * as React from 'react';
import { Modal } from '../modals/modal';
import { EdgeModule } from '../modals/edgeModule';
import { LeafDevice } from '../modals/leafDevice';
import { Edit } from '../modals/edit';
import { RESX } from '../strings';
import { decodeModuleKey } from '../ui/utilities';
import { DeviceContext } from '../context/deviceContext';
import { AppContext } from '../context/appContext';
import { ModalConfirm } from '../modals/modalConfirm';

export function DeviceCommands() {

    const deviceContext: any = React.useContext(DeviceContext);
    const appContext: any = React.useContext(AppContext);

    const [showEdit, toggleEdit] = React.useState(false);
    const [showEdgeModule, toggleEdgeModule] = React.useState(false);
    const [showEdgeDevice, toggleEdgeDevice] = React.useState(false);
    const [showDelete, toggleDelete] = React.useState(false);
    const [showDirty, toggleDirty] = React.useState(false);

    const kind = deviceContext.device.configuration._kind;
    const index = deviceContext.devices.findIndex((x) => x._id == deviceContext.device._id);

    const deleteDialogAction = (result) => {
        if (result === "Yes") {
            //TODO: refactor
            appContext.clearDirty();
            deviceContext.deleteDevice();
        }
        toggleDelete(false);
    }

    const deleteModalConfig = {
        title: RESX.modal.delete_title,
        message: kind === 'edge' ? RESX.modal.delete_edge : kind === 'template' ? RESX.modal.delete_template : RESX.modal.delete_device,
        options: {
            buttons: [RESX.modal.YES, RESX.modal.NO],
            handler: deleteDialogAction,
            close: () => toggleDelete(false)
        }
    }

    const dirtyModalConfig = {
        title: RESX.modal.device.add_capability_title,
        message: RESX.modal.save_first,
        options: {
            buttons: [RESX.modal.OK],
            handler: () => toggleDirty(false),
            close: () => toggleDirty(false)
        }
    }

    const checkDirty = (type: string, direction?: string) => {
        if (appContext.getDirty() != '') {
            toggleDirty(true);
        } else {
            deviceContext.createCapability(type, direction);
        }
    }

    return <div className='device-commands-container'>
        <div className='btn-bar'>
            {deviceContext.device.configuration.planMode ?
                <><button title={kind === 'template' ? RESX.core.templateNoSupport : RESX.device.commands.restart_title} className='btn btn-outline-primary' disabled={kind === 'template'} onClick={() => { deviceContext.planRestart() }}>{RESX.device.commands.restart_label}</button></>
                :
                <>{kind != 'edge' ? <>
                    <button title={RESX.device.commands.sendData_title} className='btn btn-info' onClick={() => { checkDirty('property', 'd2c') }}><span className='fas fa-plus'></span>{RESX.device.commands.sendData_label}</button>
                    <button title={RESX.device.commands.receiveData_title} className='btn btn-info' onClick={() => { checkDirty('property', 'c2d') }}><span className='fas fa-plus'></span>{RESX.device.commands.receiveData_label}</button>
                    <button title={RESX.device.commands.method_title} className='btn btn-info' onClick={() => { checkDirty('method') }}><span className='fas fa-plus'></span>{RESX.device.commands.method_label}</button>
                </>
                    :
                    <>
                        <button title={RESX.device.commands.module_title} className='btn btn-info' onClick={() => { toggleEdgeModule(!showEdgeModule) }}><span className='fas fa-plus'></span>{RESX.device.commands.module_label}</button>
                        <button title={RESX.device.commands.module_title} className='btn btn-info' onClick={() => { toggleEdgeDevice(!showEdgeDevice) }}><span className='fas fa-plus'></span> Leaf Device</button>
                    </>
                }</>
            }
        </div>
        <div className='btn-bar'>
            <button title={RESX.device.commands.config_title} className='btn btn-warning' onClick={() => { toggleEdit(!showEdit) }}><span className='fas fa-wrench'></span></button>
            <button title={RESX.device.commands.delete_title} className='btn btn-danger' onClick={() => { toggleDelete(!showDelete) }}><span className={'fas fa-lg fa-trash-alt'}></span></button>
        </div>
        {showEdit ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal min-modal'><Edit handler={toggleEdit} index={index} /></div></Modal> : null}
        {showEdgeModule ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal min-modal'><EdgeModule handler={toggleEdgeModule} index={index} scopeId={deviceContext.device.configuration.scopeId} deviceId={deviceContext.device.configuration.deviceId} sasKey={deviceContext.device.configuration.sasKey} /></div></Modal> : null}
        {showEdgeDevice ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal height-modal'><LeafDevice handler={toggleEdgeDevice} gatewayDeviceId={deviceContext.device.configuration.deviceId} capabilityUrn={deviceContext.device.configuration.capabilityUrn || ''} /></div></Modal> : null}
        {showDelete ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal min-modal'><ModalConfirm config={deleteModalConfig} /></div></Modal> : null}
        {showDirty ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal min-modal'><ModalConfirm config={dirtyModalConfig} /></div></Modal> : null}
    </div>
}