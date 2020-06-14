var classNames = require('classnames');
const cx = classNames.bind(require('./deviceFields.scss'));
import "react-toggle/style.css"

import axios from 'axios';
import * as React from 'react';
import Toggle from 'react-toggle';
import { DeviceContext } from '../context/deviceContext';
import { AppContext, AppProvider } from '../context/uxContext';
import { RESX } from '../strings';

import { Combo } from '../ui/controls';

interface Form {
    dirty: boolean;
    expanded: boolean;
}

interface State {
    form: Form,
    data: any
}

interface Action {
    type: string;
    payload: any;
}
const initialState: State = {
    form: {
        dirty: false,
        expanded: false
    },
    data: {}
}

const reducer = (state: State, action: Action) => {

    const item = action.type.split('-')[1]
    const newData = Object.assign({}, state.data);

    switch (action.type) {
        case "init-expand":
            return { ...state, form: { dirty: state.form.dirty, expanded: action.payload.expand } };
        case "toggle-expand":
            action.payload.context.setExpand(newData._id);
            return { ...state, form: { dirty: state.form.dirty, expanded: action.payload.expand } };
        case "toggle-enabled":
        case "update-capability":
            if (action.payload.name === 'string') {
                newData[action.payload.name] = (action.payload.value === 'true' ? true : false);
            }
            else {
                newData[action.payload.name] = action.payload.value;
            }
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "update-interface":
            newData.interface[action.payload.name] = action.payload.value;
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "toggle-complex":
            newData.enabled = true;
            newData.type.mock = false;
            newData.propertyObject.type = newData.propertyObject.type === 'templated' ? 'default' : 'templated';
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "toggle-runloop":
            newData.enabled = true;
            if (newData.type.mock) { newData.type.mock = false; }
            newData.runloop.include = !newData.runloop.include;
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "toggle-mock":
            newData.enabled = true;
            newData.type.mock = !newData.type.mock;
            if (newData.type.mock && !newData.runloop.include) { newData.runloop.include = true; }
            if (newData.type.mock) { newData.propertyObject.type = 'default'; }
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "update-runloop":
            newData.runloop[action.payload.name] = action.payload.value;
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "update-complex":
            newData.propertyObject[action.payload.name] = action.payload.value;
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "update-mock":
            newData.mock[action.payload.name] = action.payload.value;
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "update-sensor":
            newData.type.mock = true;
            newData.mock = action.payload.mock;
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "load-capability":
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: action.payload.capability };
        case "save-capability":
            action.payload.context.updateDeviceProperty(state.data, action.payload.send);
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: newData };
        default:
            return state;
    }
}

