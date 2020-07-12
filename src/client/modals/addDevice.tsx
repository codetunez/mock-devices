var classNames = require('classnames');
import "react-toggle/style.css"

const cxM = classNames.bind(require('./modal.scss'));
const cx = classNames.bind(require('./addDevice.scss'));

import * as React from 'react';
import { Combo, Json } from '../ui/controls';
import axios from 'axios';
import Toggle from 'react-toggle';
import { DeviceContext } from '../context/deviceContext';

const initialState = {
    _kind: '',
    _deviceList: [],
    deviceId: '',
    mockDeviceName: '',
    mockDeviceCount: 1,
    mockDeviceCountMax: 1,
    mockDeviceCloneId: '',
    connectionString: '',
    scopeId: '',
    dpsPayload: '',
    sasKey: '',
    isMasterKey: false,
    capabilityModel: '',
    capabilityUrn: '',
    machineState: '',
    machineStateClipboard: '',
    pnpSdk: false
}

export const AddDevice: React.FunctionComponent<any> = ({ handler }) => {
    const deviceContext: any = React.useContext(DeviceContext);
    const [panel, setPanel] = React.useState(0);
    const [state, setPayload] = React.useState(initialState);
    const [merge, setMerge] = React.useState(false);
    const [jsons, setJsons] = React.useState<any>({})

    React.useEffect(() => {
        let list = [];
        axios.get('/api/devices')
            .then((response: any) => {
                list.push({ name: '--Do not clone. Create device with no capabilities', value: null });
                response.data.map(function (ele: any) {
                    list.push({ name: ele.configuration.mockDeviceName, value: ele._id });
                });
                return axios.get('/api/state');
            })
            .then((response: any) => {
                setPayload({
                    ...state,
                    _deviceList: list,
                    machineStateClipboard: response.data
                })
            })
    }, []);

    const clickAddDevice = (kind: string) => {
        state._kind = kind;
        for (const j in jsons) {
            state[j] = jsons[j]
        }
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

    const togglePnpSdk = () => {
        setPayload({
            ...state,
            pnpSdk: !state.pnpSdk
        });
    }

    const updateField = e => {
        let node = {};
        switch (e.target.name) {
            case 'deviceId':
                node = { [e.target.name]: e.target.value, 'mockDeviceName': e.target.value };
                break;
            default:
                node = { [e.target.name]: e.target.value };
        }
        setPayload({
            ...state,
            ...node
        });
    }

    const getTemplate = (id: string) => {
        axios.get('/api/device/' + id)
            .then(response => {
                const json = response.data;

                if (json == '') {
                    setPayload(Object.assign({}, initialState, { _deviceList: state._deviceList }));
                    return;
                }

                let payload: any = {}
                payload.scopeId = json.configuration.scopeId
                payload.capabilityUrn = json.configuration.capabilityUrn
                payload.mockDeviceCloneId = id

                if (state.pnpSdk) {
                    payload.dpsPayload = { "__iot:interfaces": { "CapabilityModelId": json.configuration.capabilityUrn } }
                } else {
                    payload.dpsPayload = { "iotcModelId": json.configuration.capabilityUrn }
                }

                if (json.configuration.isMasterKey) {
                    payload.sasKey = json.configuration.sasKey;
                    payload.isMasterKey = true;
                }

                setPayload(Object.assign({}, state, payload));
                document.getElementById('device-id').focus();
            })
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
                        [file]: json
                    })
                }
            })
    }

    const updateJson = (text: any, type: string) => {
        setJsons({ ...jsons, [type]: text });
    }

    /* State Machine */

    const updateCurrentState = (nextState) => {
        for (const j in jsons) {
            state[j] = jsons[j]
        }
        axios.post('/api/state/' + (merge ? 'merge' : ''), state[nextState])
            .then(() => {
                deviceContext.refreshAllDevices();
                handler(false);
            })
    }

    const saveToDisk = () => {
        axios.post('/api/saveDialog', state.machineStateClipboard, { headers: { 'Content-Type': 'application/json' } })
            .then(() => {
                handler(false);
            })
    }

    return <div className='m-modal'>
        <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='m-content'>
            <div className='add-device'>
                <div className='m-tabbed-nav' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className='menu-vertical' >
                        <label>Add a mock device</label>
                        <button onClick={() => setPanel(0)} className={cx('btn btn-outline-primary', panel === 0 ? 'active' : '')}>Use DPS</button><br />
                        <button onClick={() => setPanel(1)} className={cx('btn btn-outline-primary', panel === 1 ? 'active' : '')}>Use Connection String</button><br />
                        <label>Add a template</label>
                        <button onClick={() => setPanel(2)} className={cx('btn btn-outline-primary', panel === 2 ? 'active' : '')}>Start with a DCM</button><br />
                        <button onClick={() => setPanel(3)} className={cx('btn btn-outline-primary', panel === 3 ? 'active' : '')}>Start new Template</button><br />
                        <label>State</label>
                        <button onClick={() => setPanel(4)} className={cx('btn btn-outline-primary', panel === 4 ? 'active' : '')}>Load/Save from file system</button><br />
                        <button onClick={() => setPanel(5)} className={cx('btn btn-outline-primary', panel === 5 ? 'active' : '')}>Editor</button><br />
                    </div>
                    {/* <div className='form-group' >
                        <label>Use PnP SDK</label>
                        <div><Toggle name='pnpSdk' checked={state.pnpSdk} defaultChecked={false} onChange={() => { togglePnpSdk() }} /></div>
                    </div> */}
                </div>

                <div className='m-tabbed-panel'>
                    {panel !== 0 ? null : <>
                        <div className='m-tabbed-panel-form'>

                            <div className='form-group'>
                                <label>Clone another mock device or use a template</label><br />
                                <Combo items={state._deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={(e) => getTemplate(e.target.value)} value={state.mockDeviceCloneId || ''} />
                            </div>
                            <div className='form-group'>
                                <label>Device ID (-# appended in bulk create)</label><br />
                                <input autoFocus={true} id="device-id" className='form-control form-control-sm' type='text' name='deviceId' onChange={updateField} value={state.deviceId || ''} />
                            </div>

                            <div className='form-group' style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div className='form-group' style={{ paddingRight: '20px' }} >
                                    <div className='form-group'>
                                        <label>DPS scope ID</label>
                                        <input className='form-control form-control-sm' type='text' name='scopeId' onChange={updateField} value={state.scopeId || ''} />
                                    </div>
                                    <div className='form-group'>
                                        <label>SaS key</label>
                                        <input className='form-control form-control-sm' type='text' name='sasKey' onChange={updateField} value={state.sasKey || ''} />
                                    </div>
                                    <div className='form-group'>
                                        <label>Root key</label>
                                        <div><Toggle name='masterKey' checked={state.isMasterKey} defaultChecked={false} onChange={() => { toggleMasterKey() }} /></div>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <label>DPS blob payload</label>
                                    <div className='form-group'>
                                        <Json json={state.dpsPayload} cb={(text: any) => { updateJson(text, 'dpsPayload') }} />
                                    </div>
                                </div>
                            </div>

                            <div className='form-group' style={{ display: 'flex', alignContent: 'stretch' }}>
                                <div className='form-group' style={{ paddingRight: '10px' }} >
                                    <label>Bulk from # (needs root key)</label><br />
                                    <input className='form-control form-control-sm' type='number' name='mockDeviceCount' disabled={!state.isMasterKey} onChange={updateField} value={state.mockDeviceCount || ''} />
                                </div>
                                <div className='form-group'>
                                    <label>Bulk to # (needs root key)</label><br />
                                    <input className='form-control form-control-sm' type='number' name='mockDeviceCountMax' disabled={!state.isMasterKey} onChange={updateField} value={state.mockDeviceCountMax || ''} />
                                </div>
                            </div>

                            <div className='form-group'>
                                <label>mock-devices friendly name (-# appended in bulk create)</label>
                                <input className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={state.mockDeviceName || ''} />
                            </div>

                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' disabled={state.scopeId == '' || state.deviceId == '' || state.sasKey == '' || (state.pnpSdk && state.capabilityUrn === '')} onClick={() => clickAddDevice('dps')}>Create this mock device</button>
                        </div>
                    </>}

                    {panel !== 1 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>Clone another mock device or use a template</label><br />
                                <Combo items={state._deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={updateField} value={state.mockDeviceCloneId || ''} />
                            </div>
                            <div className='form-group'>
                                <label>Device connection string</label>
                                <textarea className='custom-textarea form-control form-control-sm' name='connectionString' rows={4} onChange={updateField} value={state.connectionString || ''}></textarea>
                            </div>
                            <div className='form-group'>
                                <label>mock-devices friendly name</label>
                                <input className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={state.mockDeviceName || ''} />
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' disabled={!state.connectionString || state.connectionString === '' || state.mockDeviceName === ''} onClick={() => clickAddDevice('hub')}>Create this mock device</button>
                        </div>
                    </>}

                    {panel !== 2 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>mock-devices template Name</label>
                                <input className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={state.mockDeviceName || ''} placeholder='Leave blank to use DCM displayName' />
                            </div>
                            <br />
                            <div className='form-group'>
                                <button className='btn btn-success' onClick={() => loadFromDisk('capabilityModel')}>Browse disk for a DCM</button>
                            </div>

                            <div className='form-group' style={{ height: "calc(100% - 160px)" }}>
                                <Json json={state.capabilityModel} cb={(text: any) => { updateJson(text, 'capabilityModel') }} />
                            </div>

                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' onClick={() => clickAddDevice('template')}>Create template</button>
                        </div>
                    </>}

                    {panel !== 3 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>mock-devices template Name</label>
                                <input className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={state.mockDeviceName || ''} />
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' disabled={!state.mockDeviceName || state.mockDeviceName === ''} onClick={() => clickAddDevice('template')}>Create template</button>
                        </div>
                    </>}

                    {panel !== 4 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <div style={{ height: '250px' }}>
                                    <label>Load a state file</label>
                                    <div>
                                        <span><input type='checkbox' name='merge' checked={merge} onClick={() => setMerge(!merge)} /> Merge Devices (keeps current Simulation config)</span>
                                        <br /><br />
                                        <button className='btn btn-success' onClick={() => loadFromDisk('machineState')}>Browse for file</button>
                                    </div>
                                </div>
                                <div>
                                    <label>Save a state file</label><br />
                                    <button className='btn btn-danger' onClick={() => saveToDisk()}>Browse folder</button>
                                </div>
                            </div>
                        </div>
                    </>}

                    {panel !== 5 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'><label>Copy/Paste the State's JSON</label></div>
                            <div className='form-group' style={{ height: "calc(100% - 60px)" }}>
                                <Json json={state.machineStateClipboard} cb={(text: any) => { updateJson(text, 'machineStateClipboard') }} />
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' onClick={() => updateCurrentState('machineStateClipboard')}>Update current State</button>
                        </div>
                    </>}
                </div>
            </div>
        </div >
    </div >
}