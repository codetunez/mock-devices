var classNames = require('classnames');
const cx = classNames.bind(require('./central.scss'));

import { Endpoint } from '../context/endpoint';
import { RESX } from '../strings';
import axios from 'axios';

import * as React from 'react';

interface State {
    data: any
}

interface Action {
    type: any;
    payload: any;
}

const reducer = (state: State, action: Action) => {

    const newData = Object.assign({}, state.data);

    switch (action.type) {
        case "load-templates":
            newData.templates = action.payload;
            return { ...state, data: newData };
        case "create-device":
            return { ...state, data: newData };
        case "update":
            newData[action.payload.name] = action.payload.value;
            return { ...state, data: newData };
        default:
            return state
    }
}

export const Central: React.FunctionComponent<any> = ({ handler }) => {

    const [state, dispatch] = React.useReducer(reducer, { data: { templates: [] } });

    const getTemplates = () => {
        axios.post(`${Endpoint.getEndpoint()}api/central/templates`, {
            name: state.data.name,
            token: state.data.token
        })
            .then((res) => {
                dispatch({ type: 'load-templates', payload: res.data })
            })
            .catch((err) => {
            })
    }

    const createDevice = () => {

        const list: any = document.getElementById('templates');
        const item = list.selectedIndex > -1 ? list[list.selectedIndex].value : null;

        axios.post(`${Endpoint.getEndpoint()}api/central/create`, {
            id: item,
            deviceId: state.data.deviceId
        })
            .then((res) => {
                dispatch({ type: 'create-device', payload: res.data })
            })
            .catch((err) => {
            })
    }

    const updateField = e => {
        dispatch({ type: 'update', payload: { name: e.target.name, value: e.target.value } })
    }

    return <div className='dialog-central'>
        <div className='m-modal'>
            <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
            <div className='m-content'>
                <div className='form-inline'>
                    <h3>{RESX.modal.central.title}</h3>
                    <div className='form-group'>
                        <label>{RESX.modal.central.label.name}</label>
                        <input className='form-control form-control-sm' name='name' onChange={updateField} value={state.data.name || ''} />
                    </div>
                    <div className='form-group'>
                        <label>{RESX.modal.central.label.token}</label>
                        <input className='form-control form-control-sm' type='text' name='token' onChange={updateField} value={state.data.token || ''} />
                    </div>
                    <div className='form-group'>
                        <label></label>
                        <button title={RESX.modal.central.cta_title} className='btn btn-sm btn-primary' disabled={false} onClick={() => { getTemplates() }}>{RESX.modal.central.cta_label}</button>
                    </div>
                </div>
                <br />
                {state.data.templates.length === 0 ? null : <>
                    <label>{RESX.modal.central.label.templates}</label>
                    <div className='form-group'>
                        <select id='templates' size={8}>
                            {state.data.templates && state.data.templates.map((ele) => {
                                if (ele) { return <option value={ele.id}>{ele.displayName}</option> }
                            })}
                        </select>
                    </div>
                    <div className='form-group'>
                        <label>{RESX.modal.central.label.deviceId}</label>
                        <input className='form-control form-control-sm' name='deviceId' onChange={updateField} value={state.data.deviceId || ''} />
                    </div>
                    <button title={RESX.modal.central.cta2_title} className='btn btn-success' disabled={false} onClick={() => { createDevice() }}>{RESX.modal.central.cta2_label}</button>
                </>
                }
            </div>
        </div>
    </div>
}
