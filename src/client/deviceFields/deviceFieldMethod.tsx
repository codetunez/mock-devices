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
            //refactor
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
        case "toggle-execution":
            newData.execution = action.payload.property ? 'cloud' : 'direct'
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "update-interface":
            newData.interface[action.payload.name] = action.payload.value;
            return { ...state, form: { dirty: true, expanded: state.form.expanded }, data: newData };
        case "load-capability":
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: action.payload.capability };
        case "save-capability":
            if (newData.execution != 'cloud' && newData.name != action.payload.originalName) {
                action.payload.context.updateDeviceMethod(state.data);
            } else {
                action.payload.context.updateDeviceProperty(state.data, action.payload.save);
            }
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: newData };
        case "read-parameters":
            action.payload.context.getCapability(state.data._id);
            return { ...state, form: { dirty: false, expanded: state.form.expanded }, data: newData };
        default:
            return state;
    }
}


export const DeviceFieldMethod: React.FunctionComponent<any> = ({ capability, shouldExpand, pnp, template, originalName }) => {

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

    return <div className={cx('device-field-card', state.form.expanded ? '' : 'device-field-card-small')} style={state.data.color ? { backgroundColor: state.data.color } : {}}>

        <div className='df-card-header'>
            <div className='df-card-title'>
                <div className='df-card-title-chevron' onClick={() => { dispatch({ type: 'toggle-expand', payload: { expand: !state.form.expanded, context: appContext } }) }}>
                    <i className={cx(state.form.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i>
                </div>
                <div className='df-card-title-text'>
                    <div>{RESX.device.card.method.title}</div>
                    <div>{state.data.name}</div>
                </div>
            </div>
            {/* <div className='df-card-value'>
                        <div>Last Called</div>
                        <div>-</div>
                    </div> */}
            <div className='df-card-cmd btn-bar'>
                <button title={RESX.device.card.save_title} className={cx('btn btn-sm', state.form.dirty ? 'btn-warning' : 'btn-outline-warning')} onClick={() => { save(false) }}><span className='far fa-save'></span></button>
                <button title={RESX.device.card.delete_title} className='btn btn-sm btn-outline-danger' onClick={() => { deviceContext.deleteCapability(state.data._id, state.data._type === 'method' ? 'method' : 'property') }}><span className='fa fa-times'></span></button>
            </div>
        </div>

        <div className='df-card-row'>
            <div><label>{RESX.device.card.toggle.enabled_label}</label><div title={RESX.device.card.toggle.enabled_title}><Toggle name={state.data._id + '-enabled'} disabled={true} defaultChecked={true} checked={true} onChange={() => { }} /></div></div>
            <div><label title={RESX.device.card.method.property_title}>{state.data.execution === 'cloud' ? RESX.device.card.method.property_label : RESX.device.card.method.property_restart_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='name' value={state.data.name} onChange={updateField} /></div></div>
        </div>

        <div className='df-card-row'>
            <div><label></label><div></div></div>
            <div><label title={RESX.device.card.method.c2d_title}>{RESX.device.card.method.c2d_label}</label>
                <div title={RESX.device.card.method.c2d_title}>
                    <Toggle name={state.data._id + '-execution'} defaultChecked={false} checked={state.data.execution === 'cloud' ? true : false} onChange={(e) => { dispatch({ type: 'toggle-execution', payload: { property: e.target.checked } }) }} />
                </div>
            </div>
        </div>

        {!pnp ? null :
            <>
                <div className='df-card-row'>
                    <div>{RESX.device.card.toggle.interface_label}</div>
                    <div><label>{RESX.device.card.method.int_name_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='interface.name' value={state.data.interface.name || 'Not supported'} onChange={updateField} /></div></div>

                </div>
                <div className='df-card-row'>
                    <div></div>
                    <div><label>{RESX.device.card.method.int_urn_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='interface.urn' value={state.data.interface.urn || 'Not supported'} onChange={updateField} /></div></div>
                </div>
            </>
        }

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
                        <div>Add snippet:</div>
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

    </div >
}