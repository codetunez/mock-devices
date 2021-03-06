var classNames = require('classnames');
const cx = classNames.bind(require('./devicePlan.scss'));
const cx2 = classNames.bind(require('../deviceFields/deviceFields.scss'));

import * as React from 'react';
import Toggle from 'react-toggle';
import { Combo } from '../ui/controls';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';

interface Form {
    dirty: boolean;
}

interface Data {
    loop: boolean;
    startup: Array<any>;
    timeline: Array<any>;
    random: Array<any>;
    receive: Array<any>;
}

interface State {
    form: Form,
    data: Data
}

interface Action {
    type: string;
    payload: any;
}

const initialState: State = {
    form: {
        dirty: false
    },
    data: {
        loop: false,
        startup: [],
        timeline: [],
        random: [],
        receive: []
    }
}

const reducer = (state: State, action: Action) => {

    const item = action.type.split('-')[1]
    const newData = Object.assign({}, state.data);

    switch (action.type) {
        case 'load-device':
            const loadPlan = Object.assign({}, action.payload.device.plan);
            return { form: { dirty: false }, data: loadPlan };
        case 'save-device':
            action.payload.deviceContext.planSave(state.data)
            return { ...state, form: { dirty: false } };
        case 'loop-plan':
            const newPlan = Object.assign({}, state.data);
            newPlan.loop = action.payload.loop;
            return { ...state, form: { dirty: true }, data: newPlan };
        case 'add-startup':
        case 'add-random':
        case 'add-receive':
            newData[item].push({ property: action.payload.comms[0].value, value: '' })
            return { ...state, form: { dirty: true }, data: newData };
        case 'add-timeline':
            const newSeconds = newData.timeline.length === 0 ? 0 : parseInt(newData.timeline[newData.timeline.length - 1].time) + 60;
            newData.timeline.push({ time: newSeconds, property: action.payload.comms[0].value, value: '' })
            return { ...state, form: { dirty: true }, data: newData };
        case 'remove-startup':
        case 'remove-timeline':
        case 'remove-random':
        case 'remove-receive':
            newData[item] = state.data[item].filter((item: any, index: number) => index != action.payload.index);
            return { ...state, form: { dirty: true }, data: newData };
        case 'edit-startup':
        case 'edit-timeline':
        case 'edit-random':
        case 'edit-receive':
            newData[item][action.payload.index][action.payload.field] = action.payload.value;
            return { ...state, form: { dirty: true }, data: newData }
        case 'clear-plan':
            return Object.assign({}, initialState, { form: { dirty: true } })
        default:
            return state;
    }
}

