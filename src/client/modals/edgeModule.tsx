var classNames = require('classnames');
const cx = classNames.bind(require('./edgeModule.scss'));
const cxM = classNames.bind(require('./modal.scss'));
import "react-toggle/style.css"

import * as React from 'react';
import axios from 'axios';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';
import { Combo, Json } from '../ui/controls';
import { Endpoint } from '../context/endpoint';
import Toggle from 'react-toggle';

export const EdgeModule: React.FunctionComponent<any> = ({ handler, deviceId, scopeId, sasKey }) => {

    const deviceContext: any = React.useContext(DeviceContext);
    const [state, setPayload] = React.useState({
        _deviceList: [], mockDeviceCloneId: '', moduleId: '', environmentModule: false,
        deviceId,
        scopeId,
        sasKey
    });

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

    const toggleEnvironment = () => {
        setPayload({
            ...state,
            environmentModule: !state.environmentModule
        });
    }


    const save = () => {
        deviceContext.updateDeviceModules({
            mockDeviceCloneId: state.mockDeviceCloneId,
            moduleId: state.moduleId,
            environmentModule: state.environmentModule,
            deviceId: state.deviceId,
            scopeId: state.scopeId,
            sasKey: state.sasKey,
        });
        handler();
    }

    return <div className='dialog-module'>
        <div className='m-modal'>
            <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
            <div className='m-content'>
                <h4>{RESX.modal.module.title}</h4>
                <div className='form-group'>
                    <label>{RESX.modal.module.label.clone}</label><br />
                    <Combo items={state._deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={updateField} value={state.mockDeviceCloneId || ''} />
                </div>
                <div className='form-group'>
                    <label>{RESX.modal.module.label.moduleId}</label><br />
                    <input autoComplete="off" autoFocus={true} id="module-id" className='form-control form-control-sm' type='text' name='moduleId' onChange={updateField} value={state.moduleId || ''} />
                </div>

                <div className='form-group'>
                    <label>Make this an environment module for Docker execution</label><br />
                    <div><Toggle name='masterKey' checked={state.environmentModule} defaultChecked={false} onChange={() => { toggleEnvironment() }} /></div>
                </div>

            </div>
            <div className='m-footer'>
                <div className='form-group btn-bar'>
                    <button disabled={state.moduleId === ''} title={RESX.modal.module.cta_title} className='btn btn-info' onClick={() => save()}>{RESX.modal.module.cta_label}</button>
                </div>
            </div>
        </div>
    </div>
}