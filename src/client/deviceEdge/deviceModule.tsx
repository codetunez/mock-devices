var classNames = require('classnames');
const cx2 = classNames.bind(require('../selector/selectorCard.scss'));
const cx = classNames.bind(require('./deviceEdge.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { AppContext } from '../context/appContext';
import { RESX } from '../strings';
import { decodeModuleKey, controlEvents } from '../ui/utilities';
import { Modal } from '../modals/modal';
import { ModalConfirm } from '../modals/modalConfirm';

export function DeviceModule({ index, compositeKey, running, type, docker }) {

    const deviceContext: any = React.useContext(DeviceContext);
    const appContext: any = React.useContext(AppContext);

    const [showDelete, toggleDelete] = React.useState(false);

    const deleteDialogAction = (result) => {
        if (result === "Yes") {
            //TODO: refactor
            appContext.clearDirty();
            deviceContext.deleteModule(compositeKey);
        }
        toggleDelete(false);
    }

    const deleteModalConfig = {
        title: RESX.modal.delete_title,
        message: RESX.modal.delete_module,
        options: {
            buttons: [RESX.modal.YES, RESX.modal.NO],
            handler: deleteDialogAction,
            close: () => toggleDelete(false)
        }
    }

    let moduleId, deviceId, title: any = '';
    if (type === 'module') {
        const decoded = decodeModuleKey(compositeKey);
        moduleId = decoded.moduleId;
        deviceId = decoded.deviceId;
        title = RESX.edge.card.title_module;
    } else {
        moduleId = `(${compositeKey})`
        deviceId = compositeKey;
        title = RESX.edge.card.title_device;
    }

    return <>
        <div className="edge-module">
            <div className='expander'>
                <div>{title} {index + 1}</div>
                {docker && docker[compositeKey] ? <i className="fab fa-docker fa-fw" /> : null}
                <button title={RESX.edge.buttons.delete_title} className='btn btn-sm btn-outline-danger' onClick={() => toggleDelete(!showDelete)}><span className='fa fa-times'></span></button>
            </div>
            <button className='selector-card selector-card-expanded' onClick={() => { deviceContext.getDevice(compositeKey) }}>
                <h4>{moduleId || 'LEAF DEVICE'}</h4>
                <strong>{deviceId || ''}</strong>
                <div className='selector-card-spinner'>
                    <i className={cx('fas fa-spinner fa-2x fa-fw', { 'fa-pulse': running != controlEvents.OFF })} ></i>
                </div>
                <div className={'control control-' + running}>{running}</div>
            </button>
        </div>
        { showDelete ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal min-modal'><ModalConfirm config={deleteModalConfig} /></div></Modal> : null}
    </>
}