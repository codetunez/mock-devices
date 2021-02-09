var classNames = require('classnames');
const cx = classNames.bind(require('./connect.scss'));

import Toggle from 'react-toggle';
import ClipLoader from "react-spinners/ClipLoader";
import { Endpoint } from '../context/endpoint';
import { RESX } from '../strings';
import axios from 'axios';
import * as React from 'react';

interface State {
    data: any,
    error: string,
    fetching: boolean,
    creating: boolean
}

interface Action {
    type: any;
    payload: any;
}

const reducer = (state: State, action: Action) => {

    const newData = Object.assign({}, state.data);

    switch (action.type) {
        case "fetching-templates":
            return { ...state, data: newData, fetching: true, creating: false, error: null };
        case "creating-device":
            return { ...state, data: newData, fetching: false, creating: true, error: null };
        case "load-templates":
            newData.templates = action.payload;
            return { ...state, data: newData, fetching: false, creating: false, error: null };
        case "create-device":
            return { ...state, data: newData, fetching: false, creating: false, error: null };
        case "update":
            newData[action.payload.name] = action.payload.value;
            return { ...state, data: newData, fetching: false, creating: false, error: null };
        case "error-templates":
            newData['templates'] = [];
            return { ...state, data: newData, fetching: false, creating: false, error: action.payload };
        case "error-device":
            return { ...state, fetching: false, creating: false, error: action.payload };
        default:
            return { ...state, fetching: false, creating: false, error: null };
    }
}

export const Connect: React.FunctionComponent<any> = ({ handler }) => {

    const [state, dispatch] = React.useReducer(reducer, { data: { templates: [] }, fetching: false, creating: false, error: null });
    const [panel, showPanel] = React.useState(0);

    React.useEffect(() => {

        const getFetch = async () => {
            try {
                const response = await axios.post(`${Endpoint.getEndpoint()}api/central/templates`, {
                    appUrl: state.data.appUrl,
                    token: state.data.token
                })
                dispatch({ type: 'load-templates', payload: response.data })
            }
            catch (err) {
                dispatch({ type: 'error-templates', payload: err.response.data });
            }
        }

        const createDevice = async () => {
            const list: any = document.getElementById('templates');
            const item = list.selectedIndex > -1 ? list[list.selectedIndex].value : null;

            try {
                const response = await axios.post(`${Endpoint.getEndpoint()}api/central/create`, {
                    id: item,
                    deviceId: state.data.deviceId,
                    appUrl: state.data.appUrl,
                    token: state.data.token,
                    deviceUnique: state.data.deviceUnique
                })
                dispatch({ type: 'create-device', payload: response.data });
                handler(false);
            }
            catch (err) {
                dispatch({ type: 'error-device', payload: err.response.data });
            }
        }

        if (state.fetching) {
            getFetch()
        } else if (state.creating) {
            createDevice()
        } else {
            return;
        }
    }, [state])

    const updateField = e => {
        dispatch({ type: 'update', payload: { name: e.target.name, value: e.target.type === 'checkbox' ? e.target.checked : e.target.value } })
    }

    return <div className='dialog-central'>
        <div className='m-modal'>
            <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
            <div className='m-content'>
                <h3>{RESX.modal.connect.title} (Beta)</h3>
                <div className='form-group'>
                    <div className='btn-bar'>
                        <button className={cx('btn btn-link', panel === 0 ? 'active' : '')} onClick={() => { showPanel(0) }}>IoT Central</button>
                        <button className={cx('btn btn-link', panel === 1 ? 'active' : '')} onClick={() => { showPanel(1) }}>IoT Hub</button>
                    </div>
                </div>

                {panel === 0 ? <>
                    <div>{RESX.modal.connect.central.subtitle}</div>
                    <br />
                    <div className='form-inline'>
                        <div className='form-group'>
                            <label>{RESX.modal.connect.central.label.appUrl}</label>
                            <input className='form-control form-control-sm' type='text' name='appUrl' onChange={updateField} value={state.data.appUrl || ''} />
                        </div>
                        <div className='form-group'>
                            <label>{RESX.modal.connect.central.label.token}</label>
                            <input className='form-control form-control-sm' type='text' name='token' onChange={updateField} value={state.data.token || ''} />
                        </div>
                        <div className='form-group'>
                            <label></label>
                            <button title={RESX.modal.connect.central.cta_title} className='btn btn-sm btn-primary' disabled={false} onClick={() => { dispatch({ type: 'fetching-templates', payload: null }) }}>
                                {RESX.modal.connect.central.cta_label}
                            </button>
                        </div>
                    </div>

                    {!state.fetching ? null : <>
                        <div className="progress-container">
                            <label>{RESX.modal.connect.central.label.loading}</label>
                            <div className="p-bar"><ClipLoader color={"#fff"} size={16} /></div>
                        </div>
                    </>}

                    {!state.fetching && state.data.templates.length != 0 ? <>
                        <div>
                            <label>{RESX.modal.connect.central.label.templates}</label>
                            <div className='form-group'>
                                <select className='custom-select' id='templates' size={7}>
                                    {state.data.templates && state.data.templates.map((ele) => {
                                        if (ele) { return <option value={ele.id}>{ele.displayName}</option> }
                                    })}
                                </select>
                            </div>
                            <div className='form-inline'>
                                <div className='form-group'>
                                    <label>{RESX.modal.connect.central.label.deviceId}</label>
                                    <input className='form-control form-control-sm' type='text' name='deviceId' onChange={updateField} value={state.data.deviceId || ''} placeholder={RESX.modal.connect.central.label.deviceId_placeholder} />
                                </div>
                                <div className='form-group'>
                                    <label>{RESX.modal.connect.central.label.deviceId_block}</label>
                                    <div><Toggle name='deviceUnique' checked={state.data.deviceUnique} defaultChecked={false} onChange={updateField} /></div>
                                </div>
                            </div>
                            <button title={RESX.modal.connect.central.cta2_title} className='btn btn-success' disabled={!state.data.deviceId} onClick={() => { dispatch({ type: 'creating-device', payload: null }) }}>
                                <div className="button-spinner">
                                    {RESX.modal.connect.central.cta2_label}
                                    {state.creating && <ClipLoader color={"#fff"} size={16} /> || null}
                                </div>
                            </button>
                        </div>
                        <br />
                    </> : null}

                    {!state.error ? null : <>
                        <div className='error'>{state.error}</div>
                    </>}

                </> : null}

                {panel === 1 ? <>
                    <div>{RESX.modal.connect.hub.subtitle}</div>
                    <br />
                </> : null}

            </div>
        </div>
    </div>
}
