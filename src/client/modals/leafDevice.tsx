var classNames = require('classnames');
const cx = classNames.bind(require('./edgeModule.scss'));
const cxM = classNames.bind(require('./leafDevice.scss'));

import Toggle from 'react-toggle';
import "react-toggle/style.css"

import * as React from 'react';
import axios from 'axios';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';
import { Combo, Json } from '../ui/controls';
import { Endpoint } from '../context/endpoint';

export const LeafDevice: React.FunctionComponent<any> = ({ handler, gatewayDeviceId, capabilityUrn }) => {

    const deviceContext: any = React.useContext(DeviceContext);
    const [state, setPayload] = React.useState({
        _kind: 'leafDevice',
        _deviceList: [],
        _plugIns: [],
        deviceId: '',
        mockDeviceName: '',
        mockDeviceCount: 1,
        mockDeviceCountMax: 1,
        mockDeviceCloneId: '',
        connectionString: '',
        scopeId: '',
        dpsPayload: { "iotcGateway": { "iotcGatewayId": gatewayDeviceId } },
        sasKey: '',
        isMasterKey: false,
        capabilityModel: '',
        capabilityUrn: capabilityUrn,
        machineState: '',
        machineStateClipboard: '',
        plugIn: '',
        gatewayDeviceId: gatewayDeviceId
    });

    React.useEffect(() => {
        let list = [];
        let plugIns = [];
        axios.get(`${Endpoint.getEndpoint()}api/devices`)
            .then((response: any) => {
                list.push({ name: RESX.modal.leafDevice.select1, value: null });
                response.data.map((ele: any) => {
                    list.push({ name: ele.configuration.mockDeviceName, value: ele._id });
                });
                return axios.get(`${Endpoint.getEndpoint()}api/plugins`);
            })
            .then((response: any) => {

                plugIns.push({ name: RESX.modal.leafDevice.select2, value: null });
                response.data.map((ele: any) => {
                    plugIns.push({ name: ele, value: ele });
                });

                setPayload({
                    ...state,
                    _deviceList: list,
                    _plugIns: plugIns
                })
            })
    }, []);

    const updateField = (e: any) => {
        setPayload({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    const toggleMasterKey = () => {
        setPayload({
            ...state,
            isMasterKey: !state.isMasterKey
        });
    }

    const getTemplate = (id: string) => {
        axios.get(`${Endpoint.getEndpoint()}api/device/${id}`)
            .then(response => {
                const json = response.data;

                let payload: any = {}
                payload.scopeId = json.configuration.scopeId
                payload.capabilityUrn = json.configuration.capabilityUrn
                payload.mockDeviceCloneId = id;
                payload.dpsPayload = Object.assign({}, state.dpsPayload, { "iotcModelId": json.configuration.capabilityUrn });

                if (json.configuration.isMasterKey) {
                    payload.sasKey = json.configuration.sasKey;
                    payload.isMasterKey = true;
                }

                setPayload(Object.assign({}, state, payload));
                document.getElementById('device-id').focus();
            })
    }

    const clickAddDevice = () => {
        const newState = Object.assign({}, state);
        delete newState._deviceList;
        delete newState._plugIns;
        deviceContext.updateDeviceModules(state, 'leafDevice');
        handler();
    }

    return <div className='dialog-module'>
        <div className='m-modal'>
            <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
            <div className='m-content'>
                <h4>{RESX.modal.leafDevice.title}</h4>
                <div className='form-group'>
                    <label>{RESX.modal.add.option1.label.clone}</label><br />
                    <Combo items={state._deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={(e) => getTemplate(e.target.value)} value={state.mockDeviceCloneId || ''} />
                </div>

                <div className='form-group'>
                    <label>{RESX.modal.plugin}</label><br />
                    <Combo items={state._plugIns} cls='custom-textarea-sm' name='plugIn' onChange={updateField} value={state.plugIn || ''} />
                </div>

                <div className='form-group'>
                    <label>{RESX.modal.add.option1.label.deviceId}</label><br />
                    <input autoComplete="off" autoFocus={true} id="device-id" className='form-control form-control-sm' type='text' name='deviceId' onChange={updateField} value={state.deviceId || ''} />
                </div>

                <div className='form-group'>
                    <label>{RESX.modal.add.option1.label.dps}</label>
                    <input autoComplete="off" className='form-control form-control-sm' type='text' name='scopeId' onChange={updateField} value={state.scopeId || ''} />
                </div>
                <div className='form-group'>
                    <label>{RESX.modal.add.option1.label.sas}</label>
                    <input autoComplete="off" className='form-control form-control-sm' type='text' name='sasKey' onChange={updateField} value={state.sasKey || ''} />
                </div>
                <div className='form-group'>
                    <label>{RESX.modal.add.option1.label.root}</label>
                    <div><Toggle name='masterKey' checked={state.isMasterKey} defaultChecked={false} onChange={() => { toggleMasterKey() }} /></div>
                </div>

                <div className='form-group' style={{ display: 'flex', alignContent: 'stretch' }}>
                    <div className='form-group' style={{ paddingRight: '10px' }} >
                        <label>{RESX.modal.add.option1.label.bulk_from}</label><br />
                        <input autoComplete="off" className='form-control form-control-sm' type='number' name='mockDeviceCount' disabled={!state.isMasterKey} onChange={updateField} value={state.mockDeviceCount || ''} />
                    </div>
                    <div className='form-group'>
                        <label>{RESX.modal.add.option1.label.bulk_to}</label><br />
                        <input autoComplete="off" className='form-control form-control-sm' type='number' name='mockDeviceCountMax' disabled={!state.isMasterKey} onChange={updateField} value={state.mockDeviceCountMax || ''} />
                    </div>
                </div>

                <div className='form-group'>
                    <label>{RESX.modal.add.option1.label.friendly}</label>
                    <input autoComplete="off" className='form-control form-control-sm' type='text' name='mockDeviceName' disabled={true} placeholder='Not supported in Beta. Device ID will be used for friendly name' />
                </div>

            </div>
            <div className='m-footer'>
                <div className='form-group btn-bar'>
                    <button title={RESX.modal.leafDevice.cta1_title} className='btn btn-info' onClick={() => clickAddDevice()}>{RESX.modal.leafDevice.cta1_label}</button>
                </div>
            </div>
        </div>
    </div>
}