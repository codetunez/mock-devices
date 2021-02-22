var classNames = require('classnames');
const cx = classNames.bind(require('./edgeModule.scss'));
const cxM = classNames.bind(require('./edgeDevice.scss'));
import "react-toggle/style.css"

import * as React from 'react';
import axios from 'axios';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';
import { Combo, Json } from '../ui/controls';
import { Endpoint } from '../context/endpoint';

export const EdgeDevice: React.FunctionComponent<any> = ({ handler, gatewayId }) => {

    const deviceContext: any = React.useContext(DeviceContext);
    const [state, setPayload] = React.useState({
        _deviceList: [],
        _kind: 'edgeDevice',
        mockDeviceCloneId: '',
        deviceId: '',
        scopeId: '',
        sasKey: '',
        gatewayId: gatewayId,
        mockDeviceCount: 1,
        mockDeviceCountMax: 1
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

    const clickAddDevice = () => {
        axios.post(`${Endpoint.getEndpoint()}api/device/new`, state)
            .then(res => {
                deviceContext.setDevices(res.data);
                handler(false);
            })
            .catch((err) => {

            })
    }

    return <div className='dialog-module'>
        <div className='m-modal'>
            <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
            <div className='m-content'>
                <h4>Edge Device</h4>
                <div className='form-group'>
                    <label>{RESX.modal.module.label.clone}</label><br />
                    <Combo items={state._deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={updateField} value={state.mockDeviceCloneId || ''} />
                </div>
                <div className='form-group'>
                    <label>Device ID</label><br />
                    <input autoComplete="off" className='form-control form-control-sm' type='text' name='deviceId' onChange={updateField} value={state.deviceId || ''} />
                </div>

                <div className='form-group'>
                    <label>{RESX.modal.add.option1.label.dps}</label>
                    <input autoComplete="off" className='form-control form-control-sm' type='text' name='scopeId' onChange={updateField} value={state.scopeId || ''} />
                </div>
                <div className='form-group'>
                    <label>{RESX.modal.add.option1.label.sas}</label>
                    <input autoComplete="off" className='form-control form-control-sm' type='text' name='sasKey' onChange={updateField} value={state.sasKey || ''} />
                </div>
            </div>
            <div className='m-footer'>
                <div className='form-group btn-bar'>
                    <button title={RESX.modal.module.cta_title} className='btn btn-info' onClick={() => clickAddDevice()}>Create this device</button>
                </div>
            </div>
        </div>
    </div>
}