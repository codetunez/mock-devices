var classNames = require('classnames');
const cx = classNames.bind(require('./deviceFields.scss'));
import "react-toggle/style.css"

import * as React from 'react';
import Toggle from 'react-toggle';
import { Combo } from '../ui/controls';
import { DeviceContext } from '../context/deviceContext';
import { AppContext } from '../context/appContext';
import { RESX } from '../strings';

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


    switch (action.type) {
        case "init-expand":
            return { ...state, form: { dirty: state.form.dirty, expanded: action.payload.expand }, dialog: diag };
        case "toggle-expand":
            action.payload.context.setExpand(newData._id);
            return { ...state, form: { dirty: state.form.dirty, expanded: action.payload.expand }, dialog: diag };
        case "toggle-enabled":
        case "update-capability":
            //refactor
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
        case "toggle-property":
            newData.asProperty = !newData.asProperty
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "toggle-execution":
            newData.execution = action.payload.property ? 'cloud' : 'direct'
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "toggle-component":
            if (newData.component) { newData.component.enabled = !newData.component.enabled; } else { newData.component = { enabled: true, name: null } }
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "load-capability":
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: action.payload.capability, dialog: diag };
        case "save-capability":
            if (newData.execution != 'cloud' && newData.name != action.payload.originalName) {
                action.payload.context.updateDeviceMethod(state.data);
            } else {
                action.payload.context.updateDeviceProperty(state.data, action.payload.save);
            }
            state.appContext.clearDirty();
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "delete-capability":
            state.appContext.clearDirty();
            action.payload.context.deleteCapability(newData._id, newData._type === 'method' ? 'method' : 'property')
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "revert-edit":
            state.appContext.clearDirty();
            action.payload.context.revertDevice();
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "read-parameters":
            action.payload.context.getCapability(state.data._id);
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: newData, dialog: diag };
        default:
            return state;
    }
}


