var classNames = require('classnames');
const cx = classNames.bind(require('./module.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import * as React from 'react';
import axios from 'axios';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';
import { Combo, Json } from '../ui/controls';
import { Endpoint } from '../context/endpoint';

export const Module: React.FunctionComponent<any> = ({ handler, index }) => {

    const deviceContext: any = React.useContext(DeviceContext);
    const [state, setPayload] = React.useState({ _deviceList: [], mockDeviceCloneId: '', moduleId: '' });

    React.useEffect(() => {
        let list = [];
        axios.get(`${Endpoint.getEndpoint()}api/devices`)
            .then((response: any) => {
                list.push({ name: RESX.modal.add.option1.select, value: null });
                response.data.map(function (ele: any) {
                    if (ele.configuration._kind != 'template' && ele.configuration._kind != 'edge') {
                        list.push({ name: ele.configuration.mockDeviceName, value: ele._id });
                    }
                });
                setPayload({
                    ...state,
                    _deviceList: list
                })
            })
    }, []);

    const updateField = (e: any) => {
        setPayload({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    const save = () => {
        deviceContext.updateDeviceModules({
            mockDeviceCloneId: state.mockDeviceCloneId,
            moduleId: state.moduleId
        });
        handler();
    }

    return <div className='m-modal'>
        <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='m-content'>
            <div className='module'>
                <h5>{RESX.modal.module.title}</h5>
                <div className='form-group'>
                    <label>{RESX.modal.module.label.clone}</label><br />
                    <Combo items={state._deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={updateField} value={state.mockDeviceCloneId || ''} />
                </div>
                <div className='form-group'>
                    <label>{RESX.modal.module.label.moduleId}</label><br />
                    <input autoFocus={true} id="module-id" className='form-control form-control-sm' type='text' name='moduleId' onChange={updateField} value={state.moduleId || ''} />
                </div>
            </div>
            <div className='m-footer module-footer'>
                <div className='form-group'>
                    <button disabled={state.moduleId === ''} title={RESX.modal.module.cta_title} className='btn btn-info' onClick={() => save()}>{RESX.modal.module.cta_label}</button>
                </div>
            </div>
        </div>
    </div>
}