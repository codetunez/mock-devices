var classNames = require('classnames');
const cx = classNames.bind(require('./bulk.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import { Endpoint } from '../context/endpoint';
import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';

import Toggle from 'react-toggle';
import { Combo } from '../ui/controls';
import axios from 'axios';

interface State {
    data: any,
    includes: any,
    ux: any
}

interface Action {
    type: any;
    payload: any;
}

const reducer = (state: State, action: Action) => {

    const newData = Object.assign({}, state.data);
    const newInclude = Object.assign({}, state.includes);
    const newUx = Object.assign({}, state.ux);

    switch (action.type) {
        case "update-include":
            newInclude[action.payload.name] = !state.includes[action.payload.name];
            return { ...state, data: newData, includes: newInclude, ux: newUx };
        case "update-setting-toggle":
            newData[action.payload.name] = !state.data[action.payload.name];
            return { ...state, data: newData, includes: newInclude, ux: newUx };
        case "update-setting-text":
            newData[action.payload.name] = action.payload.value;
            return { ...state, data: newData, includes: newInclude, ux: newUx };
        case "update-capabilities":
            newUx.devicesList = action.payload.data.devices
            newUx.capabilitiesList = action.payload.data.capabilities;
            newUx.allDevices = action.payload.all;
            return { ...state, data: newData, includes: newInclude, ux: newUx };
        case "select-capabilities":
            newUx.selectedCapabilitiesList = action.payload.data;
            newUx.allCapabilities = action.payload.all;
            return { ...state, data: newData, includes: newInclude, ux: newUx };
        default:
            return state;
    }
}

export const Bulk: React.FunctionComponent<any> = ({ handler }) => {
    const deviceContext: any = React.useContext(DeviceContext);

    const [state, dispatch] = React.useReducer(reducer, { data: {}, includes: {}, ux: { allDevices: false, allCapabilities: false, devicesList: [], capabilitiesList: [], selectedCapabilitiesList: [] } });

    const apply = () => {
        deviceContext.appBulkUpdates({
            devicesList: state.ux.devicesList,
            capabilitiesList: state.ux.selectedCapabilitiesList,
            allDevices: state.ux.allDevices,
            allCapabilities: state.ux.allCapabilities,
            payload: {
                include: state.includes,
                data: state.data
            }
        });
        // this is a temp hack to workround a routing issue
        window.location.href = "/devices";
        handler();
    }

    const setDeviceList = (all?: boolean) => {
        const selectedList = [];
        if (!all) {
            const list: any = document.getElementById('devices');
            for (const item of list) { if (item.selected) { selectedList.push(item.value) } }
        }

        axios.post(`${Endpoint.getEndpoint()}api/bulk/properties`, { devices: selectedList, allDevices: all || false })
            .then((res) => {
                dispatch({ type: 'update-capabilities', payload: { data: res.data, all: all || false } });
            })
            .catch((err) => {
                console.log(err);
            })
    }

    const setCapabilitiesList = (all?: boolean) => {
        const selectedList = [];
        if (!all) {
            const list: any = document.getElementById('capabilities');
            for (const item of list) { if (item.selected) { selectedList.push(item.value) } }
        }
        dispatch({ type: 'select-capabilities', payload: { data: selectedList, all: all || false } });
    }

    const updateApply = (e: any) => {
        dispatch({ type: 'update-include', payload: { name: e.target.name, value: e.target.checked } });
    }

    const updateToggle = (e: any) => {
        dispatch({ type: 'update-setting-toggle', payload: { name: e.target.name, value: e.target.checked } });
    }

    const updateSetting = (e: any) => {
        dispatch({ type: 'update-setting-text', payload: { name: e.target.name, value: e.target.value } });
    }

    const indexes = deviceContext.devices.map((ele) => {
        if (ele.configuration._kind === 'dps' || ele.configuration._kind === 'hub' || ele.configuration._kind === 'module' || ele.configuration._kind === 'template') {
            return { name: ele.configuration.mockDeviceName, value: ele.configuration.deviceId }
        }
    });

    const capIndexes = state.ux.capabilitiesList.map((ele) => {
        return { name: ele, value: ele }
    });

    return <div className='dialog-bulk'>
        <div className='m-modal'>
            <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
            <div className='m-content'>
                <h4>{RESX.modal.bulk.title} (Beta)</h4>
                <span>Update the selected devices and capabilities with new configuration settings. Use the CTRL key to do multi-select. Use the checkbox to include the setting when applying change. Updates are only applied where supported by capability</span>
                <div className='split-pane'>
                    <div className='form-group'>
                        <label><input type='checkbox' name='allDevices' checked={state.ux.allDevices} onClick={() => setDeviceList(!state.ux.allDevices)} /> {RESX.modal.bulk.select_all_devices}</label>
                        <select className='custom-select' id='devices' disabled={state.ux.allDevices} multiple={true} size={8} onClick={() => setDeviceList()} >
                            {indexes && indexes.map((ele) => {
                                if (ele) { return <option value={ele.value}>{ele.name}</option> }
                            })}
                        </select>
                        <br /><br />
                        <label><input type='checkbox' name='all' checked={state.ux.allCapabilities} onClick={() => setCapabilitiesList(!state.ux.allCapabilities)} /> {RESX.modal.bulk.select_all_caps}</label>
                        <select className='custom-select' id='capabilities' disabled={state.ux.allCapabilities} multiple={true} size={9} onClick={() => setCapabilitiesList()}>
                            {capIndexes && capIndexes.map((ele) => {
                                if (ele) { return <option value={ele.value}>{ele.name}</option> }
                            })}
                        </select>
                    </div>
                    <div className='form-group'>

                        <div className='form-group'>
                            <div className='inline-form'>
                                <input type='checkbox' name='override' checked={state.includes.override || false} onClick={(e) => updateApply(e)} />
                                <label>Use simulation config for loop duration</label>
                            </div>
                            <div><Toggle name='override' defaultChecked={false} checked={state.data.override || false} onChange={(e) => { updateToggle(e) }} /></div>
                        </div>

                        <div className='form-group'>
                            <div className='inline-form'>
                                <input type='checkbox' name='loop' checked={state.includes.loop || false} onClick={(e) => updateApply(e)} />
                                <label>Set a loop duration</label>
                            </div>
                            <div className='df-card-row' style={{ marginTop: '0' }}>
                                <div><label title={RESX.device.card.send.unit_title}>{RESX.device.card.send.unit_label}</label>
                                    <div><Combo items={[{ name: '--Select', value: null }, { name: 'Mins', value: 'mins' }, { name: 'Secs', value: 'secs' }]} cls='custom-textarea-sm' name='loop_unit' onChange={(e) => { updateSetting(e) }} /></div>
                                </div>
                                <div><label title={RESX.device.card.send.duration_title}>{RESX.device.card.send.duration_label}</label>
                                    <div><input type='number' className='form-control form-control-sm' name='loop_min' min={0} onChange={(e) => { updateSetting(e) }} placeholder='int' /></div>
                                </div>
                                <div><label title={RESX.device.card.send.duration_max_title}>{RESX.device.card.send.duration_max_label}</label>
                                    <div><input type='number' className='form-control form-control-sm' name='loop_max' min={0} onChange={(e) => { updateSetting(e) }} placeholder='int' /></div>
                                </div>
                            </div>
                        </div>

                        <div className='form-group'>
                            <div className='inline-form'>
                                <input type='checkbox' name='startup' checked={state.includes.startup || false} onClick={(e) => updateApply(e)} />
                                <label>Send value when device powers on</label>
                            </div>
                            <div><Toggle name={'startup'} defaultChecked={false} checked={state.data.startup || false} onChange={(e) => { updateToggle(e) }} /></div>
                        </div>

                        <div className='form-group'>
                            <div className='inline-form'>
                                <input type='checkbox' name='value' checked={state.includes.value || false} onClick={(e) => updateApply(e)} />
                                <label>Set a primitive value or JSON</label>
                            </div>
                            <input className='form-control form-control-sm' type='text' name='value' onChange={(e) => { updateSetting(e) }} placeholder='Treat as "any". Capability will define type' />
                        </div>

                        <div className='form-group'>
                            <div className='inline-form'>
                                <input type='checkbox' name='component' checked={state.includes.component || false} onClick={(e) => updateApply(e)} />
                                <label>Set the Component Name</label>
                            </div>
                            <input className='form-control form-control-sm' type='text' name='component' onChange={(e) => { updateSetting(e) }} placeholder='Use any string' />
                        </div>

                        <div className='form-group'>
                            <div className='inline-form'>
                                <input type='checkbox' name='plugin' checked={state.includes.plugin || false} onClick={(e) => updateApply(e)} />
                                <label>Set a Plugin (updates device only)</label>
                            </div>
                            <input className='form-control form-control-sm' type='text' name='plugin' onChange={(e) => { updateSetting(e) }} placeholder='Use the plugin name (case sensitive)' />
                        </div>

                        <div className='form-group'>
                            <div className='inline-form'>
                                <input type='checkbox' name='geo' checked={state.includes.geo || false} onClick={(e) => updateApply(e)} />
                                <label>Set Geo index (updates device only)</label>
                            </div>
                            <input className='form-control form-control-sm' type='text' name='geo' onChange={(e) => { updateSetting(e) }} placeholder='From index in simulation config. Used by AUTO_GEO macro' />
                        </div>

                        <div className='form-group btn-bar'>
                            <button disabled={state.ux.selectedCapabilitiesList.length === 0} title={RESX.modal.bulk.cta_title} className='btn btn-primary' onClick={() => apply()}>{RESX.modal.bulk.cta_label}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div >
}