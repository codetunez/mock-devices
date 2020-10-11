var classNames = require('classnames');
const cx = classNames.bind(require('./deviceFields.scss'));
import "react-toggle/style.css"

import axios from 'axios';
import * as React from 'react';
import Toggle from 'react-toggle';
import { DeviceContext } from '../context/deviceContext';
import { AppContext } from '../context/appContext';
import { RESX } from '../strings';

import { Combo } from '../ui/controls';

import { Modal } from '../modals/modal';
import { ModalConfirm } from '../modals/modalConfirm';

interface Dialog {
    title: string,
    message: string,
    options?: {}
}

interface Form {
    dirty: boolean;
    expanded: boolean;
}

interface State {
    form: Form,
    data: any,
    appContext: any,
    dialog: Dialog,
    errorDialogHandler: Function,
    deleteDialogHandler: Function,
}

interface Action {
    type: string;
    payload: any;
}

const reducer = (state: State, action: Action) => {

    const item = action.type.split('-')[1]
    const newData = Object.assign({}, state.data);
    const dirty = state.appContext.getDirty();
    let diag: Dialog = null;

    if (action.type === 'clear') { return { ...state, dialog: diag }; }

    if (dirty != '' && dirty != newData._id) {
        diag = {
            title: RESX.modal.save_error_title,
            message: RESX.modal.save_first,
            options: {
                buttons: [RESX.modal.OK],
                handler: state.errorDialogHandler,
                close: state.errorDialogHandler,
            }
        };
        return { ...state, dialog: diag };
    }

    if (action.type === 'show-delete') {
        diag = {
            title: RESX.modal.delete_title,
            message: RESX.modal.delete_capability,
            options: {
                buttons: [RESX.modal.YES, RESX.modal.NO],
                handler: state.deleteDialogHandler,
                close: state.deleteDialogHandler,
            }
        };
        return { ...state, dialog: diag };
    }

    if (action.type === 'save-sensor') {
        diag = {
            title: RESX.modal.save_error_title,
            message: RESX.modal.save_sensor_first,
            options: {
                buttons: [RESX.modal.OK],
                handler: state.errorDialogHandler,
                close: state.errorDialogHandler,
            }
        };
        return { ...state, dialog: diag };
    }

    switch (action.type) {
        case "init-expand":
            return { ...state, form: { dirty: state.form.dirty, expanded: action.payload.expand }, dialog: diag };
        case "toggle-expand":
            action.payload.context.setExpand(newData._id);
            return { ...state, form: { dirty: state.form.dirty, expanded: action.payload.expand }, dialog: diag };
        case "toggle-enabled":
        case "update-capability":
            if (action.payload.name === 'string') {
                newData[action.payload.name] = (action.payload.value === 'true' ? true : false);
            }
            else {
                newData[action.payload.name] = action.payload.value;
            }
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "update-component":
            newData.component[action.payload.name] = action.payload.value;
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "toggle-complex":
            newData.enabled = true;
            newData.type.mock = false;
            newData.propertyObject.type = newData.propertyObject.type === 'templated' ? 'default' : 'templated';
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "toggle-runloop":
            newData.enabled = true;
            if (newData.type.mock) { newData.type.mock = false; }
            newData.runloop.include = !newData.runloop.include;
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "toggle-mock":
            newData.enabled = true;
            newData.type.mock = !newData.type.mock;
            if (newData.type.mock && !newData.runloop.include) { newData.runloop.include = true; }
            if (newData.type.mock) {
                newData.propertyObject.type = 'default';
                newData.value = '';
            }
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "toggle-component":
            if (newData.component) { newData.component.enabled = !newData.component.enabled; } else { newData.component = { enabled: true, name: null } }
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "update-runloop":
            state.appContext.setDirty(newData._id);
            newData.runloop[action.payload.name] = action.payload.value;
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "update-complex":
            newData.propertyObject.type = 'templated';
            newData.propertyObject.template = action.payload.value;
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "update-mock":
            newData.mock[action.payload.name] = action.payload.value;
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "update-sensor":
            newData.type.mock = true;
            newData.mock = action.payload.mock;
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "reset-time":
            delete newData.runloop._ms;
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "load-capability":
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: action.payload.capability };
        case "save-capability":
            state.appContext.clearDirty();
            action.payload.context.updateDeviceProperty(newData, action.payload.send);
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "delete-capability":
            state.appContext.clearDirty();
            action.payload.context.deleteCapability(newData._id, newData._type === 'method' ? 'method' : 'property')
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "revert-edit":
            state.appContext.clearDirty();
            action.payload.context.revertDevice();
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: newData, dialog: diag };
        default:
            return state;
    }
}