export const DeviceFieldMethod: React.FunctionComponent<any> = ({ capability, shouldExpand, pnp, template, originalName }) => {

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

    const sendComms = [{ name: RESX.device.card.select, value: null }];

    deviceContext.device.comms.map((element: any) => {
        if (element._type !== 'method' && element.type.direction === 'd2c') {
            sendComms.push({ name: element.name, value: element._id });
        }
    });

    const updateField = (e: any) => {

        switch (e.target.name) {
            case 'component.name':
                dispatch({ type: 'update-component', payload: { name: "name", value: e.target.value } })
                break;
            default:
                dispatch({ type: 'update-capability', payload: { name: e.target.name, value: e.target.value } })
                break
        }
    }

    const save = (send: boolean) => {
        dispatch({ type: 'save-capability', payload: { context: deviceContext, send: send, originalName: originalName } })
    }

    let snippets = []
    for (const snippet in deviceContext.snippets) {
        const code = Object.assign({}, deviceContext.snippets[snippet]);
        snippets.push(<div onClick={() => snippetsHandler(code)}>{snippet}</div>);
    }

    let colors = [];
    for (const color in deviceContext.colors) {
        colors.push({ name: color, value: deviceContext.colors[color] })
    }

    const snippetsHandler = (code: any) => {
        dispatch({ type: 'update-capability', payload: { name: 'payload', value: JSON.stringify(code, null, 2) } });
    }

    const request = () => {
        return deviceContext.requests[state.data._id] && deviceContext.requests[state.data._id].payload;
    }

    const requestDate = () => {
        return deviceContext.requests[state.data._id] && deviceContext.requests[state.data._id].date;
    }

    return <>
        {state.dialog ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal min-modal'><ModalConfirm config={state.dialog} /></div></Modal> : null}

        <div className={cx('device-field-card', state.form.expanded ? '' : 'device-field-card-small')} style={state.data.color ? { backgroundColor: state.data.color } : {}}>

            <div className='df-card-header'>
                <div className='df-card-title'>
                    <button className='df-card-title-chevron' onClick={() => { dispatch({ type: 'toggle-expand', payload: { expand: !state.form.expanded, context: appContext } }) }}>
                        <i className={cx(state.form.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i>
                    </button>
                    <div className='df-card-title-text'>
                        <div>{RESX.device.card.method.title}</div>
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
                <div><label>{RESX.device.card.toggle.enabled_label}</label><div title={RESX.device.card.toggle.enabled_title}><Toggle name={state.data._id + '-enabled'} disabled={true} defaultChecked={true} checked={true} onChange={() => { }} /></div></div>
                <div><label title={RESX.device.card.method.property_title}>{state.data.execution === 'cloud' ? RESX.device.card.method.property_label : RESX.device.card.method.property_restart_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='name' value={state.data.name} onChange={updateField} /></div></div>
            </div>

            {!state.form.expanded ? null :
                <>
                    <div className='df-card-row'>
                        <div><label>{RESX.device.card.toggle.component_label}</label><div title={RESX.device.card.toggle.component_title}><Toggle name={state.data._id + '-component'} defaultChecked={false} checked={state.data.component && state.data.component.enabled} onChange={() => dispatch({ type: 'toggle-component', payload: null })} /></div></div>
                        {state.data.component && state.data.component.enabled ?
                            <div><label title={RESX.device.card.method.component_title}>{RESX.device.card.method.component_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='component.name' value={state.data.component.name} onChange={updateField} /></div></div>
                            : <div style={{ height: '55px' }}></div>}
                    </div>

                    <div className='df-card-row'>
                        <div><label></label><div></div></div>
                        <div><label title={RESX.device.card.method.c2d_title}>{RESX.device.card.method.c2d_label}</label>
                            <div title={RESX.device.card.method.c2d_title}>
                                <Toggle name={state.data._id + '-execution'} defaultChecked={false} checked={state.data.execution === 'cloud' ? true : false} onChange={(e) => { dispatch({ type: 'toggle-execution', payload: { property: e.target.checked } }) }} />
                            </div>
                        </div>
                    </div>

                    {template ? null :
                        <div className='df-card-row'>
                            <div></div>
                            <div><label title={RESX.device.card.method.request_title}>{RESX.device.card.method.request_label}</label><div><textarea className='form-control form-control-sm custom-textarea full-width' rows={3} readOnly={true} value={request()} placeholder={RESX.device.card.waiting_placeholder}></textarea></div></div>
                            <div>
                                <div className="card-field-label-height"></div>
                                {!template ? <button title={RESX.device.card.read_param_title} className='btn btn-sm btn-outline-primary' onClick={() => { deviceContext.getCapabilityMethodRequest(state.data._id) }}><span className='fa fa-read'></span>{RESX.device.card.read_param_label}</button> : null}
                            </div>
                        </div>
                    }

                    {state.data.execution === 'cloud' ? null :
                        <>
                            <div className='df-card-row'>
                                <div></div>
                                <div><label title={RESX.device.card.method.response_title} >{RESX.device.card.method.response_label}</label><div><input type='number' max={3} className='form-control form-control-sm full-width' name='status' value={state.data.status} onChange={updateField} /></div></div>
                            </div>

                            <div className='df-card-row'>
                                <div></div>
                                <div><label title={RESX.device.card.method.response_payload_title}>{RESX.device.card.method.response_payload_label}</label><div><textarea className='form-control form-control-sm custom-textarea full-width' rows={6} name='payload' onChange={updateField} value={state.data.payload || ''}></textarea></div></div>
                            </div>
                            <div className='df-card-row df-card-row-nogap'>
                                <div></div>
                                <div className="snippets">
                                    <div>{RESX.device.card.add_snippet_title}</div>
                                    <div className="snippet-links">{snippets}</div>
                                </div>
                            </div>
                        </>
                    }

                    <div className='df-card-row'>
                        <div></div>
                        <div><label>{RESX.device.card.method.twin_rpt_label}</label>
                            <div title={RESX.device.card.method.twin_rpt_title}><Toggle name={state.data._id + '-sendtwin'} defaultChecked={false} checked={state.data.asProperty} onChange={() => { dispatch({ type: 'toggle-property', payload: null }) }} /></div>
                        </div>
                    </div>

                    {!state.data.asProperty ? null :
                        <div className='df-card-row'>
                            <div><label></label><div></div></div>
                            <div><label title={RESX.device.card.method.property_report_title}>{RESX.device.card.method.property_report_label}</label>
                                <div>
                                    <Combo items={sendComms} cls='full-width' name='asPropertyId' onChange={updateField} value={state.data.asPropertyId || ''} />
                                </div>
                            </div>
                        </div>
                    }

                    <div className='df-card-row'>
                        <div><label>{RESX.device.card.UX}</label></div>
                        <div><label title={RESX.device.card.color_title}>{RESX.device.card.color_label}</label>
                            <div>
                                <Combo items={colors} cls='full-width' name='color' onChange={updateField} value={state.data.color} />
                            </div>
                        </div>
                    </div>
                </>
            }
        </div >
    </>
}