export function DeviceFieldD2C({ capability, sensors, shouldExpand, pnp, template }) {

    const [state, dispatch] = React.useReducer(reducer, { form: { dirty: false, expanded: shouldExpand }, data: capability });

    const deviceContext: any = React.useContext(DeviceContext);
    const appContext: any = React.useContext(AppContext);

    React.useEffect(() => {
        dispatch({ type: 'init-expand', payload: { expand: shouldExpand, context: appContext } })
    }, [shouldExpand]);

    React.useEffect(() => {
        dispatch({ type: 'load-capability', payload: { capability: capability } })
    }, [capability]);

    React.useEffect(() => {
        dispatch({ type: 'load-device', payload: { device: deviceContext.device } })
    }, [deviceContext.device]);

    const updateField = (e: any) => {

        switch (e.target.name) {
            case 'propertyObject.template':
                dispatch({ type: 'update-complex', payload: { name: e.target.name, value: e.target.value } })
                break;
            case 'runloop.unit':
                dispatch({ type: 'update-runloop', payload: { name: "unit", value: e.target.value } })
                break;
            case 'runloop.value':
                dispatch({ type: 'update-runloop', payload: { name: "value", value: e.target.value } })
                break;
            case 'interface.name':
                dispatch({ type: 'update-interface', payload: { name: "name", value: e.target.value } })
                break;
            case 'interface.urn':
                dispatch({ type: 'update-interface', payload: { name: "urn", value: e.target.value } })
                break;
            default:
                dispatch({ type: 'update-capability', payload: { name: e.target.name, value: e.target.value } })
                break
        }
    }

    const updateMockField = (e: any) => {
        dispatch({ type: 'update-mock', payload: { name: e.target.name, value: e.target.value } })
    }


    const clickSensor = (sensor: any) => {
        axios.get('/api/sensors/' + sensor._type)
            .then((response: any) => {
                dispatch({ type: 'update-sensor', payload: { mock: response.data } })
            })
    }

    const save = (send: boolean) => {
        if (state.data.type.mock && (!state.data.mock || state.data.mock === undefined)) {
            alert(RESX.device.card.save_pre_error);
            return;
        }

        dispatch({ type: 'save-capability', payload: { context: deviceContext, send: send } })
    }

    const title = () => {
        const loop = state.data.runloop.include ? ' every ' + state.data.runloop.value + ' ' + state.data.runloop.unit : '';
        const mock = state.data.mock && state.data.type.mock ? ' (mock ' + state.data.mock._type + ')' : '';
        return `Send ${state.data.sdk} ${loop} ${mock}`
    }

    let fields = [];
    if (state.data.mock) {
        let keyCounter = 0;
        for (var field in state.data.mock) {
            if (field[0] != '_') {
                fields.push(<div key={keyCounter}>
                    <label title={field}>{state.data.mock._resx[field]}</label>
                    <input type='text' className='form-control form-control-sm' onChange={updateMockField} name={field} value={state.data.mock[field]} />
                </div>)
                keyCounter++;
            }
        }
    }

    let valueLabel = RESX.device.card.send.value_label;
    let valuePlaceholder = '';
    let valueOverride = false;
    let valueSend = state.data.value;

    if (state.data.propertyObject.type === 'templated') {
        valueLabel = RESX.device.card.send.value_complex_label;
        valuePlaceholder = RESX.device.card.send.value_complex_placeholder;
        valueOverride = true;
        valueSend = ''
    } else if (state.data.type.mock) {
        valueLabel = RESX.device.card.send.value_mock_label;
        valuePlaceholder = RESX.device.card.send.value_mock_placeholder;
        valueOverride = true;
    }

    return <AppProvider>
        <div className={cx('device-field-card', state.form.expanded ? '' : 'device-field-card-small')} style={capability.color ? { backgroundColor: capability.color } : {}}>

            <div className='df-card-header'>
                <div className='df-card-title'>
                    <div className='df-card-title-chevron' onClick={() => { dispatch({ type: 'toggle-expand', payload: { expand: !state.form.expanded, context: appContext } }) }}>
                        <i className={cx(state.form.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i>
                    </div>
                    <div className='df-card-title-text'>
                        <div>{title()}</div>
                        <div>{state.data.name}</div>
                    </div>
                </div>
                {/* <div className='df-card-value'>
                        <div>Last Sent</div>
                        <div>-</div>
                    </div> */}
                <div className='df-card-cmd btn-bar'>
                    <button title={RESX.device.card.save_title} className={cx('btn btn-sm', state.form.dirty ? 'btn-warning' : 'btn-outline-warning')} onClick={() => { save(false) }}><span className='far fa-save'></span></button>
                    <button title={RESX.device.card.delete_title} className='btn btn-sm btn-outline-danger' onClick={() => { deviceContext.deleteCapability(capability._id, capability._type === 'method' ? 'method' : 'property') }}><span className='fa fa-times'></span></button>
                </div>
            </div>

            <div className='df-card-row'>
                <div><label>{RESX.device.card.toggle.enabled_label}</label><div title={RESX.device.card.toggle.enabled_title}><Toggle name={capability._id + '-enabled'} disabled={true} checked={true} onChange={() => { }} /></div></div>
                <div><label>{RESX.device.card.send.property_label}</label><div><input type='text' className='form-control form-control-sm double-width' name='name' value={state.data.name} onChange={updateField} /></div></div>
                <div>
                    <label>{valueLabel} </label>
                    <div><input type='text' className='form-control form-control-sm double-width' name='value' value={valueSend} placeholder={valuePlaceholder} onChange={updateField} /></div>
                </div>
                <div>
                    <div className="card-field-label-height"></div>
                    <div>{!template ? <div className='single-item'><button title={RESX.device.card.send_title} className='btn btn-sm btn-outline-primary' onClick={() => { save(true) }}>{RESX.device.card.send_label}</button></div> : null}</div>
                </div>
            </div>

            <div className='df-card-row'>
                <div><label>{RESX.device.card.toggle.complex_label}</label><div title={RESX.device.card.toggle.complex_title}><Toggle name={capability._id + '-json'} defaultChecked={false} checked={state.data.propertyObject.type === 'templated'} onChange={() => dispatch({ type: 'toggle-complex', payload: null })} /></div></div>
                {state.data.propertyObject.type === 'templated' ? <>
                    <div>
                        <label>{RESX.device.card.send.complex_label}</label>
                        <textarea className='form-control form-control-sm custom-textarea full-width' rows={7} name='propertyObject.template' onChange={updateField} >{state.data.propertyObject.template || ''}</textarea>
                    </div>
                </> : <div style={{ height: '55px' }}></div>}
            </div>

            {pnp ? <>
                <div className='df-card-row'>
                    <div>{RESX.device.card.toggle.interface_label}</div>
                    <div><label>{RESX.device.card.send.int_name_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='interface.name' value={state.data.interface.name || 'Not supported'} onChange={updateField} /></div></div>

                </div>
                <div className='df-card-row'>
                    <div></div>
                    <div><label>{RESX.device.card.send.int_urn_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='interface.urn' value={state.data.interface.urn || 'Not supported'} onChange={updateField} /></div></div>
                </div>
            </>
                : null}

            <div className='df-card-row'>
                <div>{RESX.device.card.toggle.device_sdk_label}</div>
                <div><label>{RESX.device.card.send.api_label}</label><div><Combo items={[{ name: 'Msg/Telemetry', value: 'msg' }, { name: 'Twin', value: 'twin' }]} cls='custom-textarea-sm double-width' name='sdk' onChange={updateField} value={state.data.sdk} /></div></div>
                <div><label>{RESX.device.card.send.string_label}</label><div><Combo items={[{ name: 'Yes', value: true }, { name: 'No', value: false }]} cls='custom-textarea-sm single-width' name='string' onChange={updateField} value={state.data.string} /></div></div>
            </div>

            <div className='df-card-row'>
                <div><label>{RESX.device.card.toggle.runloop_label}</label><div title={RESX.device.card.toggle.runloop_title}><Toggle name={capability._id + '-runloop'} defaultChecked={false} checked={state.data.runloop.include} onChange={() => dispatch({ type: 'toggle-runloop', payload: null })} /></div></div>
                {state.data.runloop.include ? <>
                    <div><label>{RESX.device.card.send.unit_label}</label><div><Combo items={[{ name: 'Mins', value: 'mins' }, { name: 'Secs', value: 'secs' }]} cls='custom-textarea-sm  double-width' name='runloop.unit' onChange={updateField} value={state.data.runloop.unit} /></div></div>
                    <div><label>{RESX.device.card.send.duration_label}</label><div><input type='number' className='form-control form-control-sm double-width' name='runloop.value' min={0} value={state.data.runloop.value} onChange={updateField} /></div></div>
                </> : <div style={{ height: '55px' }}></div>}
            </div>

            <div className='df-card-row'>
                <div><label>{RESX.device.card.toggle.mock_label}</label><div title={RESX.device.card.toggle.mock_title}><Toggle name={capability._id + '-mock'} defaultChecked={false} checked={state.data.type.mock} onChange={() => dispatch({ type: 'toggle-mock', payload: null })} /></div></div>
                {state.data.type.mock ? <>
                    <div><label>{RESX.device.card.send.sensor_label}</label><br />
                        <div className='btn-group' role='group' >
                            {sensors.map((sensor: any) => {
                                let active = state.data.mock && sensor._type === state.data.mock._type ? 'active' : '';
                                return <button type='button' className={classNames('btn btn-sm btn-outline-primary', active)} onClick={() => { clickSensor(sensor) }}>{sensor._type}</button>
                            })}
                        </div>
                    </div>
                </> : <div style={{ height: '55px' }}></div>}
            </div>

            {state.data.type.mock ?
                <div className='df-card-row'>
                    <div></div>
                    {fields}
                </div>
                : null}

        </div>
    </AppProvider>
}