export function DevicePlan({ device }) {

    const [state, dispatch] = React.useReducer(reducer, { form: { dirty: false }, data: device.plan });
    const deviceContext: any = React.useContext(DeviceContext);

    const sendComms = [];
    const receiveComms = [];

    React.useEffect(() => {
        dispatch({ type: 'load-device', payload: { device: device } })
    }, [device])

    device.comms.map((element: any) => {
        if (element._type === 'method' || element.type.direction === 'c2d') {
            receiveComms.push({ name: element.name, value: element._id });
        } else {
            sendComms.push({ name: element.name, value: element._id });
        }
    });

    const startUp = () => {
        const dom = [];
        state.data.startup.map((ele, i: number) => {
            const key: number = i;
            dom.push(<div key={i} className="mini-grid-row">
                <div className='mini-grid-cell cell-width-2'>
                    <Combo items={sendComms} cls='custom-combo-sm' name='property' onChange={(e) => { dispatch({ type: 'edit-startup', payload: { index: key, field: 'property', value: e.target.value } }) }} value={ele.property} />
                </div>
                <div className='mini-grid-cell cell-width-2'>
                    <input type='text' className='form-control form-control-sm' value={ele.value} onChange={(e) => { dispatch({ type: 'edit-startup', payload: { index: key, field: 'value', value: e.target.value } }) }} placeholder={RESX.device.plan.core.value_placeholder} />
                </div>
                <div className='mini-grid-cell'>
                    <button title={RESX.device.plan.core.remove_title} className='btn btn-sm btn-outline-danger' onClick={() => { dispatch({ type: 'remove-startup', payload: { index: key } }) }}><i className="fas fa-times"></i></button>
                </div>
            </div>)
        })
        return dom
    }

    const timeline = () => {
        const dom = []
        state.data.timeline.map((ele, i) => {
            const key: number = i;
            dom.push(<div key={i} className="mini-grid-row">
                <div className='mini-grid-cell cell-width-3'>
                    <input type='number' className='form-control form-control-sm' value={ele.time} onChange={(e) => { dispatch({ type: 'edit-timeline', payload: { index: key, field: 'time', value: e.target.value } }) }} placeholder={RESX.device.plan.core.value_placeholder} />
                </div>
                <div className='mini-grid-cell cell-width-3'>
                    <Combo items={sendComms} cls='custom-combo-sm' name='property' onChange={(e) => { dispatch({ type: 'edit-timeline', payload: { index: key, field: 'property', value: e.target.value } }) }} value={ele.property} />
                </div>
                <div className='mini-grid-cell cell-width-3'>
                    <input type='text' className='form-control form-control-sm' value={ele.value} onChange={(e) => { dispatch({ type: 'edit-timeline', payload: { index: key, field: 'value', value: e.target.value } }) }} placeholder={RESX.device.plan.core.value_placeholder} />
                </div>
                <div className='mini-grid-cell'>
                    <button title={RESX.device.plan.core.remove_title} className='btn btn-sm btn-outline-danger' onClick={() => { dispatch({ type: 'remove-timeline', payload: { index: key } }) }}><i className="fas fa-times"></i></button>
                </div>
            </div>
            )
        })
        return dom;
    }

    const random = () => {
        const dom = [];
        state.data.random.map((ele, i) => {
            const key: number = i;
            dom.push(<div key={i} className="mini-grid-row">
                <div className='mini-grid-cell cell-width-3'>
                    <Combo items={sendComms} cls='custom-combo-sm' name='property' onChange={(e) => { dispatch({ type: 'edit-random', payload: { index: key, field: 'property', value: e.target.value } }) }} value={ele.property} />
                </div>
                <div className='mini-grid-cell cell-width-3'>
                    <input type='text' className='form-control form-control-sm' value={ele.before} onChange={(e) => { dispatch({ type: 'edit-random', payload: { index: key, field: 'before', value: e.target.value } }) }} placeholder={RESX.device.plan.core.value_placeholder} />
                </div>
                <div className='mini-grid-cell cell-width-3'>
                    <input type='text' className='form-control form-control-sm' value={ele.after} onChange={(e) => { dispatch({ type: 'edit-random', payload: { index: key, field: 'after', value: e.target.value } }) }} placeholder={RESX.device.plan.core.value_placeholder} />
                </div>
                <div className='mini-grid-cell'>
                    <button title={RESX.device.plan.core.remove_title} className='btn btn-sm btn-outline-danger' onClick={() => { dispatch({ type: 'remove-random', payload: { index: key } }) }}><i className="fas fa-times"></i></button>
                </div>
            </div>)
        })
        return dom
    }

    const receive = () => {
        const dom = [];

        const newComms = sendComms.slice();
        newComms.unshift({ name: RESX.device.card.noselect, value: '_NULL_' });
        state.data.receive.map((ele, i) => {
            const key: number = i;
            dom.push(<div key={i} className="mini-grid-row">
                <div className='mini-grid-cell cell-width-3'>
                    <Combo items={receiveComms} cls='custom-combo-sm' name='property' onChange={(e) => { dispatch({ type: 'edit-receive', payload: { index: key, field: 'property', value: e.target.value } }) }} value={ele.property} />
                </div>
                <div className='mini-grid-cell cell-width-3'>
                    <Combo items={newComms} cls='custom-combo-sm' name='propertyOut' onChange={(e) => { dispatch({ type: 'edit-receive', payload: { index: key, field: 'propertyOut', value: e.target.value } }) }} value={ele.propertyOut} />
                </div>
                <div className='mini-grid-cell cell-width-3'>
                    <input type='text' className='form-control form-control-sm' value={ele.value} onChange={(e) => { dispatch({ type: 'edit-receive', payload: { index: key, field: 'value', value: e.target.value } }) }} placeholder={RESX.device.plan.core.value_placeholder} />
                </div>
                <div className='mini-grid-cell'>
                    <button title={RESX.device.plan.core.remove_title} className='btn btn-sm btn-outline-danger' onClick={() => { dispatch({ type: 'remove-receive', payload: { index: key } }) }}><i className="fas fa-times"></i></button>
                </div>
            </div>)
        })
        return dom
    }

    return <div className="plan">
        <div className='plan-title'>
            {RESX.device.plan.empty.plan_label}
        </div>
        <div className='plan-card'>
            <h5>{RESX.device.plan.core.plan_label}</h5>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="inline-label-field">
                    <div>{RESX.device.plan.core.loop_label}</div>
                    <div title={RESX.device.plan.core.loop_title}>
                        <Toggle name={'plan-mode'} defaultChecked={false} checked={state.data.loop} onChange={(e: any) => { dispatch({ type: 'loop-plan', payload: { loop: e.target.checked } }) }} />
                    </div>
                </div>
                <div className='btn-bar'>
                    <button title={RESX.device.plan.core.savePlan_title} className={cx2('btn btn-sm', state.form.dirty ? 'btn-warning' : 'btn-outline-warning')} onClick={() => { dispatch({ type: 'save-device', payload: { deviceContext } }) }}>{RESX.device.plan.core.savePlan_label}</button>
                    <button title={RESX.device.plan.core.clearPlan_title} className='btn btn-sm btn-outline-danger' onClick={() => { dispatch({ type: 'clear-plan', payload: null }) }}>{RESX.device.plan.core.clearPlan_label}</button>
                </div>
            </div>
        </div>
        <div className='plan-card'>
            <h5>{RESX.device.plan.core.startup_label}</h5>
            <div className='mini-grid'>
                {state.data && state.data.startup && state.data.startup.length === 0 ? RESX.device.plan.empty.startup_label :
                    <div className='mini-grid-row-header'>
                        <div className='mini-grid-header'><label title={RESX.device.plan.headers.property_title}>{RESX.device.plan.headers.property_label}</label></div>
                        <div className='mini-grid-header'><label title={RESX.device.plan.headers.value_title}>{RESX.device.plan.headers.value_label}</label></div>
                    </div>
                }
                {state.data && state.data.startup && startUp()}
                <div className='mini-grid-row-toolbar'>
                    <button disabled={sendComms.length === 0} title={RESX.device.plan.core.startup_title} className='btn btn-sm btn-info' onClick={() => { dispatch({ type: 'add-startup', payload: { comms: sendComms } }) }}><i className="fas fa-plus"></i></button>
                </div>
            </div>
        </div>
        <div className='plan-card'>
            <h5>{RESX.device.plan.core.timeline_label}</h5>
            <div className='mini-grid'>
                {state.data && state.data.timeline && state.data.timeline.length === 0 ? RESX.device.plan.empty.timeline_label :
                    <div className='mini-grid-row-header'>
                        <div className='mini-grid-header'><label title={RESX.device.plan.headers.time_start_title}>{RESX.device.plan.headers.time_start_label}</label></div>
                        <div className='mini-grid-header'><label title={RESX.device.plan.headers.property_title}>{RESX.device.plan.headers.property_label}</label></div>
                        <div className='mini-grid-header'><label title={RESX.device.plan.headers.value_title}>{RESX.device.plan.headers.value_label}</label></div>
                    </div>
                }
                {state.data && state.data.timeline && timeline()}
                <div className='mini-grid-row-toolbar'>
                    <button disabled={sendComms.length === 0} title={RESX.device.plan.core.timeline_title} className='btn btn-sm btn-info' onClick={() => { dispatch({ type: 'add-timeline', payload: { comms: sendComms } }) }}><i className="fas fa-plus"></i></button>
                </div>
            </div>
        </div>
        <div className='plan-card'>
            <h5>{RESX.device.plan.core.random_label}</h5>
            <div className='mini-grid'>
                {state.data && state.data.random && state.data.random.length === 0 ? RESX.device.plan.empty.random_label :
                    <div className='mini-grid-row-header'>
                        <div className='mini-grid-header'><label title={RESX.device.plan.headers.property_title}>{RESX.device.plan.headers.property_label}</label></div>
                        <div className='mini-grid-header'><label title={RESX.device.plan.headers.from_title}>{RESX.device.plan.headers.from_label}</label></div>
                        <div className='mini-grid-header'><label title={RESX.device.plan.headers.to_title}>{RESX.device.plan.headers.to_label}</label></div>
                    </div>
                }
                {state.data && state.data.random && random()}
                <div className='mini-grid-row-toolbar'>
                    <button disabled={true} title='Not implemented' className='btn btn-sm btn-info' onClick={() => { dispatch({ type: 'add-random', payload: { comms: sendComms } }) }}><i className="fas fa-plus"></i></button>
                </div>
            </div>
        </div>
        <div className='plan-card'>
            <h5>{RESX.device.plan.core.receive_label}</h5>
            <div className='mini-grid'>
                {state.data && state.data.receive && state.data.receive.length === 0 ? RESX.device.plan.empty.receive_label :
                    <div className='mini-grid-row-header'>
                        <div className='mini-grid-header'><label title={RESX.device.plan.headers.property_in_title}>{RESX.device.plan.headers.property_in_label}</label></div>
                        <div className='mini-grid-header'><label title={RESX.device.plan.headers.property_title}>{RESX.device.plan.headers.property_out_label}</label></div>
                        <div className='mini-grid-header'><label title={RESX.device.plan.headers.value_title}>{RESX.device.plan.headers.value_label}</label></div>
                    </div>
                }
                {state.data && state.data.receive && receive()}
                <div className='mini-grid-row-toolbar'>
                    <button disabled={receiveComms.length === 0} title={RESX.device.plan.core.receive_title} className='btn btn-sm btn-info' onClick={() => { dispatch({ type: 'add-receive', payload: { comms: receiveComms } }) }}><i className="fas fa-plus"></i></button>
                </div>
            </div>
        </div>
    </div>
}