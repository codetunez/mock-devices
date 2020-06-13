var classNames = require('classnames');
const cx = classNames.bind(require('./deviceFields.scss'));
import "react-toggle/style.css"

import * as React from 'react';
import Toggle from 'react-toggle';
import { DeviceContext } from '../context/deviceContext';
import { AppContext } from '../context/uxContext';
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

export function DeviceFieldC2D({ capability, shouldExpand, pnp }) {

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
        dispatch({ type: 'save-capability', payload: { context: deviceContext, send: send } })
    }

    return <div className={cx('device-field-card', state.form.expanded ? '' : 'device-field-card-small')} style={capability.color ? { backgroundColor: capability.color } : {}}>

        <div className='df-card-header'>
            <div className='df-card-title'>
                <div className='df-card-title-chveron' onClick={() => { dispatch({ type: 'toggle-expand', payload: { expand: !state.form.expanded, context: appContext } }) }}>
                    <i className={cx(state.form.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i>
                </div>
                <div className='df-card-title-text'>
                    <div>{RESX.device.card.receive.title}</div>
                    <div>{capability.name}</div>
                </div>
            </div>
            {/* <div className='df-card-value'>
                        <div>Last Read</div>
                        <div>-</div>
                    </div> */}
            <div className='df-card-cmd btn-bar'>
                <button title={RESX.device.card.save_title} className={cx('btn btn-sm', state.data.form ? 'btn-warning' : 'btn-outline-warning')} onClick={() => { save(false) }}><span className='far fa-save'></span></button>
                <button title={RESX.device.card.delete_title} className='btn btn-sm btn-outline-danger' onClick={() => { deviceContext.deleteCapability(capability._id, capability._type === 'method' ? 'method' : 'property') }}><span className='fa fa-times'></span></button>
            </div>
        </div>

        <div className='df-card-row'>
            <div><label>{RESX.device.card.enabled_label}</label><div><Toggle name={capability._id + '-enabled'} disabled={true} checked={true} onChange={() => { }} /></div></div>
            <div><label>{RESX.device.card.receive.property_label}</label><div><input type='text' className='form-control form-control-sm full-width' name='name' value={state.data.name} onChange={updateField} /></div></div>
            <div className='single-item'><button className='btn btn-sm btn-outline-primary' onClick={() => { dispatch({ type: 'read-parameters', payload: { context: deviceContext } }) }}>Read</button></div>
        </div>

        {pnp ?
            <>
                <div className='df-card-row'>
                    <div>Interface</div>
                    <div><label>Name</label><div><input type='text' className='form-control form-control-sm full-width' name='interface.name' value={state.data.interface.name || 'Not supported'} onChange={updateField} /></div></div>

                </div>
                <div className='df-card-row'>
                    <div></div>
                    <div><label>URN</label><div><input type='text' className='form-control form-control-sm full-width' name='interface.urn' value={state.data.interface.urn || 'Not supported'} onChange={updateField} /></div></div>
                </div>
            </>
            : null}

        <div className='df-card-row'>
            <div>Received</div>
            <div><label>Version</label><div><input type='text' className='form-control form-control-sm full-width' value={state.data.version} /></div></div>
        </div>
        <div className='df-card-row'>
            <div></div>
            <div><label>Value</label><div><textarea className='form-control form-control-sm custom-textarea full-width' rows={8} value={state.data.value || ''}>{state.data.value || ''}</textarea></div></div>
        </div>
    </div>
}