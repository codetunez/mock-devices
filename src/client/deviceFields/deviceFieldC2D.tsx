var classNames = require('classnames');
const cx = classNames.bind(require('./deviceFields.scss'));
import "react-toggle/style.css"

import * as React from 'react';
import Toggle from 'react-toggle';
import { Combo } from '../ui/controls';
import { DeviceContext } from '../context/deviceContext';
import { AppContext } from '../context/appContext';
import { RESX } from '../strings';

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
        case "toggle-property":
            newData.asProperty = !newData.asProperty
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "toggle-property-version":
            newData.asPropertyVersion = !newData.asPropertyVersion
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "toggle-property-convention":
            newData.asPropertyConvention = !newData.asPropertyConvention
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "update-interface":
            newData.interface[action.payload.name] = action.payload.value;
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "load-capability":
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: action.payload.capability };
        case "save-capability":
            action.payload.context.updateDeviceProperty(state.data, action.payload.save);
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: newData };
        case "read-parameters":
            action.payload.context.getCapability(state.data._id);
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: newData };
        default:
            return state;
    }
}

export function DeviceFieldC2D({ capability, shouldExpand, pnp, template }) {

    const [state, dispatch] = React.useReducer(reducer, { form: { dirty: false, expanded: shouldExpand }, data: capability });

    const deviceContext: any = React.useContext(DeviceContext);
    const appContext: any = React.useContext(AppContext);
    const sendComms = [{ name: RESX.device.card.select, value: null }];

    React.useEffect(() => {
        dispatch({ type: 'init-expand', payload: { expand: shouldExpand, context: appContext } })
    }, [shouldExpand]);

    React.useEffect(() => {
        dispatch({ type: 'load-capability', payload: { capability: capability } })
    }, [capability]);

    React.useEffect(() => {
        dispatch({ type: 'load-device', payload: { device: deviceContext.device } })
    }, [deviceContext.device]);

    deviceContext.device.comms.map((element: any) => {
        if (element._type !== 'method' && element.type.direction === 'd2c') {
            sendComms.push({ name: element.name, value: element._id });
        }
    });

    const updateField = (e: any) => {

        switch (e.target.name) {
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

    const save = (send: boolean) => {
        dispatch({ type: 'save-capability', payload: { context: deviceContext, send: send } });
    }

    let snippets = []
    for (const snippet in appContext.snippets) {
        const code = Object.assign({}, appContext.snippets[snippet]);
        snippets.push(<div onClick={() => snippetsHandler(code)}>{snippet}</div>);
    }

    const snippetsHandler = (code: any) => {
        dispatch({ type: 'update-capability', payload: { name: 'asPropertyVersionPayload', value: JSON.stringify(code, null, 2) } });
    }

    let colors = [];
    for (const color in appContext.colors) {
        colors.push({ name: color, value: appContext.colors[color] })
    }

    return <div className={cx('device-field-card', state.form.expanded ? '' : 'device-field-card-small')} style={state.data.color ? { backgroundColor: state.data.color } : {}}>

        <div className='df-card-header'>
            <div className='df-card-title'>
                <div className='df-card-title-chevron' onClick={() => { dispatch({ type: 'toggle-expand', payload: { expand: !state.form.expanded, context: appContext } }) }}>
                    <i className={cx(state.form.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i>
                </div>
                <div className='df-card-title-text'>
                    <div>{RESX.device.card.receive.title}</div>
                    <div>{state.data.name}</div>
                </div>
            </div>
            {/* <div className='df-card-value'>
                        <div>Last Read</div>
                        <div>-</div>
                    </div> */}
            <div className='df-card-cmd btn-bar'>
                <button title={RESX.device.card.save_title} className={cx('btn btn-sm', state.form.dirty ? 'btn-warning' : 'btn-outline-warning')} onClick={() => { save(false) }}><span className='far fa-save'></span></button>
                <button title={RESX.device.card.delete_title} className='btn btn-sm btn-outline-danger' onClick={() => { deviceContext.deleteCapability(state.data._id, state.data._type === 'method' ? 'method' : 'property') }}><span className='fa fa-times'></span></button>
            </div>
        </div>

        <div className='df-card-row'>
            <div><label>{RESX.device.card.toggle.enabled_label}</label><div title={RESX.device.card.toggle.enabled_title}><Toggle name={state.data._id + '-enabled'} disabled={true} checked={true} onChange={() => { }} /></div></div>
            <div><label title={RESX.device.card.receive.property_title}>{RESX.device.card.receive.property_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='name' value={state.data.name} onChange={updateField} /></div></div>
        </div>

        {!pnp ? null :
            <>
                < div className='df-card-row' >
                    <div>{RESX.device.card.toggle.interface_label}</div>
                    <div><label title={RESX.device.card.receive.int_name_title}>{RESX.device.card.receive.int_name_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='interface.name' value={state.data.interface.name || 'Not supported'} onChange={updateField} /></div></div>

                </div >
                <div className='df-card-row'>
                    <div></div>
                    <div><label title={RESX.device.card.receive.int_urn_title}>{RESX.device.card.receive.int_urn_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='interface.urn' value={state.data.interface.urn || 'Not supported'} onChange={updateField} /></div></div>
                </div>
            </>
        }

        <div className='df-card-row'>
            <div></div>
            <div><label>{RESX.device.card.receive.twin_rpt_label}</label>
                <div title={RESX.device.card.receive.twin_rpt_title}><Toggle name={state.data._id + '-sendcapability'} defaultChecked={false} checked={state.data.asProperty} onChange={() => { dispatch({ type: 'toggle-property', payload: null }) }} /></div>
            </div>
        </div>

        {!state.data.asProperty ? null :
            <>
                <div className='df-card-row'>
                    <div><label></label><div></div></div>
                    <div><label title={RESX.device.card.receive.property_report_title}>{RESX.device.card.receive.property_report_label}</label>
                        <div>
                            <Combo items={sendComms} cls='full-width' name='asPropertyId' onChange={updateField} value={state.data.asPropertyId || ''} />
                        </div>
                    </div>
                </div>
                {state.data.asPropertyId === RESX.device.card.select ? null : <>
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
                                    <textarea className='form-control form-control-sm custom-textarea full-width' rows={7} name='asPropertyVersionPayload' onChange={updateField} value={state.data.asPropertyVersionPayload}></textarea>
                                </div>
                            }
                        </div>
                        <div className='df-card-row df-card-row-nogap'>
                            <div></div>
                            <div className="snippets">
                                <div>Add snippet:</div>
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
                <div></div>
                <div><label title={RESX.device.card.receive.value_title}>{RESX.device.card.receive.value_label}</label><div><textarea className='form-control form-control-sm custom-textarea full-width' rows={8} value={state.data.value || ''} placeholder={RESX.device.card.waiting_placeholder}>{state.data.value || ''}</textarea></div></div>
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
            <div><label>{RESX.device.card.UX}</label></div>
            <div><label title={RESX.device.card.color_title}>{RESX.device.card.color_label}</label>
                <div>
                    <Combo items={colors} cls='full-width' name='color' onChange={updateField} value={state.data.color} />
                </div>
            </div>
        </div>

    </div >

}