export function DeviceFieldD2C({ capability, shouldExpand, template, sensors }) {

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

    const errorDialogAction = () => {
        dispatch({ type: 'clear', payload: null });
    }

    const deleteDialogAction = (result) => {
        if (result === "Yes") { dispatch({ type: 'delete-capability', payload: { context: deviceContext } }); return; }
        dispatch({ type: 'clear', payload: null });
    }

    const [state, dispatch] = React.useReducer(reducer, { form: { dirty: false, expanded: shouldExpand }, data: capability, appContext: appContext, dialog: null, errorDialogHandler: errorDialogAction, deleteDialogHandler: deleteDialogAction });

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
            case 'runloop.valueMax':
                dispatch({ type: 'update-runloop', payload: { name: "valueMax", value: e.target.value } })
                break;
            case 'component.name':
                dispatch({ type: 'update-component', payload: { name: "name", value: e.target.value } })
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
            dispatch({ type: 'save-sensor', payload: null })
            return;
        }
        dispatch({ type: 'save-capability', payload: { context: deviceContext, send: send } })
    }

    let snippets = []
    for (const snippet in deviceContext.snippets) {
        const code = Object.assign({}, deviceContext.snippets[snippet]);
        snippets.push(<div onClick={() => snippetsHandler(code)}>{snippet}</div>);
    }

    const snippetsHandler = (code: any) => {
        dispatch({ type: 'update-complex', payload: { name: 'propertyObject.template', value: JSON.stringify(code, null, 2) } });
    }

    let colors = [];
    for (const color in deviceContext.colors) {
        colors.push({ name: color, value: deviceContext.colors[color] })
    }

    const title = () => {
        let trueTime = null;
        if (state.data.runloop._ms) { trueTime = state.data.runloop._ms / (state.data.runloop.unit === "secs" ? 1000 : 60000); }
        const loop = state.data.runloop.include ? ' sent every ' + (trueTime || '???') + ' ' + state.data.runloop.unit : '';
        const mock = state.data.mock && state.data.type.mock ? ' (mock ' + state.data.mock._type + ')' : '';
        const comp = state.data.component && state.data.component.enabled ? '[C] ' : '';
        return `${comp}${state.data.sdk === "msg" ? RESX.device.card.send.title_telemetry : RESX.device.card.send.title_report} ${loop} ${mock}`
    }

    let fields = [];
    if (state.data.mock) {
        let keyCounter = 0;
        for (var field in state.data.mock) {
            if (field[0] != '_') {
                fields.push(<div key={keyCounter}>
                    <label title={field}>{state.data.mock._resx[field]}</label>
                    <input type='text' className='form-control form-control-sm mock-field' onChange={updateMockField} name={field} value={state.data.mock[field]} />
                </div>)
                keyCounter++;
            }
        }
    }

    let valueLabel = RESX.device.card.send.value_label;
    let valuePlaceholder = RESX.device.card.send.value_placeholder;
    let valueSend = state.data.value;

    if (state.data.propertyObject.type === 'templated') {
        valueLabel = RESX.device.card.send.value_complex_label;
        valuePlaceholder = RESX.device.card.send.value_complex_placeholder;
        valueSend = ''
    } else if (state.data.type.mock) {
        valueLabel = RESX.device.card.send.value_mock_label;
        valuePlaceholder = RESX.device.card.send.value_mock_placeholder;
    }

    return <>
        {state.dialog ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal min-modal'><ModalConfirm config={state.dialog} /></div></Modal> : null}

        <div className={cx('device-field-card', state.form.expanded ? '' : 'device-field-card-small', state.form.dirty ? 'device-field-card-dirty' : '')} style={state.data.color ? { backgroundColor: state.data.color } : {}}>

            <div className='df-card-header'>
                <div className='df-card-title'>
                    <button className='df-card-title-chevron' onClick={() => { dispatch({ type: 'toggle-expand', payload: { expand: !state.form.expanded, context: appContext } }) }}>
                        <i className={cx(state.form.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i>
                    </button>
                    <div className='df-card-title-text'>
                        <div>{title()}</div>
                        <div>{state.data.name}</div>
                    </div>
                </div>
                <div className='df-card-cmd btn-bar'>
                    {!state.form.dirty ? null : <button title={RESX.device.card.revert_title} className={cx('btn btn-sm btn-outline-light')} onClick={() => { dispatch({ type: 'revert-edit', payload: { context: deviceContext } }) }}><span className='fas fa-undo'></span></button>}
                    <button title={RESX.device.card.save_title} className={cx('btn btn-sm', state.form.dirty ? 'btn-warning' : 'btn-outline-warning')} onClick={() => { save(false) }}><span className='far fa-save'></span></button>
                    <button title={RESX.device.card.delete_title} className='btn btn-sm btn-outline-danger' onClick={() => { dispatch({ type: 'show-delete', payload: null }) }}><span className='fa fa-times'></span></button>
                </div>
            </div>

            <div className='df-card-row'>
                <div><label>{RESX.device.card.toggle.enabled_label}</label><div title={RESX.device.card.toggle.enabled_title}><Toggle name={state.data._id + '-enabled'} disabled={true} checked={true} onChange={() => { }} /></div></div>
                <div><label title={RESX.device.card.send.property_title}>{RESX.device.card.send.property_label}</label><div><input type='text' className='form-control form-control-sm double-width' name='name' value={state.data.name} onChange={updateField} /></div></div>
                <div>
                    <label title={RESX.device.card.send.value_title}>{valueLabel} </label>
                    <div><input type='text' className='form-control form-control-sm double-width' name='value' value={valueSend} placeholder={valuePlaceholder} onChange={updateField} /></div>
                </div>
                <div>
                    <div className="card-field-label-height"></div>
                    <div>{!template ? <div className='single-item'><button title={RESX.device.card.send_title} className='btn btn-sm btn-outline-primary' onClick={() => { save(true) }}>{RESX.device.card.send_label}</button></div> : null}</div>
                </div>
            </div>

            {!state.form.expanded ? null :
                <>
                    <div className='df-card-row'>
                        <div>{RESX.device.card.toggle.device_sdk_label}</div>
                        <div><label title={RESX.device.card.send.api_title}>{RESX.device.card.send.api_label}</label><div><Combo items={[{ name: 'Msg/Telemetry', value: 'msg' }, { name: 'Twin', value: 'twin' }]} cls='custom-textarea-sm double-width' name='sdk' onChange={updateField} value={state.data.sdk} /></div></div>
                        {state.data.propertyObject.type === 'templated' ? null :
                            <div><label title={RESX.device.card.send.string_title}>{RESX.device.card.send.string_label}</label><div><Combo items={[{ name: 'Yes', value: true }, { name: 'No', value: false }]} cls='custom-textarea-sm single-width' name='string' onChange={updateField} value={state.data.string} /></div></div>
                        }
                    </div>

                    <div className='df-card-row'>
                        <div><label>{RESX.device.card.toggle.component_label}</label><div title={RESX.device.card.toggle.component_title}><Toggle name={state.data._id + '-component'} defaultChecked={false} checked={state.data.component && state.data.component.enabled} onChange={() => dispatch({ type: 'toggle-component', payload: null })} /></div></div>
                        {state.data.component && state.data.component.enabled ?
                            <div><label title={RESX.device.card.send.component_title}>{RESX.device.card.send.component_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='component.name' value={state.data.component.name} onChange={updateField} /></div></div>
                            : <div style={{ height: '55px' }}></div>}
                    </div>

                    <div className='df-card-row'>
                        <div><label>{RESX.device.card.toggle.complex_label}</label><div title={RESX.device.card.toggle.complex_title}><Toggle name={state.data._id + '-json'} defaultChecked={false} checked={state.data.propertyObject.type === 'templated'} onChange={() => dispatch({ type: 'toggle-complex', payload: null })} /></div></div>
                        {state.data.propertyObject.type === 'templated' ? <>
                            <div>
                                <label title={RESX.device.card.send.complex_title}>{RESX.device.card.send.complex_label}</label>
                                <textarea className='form-control form-control-sm custom-textarea full-width' rows={7} name='propertyObject.template' onChange={updateField} value={state.data.propertyObject.template || ''}></textarea>
                            </div>
                        </> : <div style={{ height: '55px' }}></div>}
                    </div>

                    {state.data.propertyObject.type != 'templated' ? null :
                        <div className='df-card-row df-card-row-nogap'>
                            <div></div>
                            <div className="snippets">
                                <div>{RESX.device.card.add_snippet_title}</div>
                                <div className="snippet-links">{snippets}</div>
                            </div>
                        </div>
                    }

                    <div className='df-card-row'>
                        <div><label>{RESX.device.card.toggle.runloop_label}</label><div title={RESX.device.card.toggle.runloop_title}><Toggle name={state.data._id + '-runloop'} defaultChecked={false} checked={state.data.runloop.include} onChange={() => dispatch({ type: 'toggle-runloop', payload: null })} /></div></div>
                        {state.data.runloop.include ? <>
                            <div><label title={RESX.device.card.send.unit_title}>{RESX.device.card.send.unit_label}</label><div><Combo items={[{ name: 'Mins', value: 'mins' }, { name: 'Secs', value: 'secs' }]} cls='custom-textarea-sm double-width' name='runloop.unit' onChange={updateField} value={state.data.runloop.unit} /></div></div>
                            <div><label title={RESX.device.card.send.duration_title}>{RESX.device.card.send.duration_label}</label><div><input type='number' className='form-control form-control-sm single-width' name='runloop.value' min={0} value={state.data.runloop.value} onChange={updateField} /></div></div>
                            <div><label title={RESX.device.card.send.duration_max_title}>{RESX.device.card.send.duration_max_label}</label><div><input type='number' className='form-control form-control-sm single-width' name='runloop.valueMax' min={0} value={state.data.runloop.valueMax} onChange={updateField} /></div></div>
                        </> : <div style={{ height: '55px' }}></div>}
                    </div>

                    {!state.data.runloop.include ? null :
                        <div className='df-card-row df-card-row-nogap'>
                            <div></div>
                            <div className="snippets">
                                <div>{RESX.device.card.send.reset_duration_title}</div>
                                <div className="snippet-links"><div onClick={() => dispatch({ type: 'reset-time', payload: null })}>{RESX.device.card.send.reset_duration_click_title}</div></div>
                            </div>
                        </div>
                    }

                    <div className='df-card-row'>
                        <div><label>{RESX.device.card.toggle.mock_label}</label><div title={RESX.device.card.toggle.mock_title}><Toggle name={state.data._id + '-mock'} defaultChecked={false} checked={state.data.type.mock} onChange={() => dispatch({ type: 'toggle-mock', payload: null })} /></div></div>
                        {state.data.type.mock ? <>
                            <div><label title={RESX.device.card.send.sensor_title} >{RESX.device.card.send.sensor_label}</label><br />
                                <div className='btn-group' role='group' >
                                    {sensors.map((sensor: any) => {
                                        let active = state.data.mock && sensor._type === state.data.mock._type ? 'active' : '';
                                        return <button title={RESX.device.card.send.sensor_generic_title} type='button' className={classNames('btn btn-sm btn-outline-primary', active)} onClick={() => { clickSensor(sensor) }}>{sensor._type}</button>
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

                    <div className='df-card-row'>
                        <div><label>{RESX.device.card.title.ux_label}</label></div>
                        <div><label title={RESX.device.card.color_title}>{RESX.device.card.color_label}</label>
                            <div>
                                <Combo items={colors} cls='full-width' name='color' onChange={updateField} value={state.data.color} />
                            </div>
                        </div>
                    </div>
                </>
            }
        </div>
    </>
}