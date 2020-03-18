var classNames = require('classnames');
const cx = classNames.bind(require('./addDevice.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import * as React from 'react';
import { Combo } from '../ui/controls';
import axios from 'axios';
import { Toggle, ReactToggleThemeProvider } from 'react-toggle-component';
import { toggleStyles } from '../ui/codeStyles';

import { DeviceContext } from '../context/deviceContext';

export const AddDevice: React.FunctionComponent<any> = ({ handler }) => {
    const deviceContext: any = React.useContext(DeviceContext);
    const [panel, setPanel] = React.useState(0);
    const [state, setPayload] = React.useState({
        _kind: '',
        _deviceList: [],
        deviceId: '',
        mockDeviceName: '',
        mockDeviceCount: 1,
        mockDeviceCloneId: '',
        connectionString: '',
        scopeId: '',
        dpsPayload: '',
        sasKey: '',
        isMasterKey: false,
        capabilityModel: '',
        machineState: '',
        machineStateClipboard: ''
    });
    const [merge, setMerge] = React.useState(false);

    React.useEffect(() => {
        let list = [];
        axios.get('/api/devices')
            .then((response: any) => {
                list.push({ name: '--Select', value: null });
                response.data.map(function (ele: any) {
                    list.push({ name: ele.configuration.mockDeviceName, value: ele._id });
                });
                return axios.get('/api/state');
            })
            .then((response: any) => {
                setPayload({
                    ...state,
                    _deviceList: list,
                    machineStateClipboard: JSON.stringify(response.data, null, 1)
                })
            })
    }, []);

    const clickAddDevice = (kind: string) => {
        state._kind = kind;
        axios.post('/api/device/new', state).then(res => {
            deviceContext.setDevices(res.data);
            handler(false);
        })
    }

    const toggleMasterKey = () => {
        setPayload({
            ...state,
            isMasterKey: !state.isMasterKey
        });
    }

    const updateField = e => {
        let node = e.target.name === 'deviceId' ? { [e.target.name]: e.target.value, 'mockDeviceName': e.target.value } : { [e.target.name]: e.target.value }
        setPayload({
            ...state,
            ...node
        });
    }

    const loadFromDisk = (file: string) => {
        axios.get('/api/openDialog')
            .then(response => {
                const json = response.data;
                if (file === 'machineState') {
                    axios.post('/api/state/' + (merge ? 'merge' : ''), json)
                        .then(() => {
                            deviceContext.refreshAllDevices();
                            handler(false);
                        })
                } else {
                    setPayload({
                        ...state,
                        [file]: JSON.stringify(json, null, 1)
                    })
                }
            })
    }

    /* State Machine */

    const updateCurrentState = (nextState) => {
        axios.post('/api/state/' + (merge ? 'merge' : ''), JSON.parse(state[nextState]))
            .then(() => {
                deviceContext.refreshAllDevices();
                handler(false);
            })
    }

    const saveToDisk = () => {
        axios.post('/api/saveDialog', state.machineState, { headers: { 'Content-Type': 'application/json' } })
            .then(() => {
                handler(false);
            })
    }

    return <div className='m-modal'>
        <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='m-content'>
            <div className='add-device'>
                <div className='m-tabbed-nav'>
                    <label>Add a Mock Device</label>
                    <button onClick={() => setPanel(0)} className={cx('btn btn-outline-primary', panel === 0 ? 'active' : '')}>Use DPS</button><br />
                    <button onClick={() => setPanel(1)} className={cx('btn btn-outline-primary', panel === 1 ? 'active' : '')}>Use Connection String</button><br />
                    <label>Add a Template</label>
                    <button onClick={() => setPanel(2)} className={cx('btn btn-outline-primary', panel === 2 ? 'active' : '')}>Start with a DCM</button><br />
                    <button onClick={() => setPanel(3)} className={cx('btn btn-outline-primary', panel === 3 ? 'active' : '')}>Start new Template</button><br />
                    <label>State Machine</label>
                    <button onClick={() => setPanel(4)} className={cx('btn btn-outline-primary')}>Load/Save from file system</button><br />
                    <button onClick={() => setPanel(5)} className={cx('btn btn-outline-primary')}>Copy/Paste</button><br />
                </div>

                <div className='m-tabbed-panel'>
                    {panel !== 0 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'><h4>DPS Device Identification and Auth</h4></div>
                            <div className='form-group' style={{ display: 'flex', alignContent: 'stretch' }}>
                                <div className='form-group' style={{ paddingRight: '10px' }} >
                                    <label>DPS Scope ID</label>
                                    <input className='form-control form-control-sm' type='text' name='scopeId' onChange={updateField} value={state.scopeId || ''} />
                                </div>
                                <div className='form-group'>
                                    <label>Device Id</label>
                                    <input className='form-control form-control-sm' type='text' name='deviceId' onChange={updateField} value={state.deviceId || ''} />
                                </div>
                            </div>
                            <div className='form-group' style={{ display: 'flex', alignContent: 'stretch' }}>
                                <div className='form-group' style={{ paddingRight: '10px' }} >
                                    <label>SaS Key</label>
                                    <input className='form-control form-control-sm' type='text' name='sasKey' onChange={updateField} value={state.sasKey || ''} />
                                </div>

                                <div className='form-group'>
                                    <label>Is Root key (HMAC-SHA265)</label>
                                    <div><ReactToggleThemeProvider theme={toggleStyles}><Toggle name={'masterKey'} checked={state.isMasterKey} onToggle={() => { toggleMasterKey() }} /></ReactToggleThemeProvider></div>
                                </div>
                            </div>
                            <div className='form-group'>
                                <label>DPS Payload JSON (Optional)</label>
                                <textarea className='custom-textarea form-control form-control-sm' name='dpsPayload' rows={3} onChange={updateField} value={state.dpsPayload || ''}></textarea>
                            </div>
                            <div className='form-group'>
                                <h4>Mock Devices configuration</h4>
                                <div className='form-group' style={{ display: 'flex', alignContent: 'stretch' }}>
                                    <div className='form-group' style={{ paddingRight: '10px' }} >
                                        <label>Mock Name</label>
                                        <input className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={state.mockDeviceName || ''} />
                                    </div>
                                    <div className='form-group' style={{ paddingRight: '10px' }} >
                                        <label>Use Template</label><br />
                                        <Combo items={state._deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={updateField} value={state.mockDeviceCloneId || ''} />
                                    </div>
                                    <div className='form-group'>
                                        <label>Number of Devices</label><br />
                                        <input className='form-control form-control-sm' type='number' name='mockDeviceCount' onChange={updateField} value={state.mockDeviceCount || ''} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' onClick={() => clickAddDevice('dps')}>Add this DPS Device</button>
                        </div>
                    </>}

                    {panel !== 1 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'><h4>IoT Hub Device Connection String</h4></div>
                            <div className='form-group'>
                                <textarea className='custom-textarea form-control form-control-sm' name='connectionString' rows={4} onChange={updateField} value={state.connectionString || ''}></textarea>
                            </div>
                            <div className='form-group'>
                                <h4>Mock Devices configuration</h4>
                                <div className='form-group' style={{ display: 'flex', alignContent: 'stretch' }}>
                                    <div className='form-group' style={{ paddingRight: '10px' }} >
                                        <label>Mock Name</label>
                                        <input className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={state.mockDeviceName || ''} />
                                    </div>
                                    <div className='form-group'>
                                        <label>Use Template</label><br />
                                        <Combo items={state._deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={updateField} value={state.mockDeviceCloneId || ''} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' onClick={() => clickAddDevice('hub')}>Add this IoT Hub Device</button>
                        </div>
                    </>}

                    {panel !== 2 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'><h4>Enter a Device Capability Model</h4></div>
                            <div className='form-group'>
                                <textarea className='custom-textarea form-control form-control-sm' style={{ overflow: 'scroll', whiteSpace: 'nowrap' }} name='capabilityModel' rows={19} onChange={updateField} value={state.capabilityModel || ''}></textarea>
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button className='btn btn-success' onClick={() => loadFromDisk('capabilityModel')}>Load from Disk</button>
                                <button className='btn btn-info' onClick={() => clickAddDevice('template')}>Create Template</button>
                            </div>
                        </div>
                    </>}

                    {panel !== 3 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'><h4>New Template Name</h4></div>
                            <div className='form-group'>
                                <input className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={state.mockDeviceName || ''} />
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' onClick={() => clickAddDevice('template')}>Create Template</button>
                        </div>
                    </>}

                    {panel !== 4 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <div style={{ height: '250px' }}>
                                    <h4>Load state from a file</h4>
                                    <div>
                                        <span><input type='checkbox' name='merge' checked={merge} onClick={() => setMerge(!merge)} /> Merge Devices (keeps current Simulation config)</span>
                                        <br />
                                        <button className='btn btn-success' onClick={() => loadFromDisk('machineState')}>Browse</button>
                                    </div>
                                </div>
                                <div>
                                    <h4>Save current state to a file</h4>
                                    <div>
                                        <button className='btn btn-success' onClick={() => saveToDisk()}>Browse</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>}

                    {panel !== 5 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'><h4>Copy/Paste the State's JSON</h4></div>
                            <div className='form-group'>
                                <textarea className='custom-textarea form-control form-control-sm' name='machineStateClipboard' rows={19} onChange={updateField} value={state.machineStateClipboard || ''}></textarea>
                            </div>
                            <div className='m-tabbed-panel-footer'>
                                <button className='btn btn-info' onClick={() => updateCurrentState('machineStateClipboard')}>Update current State</button>
                            </div>
                        </div>
                    </>}
                </div>
            </div>
        </div>
    </div >
}