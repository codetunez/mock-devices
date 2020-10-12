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
    appContext?: any,
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
        case "toggle-property-version":
            newData.asPropertyVersion = !newData.asPropertyVersion
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "toggle-property-convention":
            newData.asPropertyConvention = !newData.asPropertyConvention
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "toggle-component":
            if (newData.component) { newData.component.enabled = !newData.component.enabled; } else { newData.component = { enabled: true, name: null } }
            state.appContext.setDirty(newData._id);
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData, dialog: diag };
        case "load-capability":
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: action.payload.capability, dialog: diag };
        case "save-capability":
            state.appContext.clearDirty();
            action.payload.context.updateDeviceProperty(state.data, action.payload.save);
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

export function DeviceFieldC2D({ capability, shouldExpand, template }) {

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

    const updateField = (e: any) => {

        switch (e.target.name) {
            case 'component.name':
                dispatch({ type: 'update-component', payload: { name: "name", value: e.target.value } })
                break;
            default:
                dispatch({ type: 'update-capability', payload: { name: e.target.name, value: e.target.value } });
                break
        }
    }

    const save = (send: boolean) => {
        dispatch({ type: 'save-capability', payload: { context: deviceContext, send: send } });
    }

    let snippets = []
    for (const snippet in deviceContext.snippets) {
        const code = Object.assign({}, deviceContext.snippets[snippet]);
        snippets.push(<div onClick={() => snippetsHandler(code)}>{snippet}</div>);
    }

    const snippetsHandler = (code: any) => {
        dispatch({ type: 'update-capability', payload: { name: 'asPropertyVersionPayload', value: JSON.stringify(code, null, 2) } });
    }

    let colors = [];
    for (const color in deviceContext.colors) {
        colors.push({ name: color, value: deviceContext.colors[color] })
    }

    deviceContext.device.comms.map((element: any) => {
        if (element._type !== 'method' && element.type.direction === 'd2c') {
            sendComms.push({ name: element.name, value: element._id });
        }
    });

    const title = () => {
        const comp = state.data.component && state.data.component.enabled ? '[C] ' : '';
        return `${comp}${RESX.device.card.receive.title}`;
    }

    return <>
        {state.dialog ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal min-modal'><ModalConfirm config={state.dialog} /></div></Modal> : null}
        <div className={cx('device-field-card', state.form.expanded ? '' : 'device-field-card-small', state.form.dirty ? 'device-field-card-dirty':'')} style={state.data.color ? { backgroundColor: state.data.color } : {}}>
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
                <div><label title={RESX.device.card.receive.property_title}>{RESX.device.card.receive.property_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='name' value={state.data.name} onChange={updateField} /></div></div>
            </div>

            {!state.form.expanded ? null :
                <>
                    <div className='df-card-row'>
                        <div><label>{RESX.device.card.toggle.component_label}</label><div title={RESX.device.card.toggle.component_title}><Toggle name={state.data._id + '-component'} defaultChecked={false} checked={state.data.component && state.data.component.enabled} onChange={() => dispatch({ type: 'toggle-component', payload: null })} /></div></div>
                        {state.data.component && state.data.component.enabled ?
                            <div><label title={RESX.device.card.receive.component_title}>{RESX.device.card.receive.component_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='component.name' value={state.data.component.name} onChange={updateField} /></div></div>
                            : <div style={{ height: '55px' }}></div>}
                    </div>

                    <div className='df-card-row'>
                        <div><label>{RESX.device.card.title.ack_label}</label></div>
                        <div><label>{RESX.device.card.receive.twin_rpt_label}</label>
                            <div title={RESX.device.card.receive.twin_rpt_title}><Toggle name={state.data._id + '-sendcapability'} defaultChecked={false} checked={state.data.asProperty} onChange={() => { dispatch({ type: 'toggle-property', payload: null }) }} /></div>
                        </div>
                    </div>

                    {!state.data.asProperty ? null :
                        <>
                            {state.data.asPropertyId === RESX.device.card.select ? null : <>
                                <div className='df-card-row'>
                                    <div></div>
                                    <div><label title={RESX.device.card.receive.property_report_title}>{RESX.device.card.receive.property_report_label}</label>
                                        <div>
                                            <Combo items={sendComms} cls='full-width' name='asPropertyId' onChange={updateField} value={state.data.asPropertyId || ''} />
                                        </div>
                                    </div>
                                </div>
                                <div className='df-card-row'>
                                    <div></div>
                                    <div><label>{RESX.device.card.receive.property_version_label}</label>
                                        <div title={RESX.device.card.receive.property_version_title}><Toggle name={state.data._id + '-applyversion'} defaultChecked={false} checked={state.data.asPropertyVersion} onChange={() => { dispatch({ type: 'toggle-property-version', payload: null }) }} /></div>
                                    </div>
                                </div>
                                {!state.data.asPropertyVersion ? null : <>
                                    <div className='df-card-row'>
                                        <div></div>
                                        {!state.data.asPropertyVersion ? null :
                                            <div>
                                                <label title={RESX.device.card.receive.property_version_payload_title}>{RESX.device.card.receive.property_version_payload_label}</label>
                                                <textarea className='form-control form-control-sm custom-textarea full-width' rows={12} name='asPropertyVersionPayload' onChange={updateField} value={state.data.asPropertyVersionPayload}></textarea>
                                            </div>
                                        }
                                    </div>
                                    <div className='df-card-row df-card-row-nogap'>
                                        <div></div>
                                        <div className="snippets">
                                            <div>{RESX.device.card.add_snippet_title}</div>
                                            <div className="snippet-links">{snippets}</div>
                                        </div>
                                    </div>
                                    <div className='df-card-row'>
                                        <div></div>
                                        <div><label>{RESX.device.card.receive.property_convention_label}</label>
                                            <div title={RESX.device.card.receive.property_convention_title}><Toggle name={state.data._id + '-convention'} defaultChecked={false} checked={state.data.asPropertyConvention} onChange={() => { dispatch({ type: 'toggle-property-convention', payload: null }) }} /></div>
                                        </div>
                                    </div>
                                </>
                                }
                            </>
                            }
                        </>
                    }

                    {template ? null : <>
                        <div className='df-card-row'>
                            <div><label>{RESX.device.card.title.desired_label}</label></div>
                            <div><label title={RESX.device.card.receive.value_title}>{RESX.device.card.receive.value_label}</label><div><textarea className='form-control form-control-sm custom-textarea full-width' rows={4} value={state.data.value || ''} placeholder={RESX.device.card.waiting_placeholder}>{state.data.value || ''}</textarea></div></div>
                            <div>
                                <div className="card-field-label-height"></div>
                                {!template ? <button title={RESX.device.card.read_title} className='btn btn-sm btn-outline-primary' onClick={() => { dispatch({ type: 'read-parameters', payload: { context: deviceContext } }) }}>{RESX.device.card.read_label}</button> : null}
                            </div>
                        </div>
                        <div className='df-card-row'>
                            <div></div>
                            <div><label title={RESX.device.card.receive.version_title}>{RESX.device.card.receive.version_label}</label><div><input type='text' className='form-control form-control-sm full-width' value={state.data.version === 0 ? '' : state.data.version} placeholder={RESX.device.card.waiting_placeholder} /></div></div>
                        </div>
                    </>
                    }

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
        </div >
    </>
}