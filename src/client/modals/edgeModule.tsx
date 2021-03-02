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
    const [moduleList, setModuleList] = React.useState([]);
    const [state, setPayload] = React.useState({
        _kind: 'module',
        _deviceList: [],
        _plugIns: [],
        mockDeviceCloneId: '',
        moduleId: '',
        deviceId,
        scopeId,
        sasKey,
        plugIn: ''
    });

    React.useEffect(() => {
        let list = [];
        let plugIns = [];
        axios.get(`${Endpoint.getEndpoint()}api/devices`)
            .then((response: any) => {
                list.push({ name: RESX.modal.module.select1, value: null });
                response.data.map((ele: any) => {
                    list.push({ name: ele.configuration.mockDeviceName, value: ele._id });
                });
                return axios.get(`${Endpoint.getEndpoint()}api/plugins`);
            })
            .then((response: any) => {

                plugIns.push({ name: RESX.modal.module.select2, value: null });
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

    const toggleEnvironment = () => {
        setPayload({
            ...state,
            _kind: state._kind === 'module' ? 'moduleHosted' : 'module'
        });
    }

    const save = () => {
        deviceContext.updateDeviceModules(state, 'module');
        handler();
    }

    const loadManifest = () => {
        axios.get(`${Endpoint.getEndpoint()}api/openDialog`)
            .then(response => {
                if (response.data) {
                    const modules = response.data?.modulesContent?.['$edgeAgent']?.['properties.desired']?.['modules'] || {};
                    const combo = [{ name: RESX.modal.module.select3, value: null }];
                    for (const module in modules) {
                        combo.push({ name: module, value: module })
                    }
                    setModuleList(combo);
                };
            })
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
                    <label>{RESX.modal.plugin}</label><br />
                    <Combo items={state._plugIns} cls='custom-textarea-sm' name='plugIn' onChange={updateField} value={state.plugIn || ''} />
                </div>

                <div className='form-group'>
                    <label>{RESX.modal.module.label.moduleId}</label><br />
                    <button title={RESX.modal.module.cta1_title} className='btn btn-sm btn-success' onClick={() => loadManifest()}>{RESX.modal.module.cta1_label}</button>
                </div>

                <div className='form-group'>
                    {moduleList && moduleList.length > 0 ?
                        <Combo items={moduleList} cls='custom-textarea-sm' name='moduleId' onChange={updateField} value={state.moduleId || ''} />
                        :
                        <input autoComplete="off" autoFocus={true} id="module-id" className='form-control form-control-sm' type='text' name='moduleId' onChange={updateField} value={state.moduleId || ''} placeholder={RESX.modal.module.label.moduleId_placeholder} />
                    }
                </div>

                <div className='form-group'>
                    <label>{RESX.modal.module.label.hosted}</label><br />
                    <div><Toggle name='masterKey' checked={state._kind === 'moduleHosted'} defaultChecked={false} onChange={() => { toggleEnvironment() }} /></div>
                </div>

            </div>
            <div className='m-footer'>
                <div className='form-group btn-bar'>
                    <button disabled={state.moduleId === ''} title={RESX.modal.module.cta2_title} className='btn btn-info' onClick={() => save()}>{RESX.modal.module.cta2_label}</button>
                </div>
            </div>
        </div>
    </div>
}