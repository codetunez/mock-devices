var classNames = require('classnames');
import "react-toggle/style.css"

const cxM = classNames.bind(require('./modal.scss'));
const cx = classNames.bind(require('./addDevice.scss'));
import { Endpoint } from '../context/endpoint';

import * as React from 'react';
import { useHistory } from 'react-router-dom'

import { Combo, Json } from '../ui/controls';
import axios from 'axios';
import Toggle from 'react-toggle';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';

const initialState = {
    _kind: '',
    _deviceList: [],
    _plugIns: [],
    _modules: [],
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
    plugIn: ''
}

export const AddDevice: React.FunctionComponent<any> = ({ handler }) => {
    const deviceContext: any = React.useContext(DeviceContext);

    const edgeRef = React.useRef(null);

    const [panel, setPanel] = React.useState(0);
    const [state, setPayload] = React.useState(initialState);
    const [merge, setMerge] = React.useState(false);
    const [jsons, setJsons] = React.useState<any>({});
    const [error, setError] = React.useState<any>('');
    const [moduleList, setModuleList] = React.useState([]);

    const history = useHistory();

    React.useEffect(() => {
        let list = [];
        let plugIns = [];
        let clipboard = '';
        axios.get(`${Endpoint.getEndpoint()}api/devices`)
            .then((response: any) => {
                list.push({ name: RESX.modal.add.option1.select, value: null });
                response.data.map((ele: any) => {
                    list.push({ name: ele.configuration.mockDeviceName + (ele.configuration._kind === 'template' ? ' [T]' : ''), value: ele._id });
                });
                return axios.get(`${Endpoint.getEndpoint()}api/state`);
            })
            .then((res) => {
                clipboard = res.data;
                return axios.get(`${Endpoint.getEndpoint()}api/plugins`);
            })
            .then((response: any) => {

                plugIns.push({ name: "--No plug in selected", value: null });
                response.data.map((ele: any) => {
                    plugIns.push({ name: ele, value: ele });
                });

                setPayload({
                    ...state,
                    _deviceList: list,
                    _plugIns: plugIns,
                    machineStateClipboard: clipboard
                })
            })
    }, []);

    const toggleMasterKey = () => {
        setPayload({
            ...state,
            isMasterKey: !state.isMasterKey
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

    const getCatalogDevice = (id: string) => {
        axios.get(`${Endpoint.getEndpoint()}api/dtdl/${id}`)
            .then(response => {
                setPayload({
                    ...state,
                    "capabilityModel": response.data
                })
            })
    }

    const clickAddDevice = (kind: string) => {
        state._kind = kind === 'quick' ? 'dps' : kind;
        state.machineStateClipboard = null;
        for (const j in jsons) {
            state[j] = jsons[j]
        }
        axios.post(`${Endpoint.getEndpoint()}api/device/new${kind === 'quick' ? '/quick' : ''}`, state)
            .then(res => {
                deviceContext.setDevices(res.data);
                history.push('/devices');
                handler(false);
            })
            .catch((err) => {
                const msg = err.response && err.response.data && err.response.data.message || RESX.modal.add.error_generic_add;
                setError(msg);
            })
    }

    const setModuleTemplate = (id, index) => {
        axios.get(`${Endpoint.getEndpoint()}api/device/${id}`)
            .then(response => {
                const json = response.data;
                const newState = state._modules.slice();
                newState[index].templateId = json.configuration.deviceId
                setPayload({
                    ...state,
                    _modules: newState
                });
            })
    }

    const setMainDeviceTemplate = (id: string) => {
        axios.get(`${Endpoint.getEndpoint()}api/device/${id}`)
            .then(response => {
                const json = response.data;

                let payload: any = {}
                payload.mockDeviceCloneId = json === '' ? '' : id;
                payload.capabilityUrn = json === '' ? '' : json.configuration.capabilityUrn
                payload.dpsPayload = json === '' ? '' : { "iotcModelId": json.configuration.capabilityUrn }

                setPayload({
                    ...state,
                    ...payload
                });
                document.getElementById('device-id').focus();
            })
    }

    const loadFromDisk = (file: string) => {
        axios.get(`${Endpoint.getEndpoint()}api/openDialog`)
            .then(response => {
                const json = response.data;
                if (file === 'machineState') {
                    axios.post(`${Endpoint.getEndpoint()}api/state/${merge ? 'merge' : ''}`, json)
                        .then(() => {
                            deviceContext.refreshAllDevices();
                            history.push('/devices');
                            handler(false);
                        })
                        .catch((err) => {
                            const msg = err.response && err.response.data && err.response.data.message || RESX.modal.add.error_generic_add;
                            setError(msg);
                        })
                } else {
                    setPayload({
                        ...state,
                        [file]: json
                    })
                }
            })
    }

    const loadFromQRCode = () => {
        axios.get(`${Endpoint.getEndpoint()}api/qrcode`)
            .then(response => {
                const qrCodeData = JSON.parse(response.data.code);
                let payload: any = {};
                payload.mockDeviceName = qrCodeData.displayName;
                payload.scopeId = qrCodeData.idScope;
                payload.deviceId = qrCodeData.deviceId;
                payload.capabilityUrn = qrCodeData.template;
                payload.dpsPayload = { "iotcModelId": qrCodeData.template }
                payload.sasKey = qrCodeData.symmetricKey.primaryKey;
                payload.isMasterKey = false;
                setPayload(Object.assign({}, state, payload));
            })
            .catch((err) => {
                setError('Cannot decode QR Code. Check generated image');
            })
    }

    const updateJson = (text: any, type: string) => {
        setJsons({ ...jsons, [type]: text });
        setError('');
    }

    const selectPanel = (panelNumber: number) => {
        setPanel(panelNumber);
        setError('');
    }

    /* State Machine */

    const updateCurrentState = (nextState) => {
        if (error === '') {
            axios.post(`${Endpoint.getEndpoint()}api/state/${merge ? 'merge' : ''}`, jsons[nextState])
                .then(() => {
                    deviceContext.refreshAllDevices();
                    history.push('/devices');
                    handler(false);
                })
                .catch((err) => {
                    setError(RESX.modal.add.error_state);
                })
        }
    }

    const saveToDisk = () => {
        axios.post(`${Endpoint.getEndpoint()}api/saveDialog`, state.machineStateClipboard, { headers: { 'Content-Type': 'application/json' } })
            .then(() => {
                handler(false);
            })
            .catch((err) => {
                setError(RESX.modal.add.error_file);
            })
    }

    const loadManifest = () => {
        axios.get(`${Endpoint.getEndpoint()}api/openDialog`)
            .then(response => {
                if (response.data) {
                    const modules = response.data?.modulesContent?.['$edgeAgent']?.['properties.desired']?.['modules'] || {};
                    const list = [];
                    for (const module in modules) {
                        list.push({ id: module, templateId: null });
                    }
                    setPayload({
                        ...state,
                        _modules: list
                    });

                    setTimeout(() => {
                        edgeRef.current.scrollIntoView();
                    }, 250)
                };
            })
    }

    return <div className='dialog-add'>
        <div className='m-modal'>
            <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
            <div className='m-content'>
                <div className='m-tabbed-nav' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className='menu-vertical' >
                        <label>{RESX.modal.add.option1.title}</label>
                        <button title={RESX.modal.add.option1.buttons.button3_title} onClick={() => selectPanel(7)} className={cx('btn btn-outline-info', panel === 7 ? 'active' : '')}>{RESX.modal.add.option1.buttons.button3_label}</button><br />
                        <button title={RESX.modal.add.option1.buttons.button1_title} onClick={() => selectPanel(0)} className={cx('btn btn-outline-info', panel === 0 ? 'active' : '')}>{RESX.modal.add.option1.buttons.button1_label}</button><br />
                        <button title={RESX.modal.add.option1.buttons.button2_title} onClick={() => selectPanel(1)} className={cx('btn btn-outline-info', panel === 1 ? 'active' : '')}>{RESX.modal.add.option1.buttons.button2_label}</button><br />
                        <button title={RESX.modal.add.option1.buttons.button4_title} onClick={() => selectPanel(8)} className={cx('btn btn-outline-info', panel === 8 ? 'active' : '')}>{RESX.modal.add.option1.buttons.button4_label}</button><br />
                        <label>{RESX.modal.add.option4.title}</label>
                        <button title={RESX.modal.add.option4.buttons.button1_title} onClick={() => selectPanel(6)} className={cx('btn btn-outline-info', panel === 6 ? 'active' : '')}>{RESX.modal.add.option4.buttons.button1_label}</button><br />
                        <label>{RESX.modal.add.option2.title}</label>
                        <button title={RESX.modal.add.option2.buttons.button1_title} onClick={() => selectPanel(2)} className={cx('btn btn-outline-info', panel === 2 ? 'active' : '')}>{RESX.modal.add.option2.buttons.button1_label}</button><br />
                        <button title={RESX.modal.add.option2.buttons.button2_title} onClick={() => selectPanel(3)} className={cx('btn btn-outline-info', panel === 3 ? 'active' : '')}>{RESX.modal.add.option2.buttons.button2_label}</button><br />
                        <label>{RESX.modal.add.option3.title}</label>
                        {deviceContext.ui.container ? null : <>
                            <button title={RESX.modal.add.option3.buttons.button1_title} onClick={() => selectPanel(4)} className={cx('btn btn-outline-info', panel === 4 ? 'active' : '')}>{RESX.modal.add.option3.buttons.button1_label}</button><br />
                        </>}
                        <button title={RESX.modal.add.option3.buttons.button2_title} onClick={() => selectPanel(5)} className={cx('btn btn-outline-info', panel === 5 ? 'active' : '')}>{RESX.modal.add.option3.buttons.button2_label}</button><br />
                    </div>
                    <div className='form-group'>
                        {deviceContext.ui.container ? <div className='container'>{Endpoint.getEndpoint()}<br /><i className="fab fa-docker fa-2x fa-fw" /></div> : null}
                        <span className='error'>{error}</span>
                    </div>
                </div>
                <div className='m-tabbed-panel'>
                    {panel !== 0 ? null : <>
                        <div className='m-tabbed-panel-form'>

                            <div className='form-group'>
                                <label>{RESX.modal.add.option1.label.clone}</label><br />
                                <Combo items={state._deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={(e) => setMainDeviceTemplate(e.target.value)} value={state.mockDeviceCloneId || ''} />
                            </div>

                            <div className='form-group'>
                                <label>{RESX.modal.plugin}</label><br />
                                <Combo items={state._plugIns} cls='custom-textarea-sm' name='plugIn' onChange={updateField} value={state.plugIn || ''} />
                            </div>

                            <div className='form-group'>
                                <label>{RESX.modal.add.option1.label.deviceId}</label><br />
                                <input autoComplete="off" autoFocus={true} id="device-id" className='form-control form-control-sm' type='text' name='deviceId' onChange={updateField} value={state.deviceId || ''} />
                            </div>

                            <div className='form-group' style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0 }}>
                                <div className='form-group' style={{ paddingRight: '20px' }} >
                                    <div className='form-group'>
                                        <label>{RESX.modal.add.option1.label.dps}</label>
                                        <input autoComplete="off" className='form-control form-control-sm' type='text' name='scopeId' onChange={updateField} value={state.scopeId || ''} />
                                    </div>
                                    <div className='form-group'>
                                        <label>{RESX.modal.add.option1.label.sas}</label>
                                        <input autoComplete="off" className='form-control form-control-sm' type='text' name='sasKey' onChange={updateField} value={state.sasKey || ''} />
                                    </div>
                                    <div className='form-group'>
                                        <label>{RESX.modal.add.option1.label.root}</label>
                                        <div><Toggle name='masterKey' checked={state.isMasterKey} defaultChecked={false} onChange={() => { toggleMasterKey() }} /></div>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <label>{RESX.modal.add.option1.label.dps_blob}</label>
                                    <div className='form-group'>
                                        <Json json={state.dpsPayload} cb={(text: any) => { updateJson(text, 'dpsPayload') }} err={() => setError(RESX.modal.error_json)} />
                                    </div>
                                </div>
                            </div>

                            <div className='form-group' style={{ display: 'flex', alignContent: 'stretch' }}>
                                <div className='form-group' style={{ paddingRight: '10px' }} >
                                    <label>{RESX.modal.add.option1.label.bulk_from}</label><br />
                                    <input autoComplete="off" className='form-control form-control-sm' type='number' name='mockDeviceCount' disabled={!state.isMasterKey} onChange={updateField} value={state.mockDeviceCount || ''} />
                                </div>
                                <div className='form-group'>
                                    <label>{RESX.modal.add.option1.label.bulk_to}</label><br />
                                    <input autoComplete="off" className='form-control form-control-sm' type='number' name='mockDeviceCountMax' disabled={!state.isMasterKey} onChange={updateField} value={state.mockDeviceCountMax || ''} />
                                </div>
                            </div>

                            <div className='form-group'>
                                <label>{RESX.modal.add.option1.label.friendly}</label>
                                <input autoComplete="off" className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={state.mockDeviceName || ''} />
                            </div>

                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button title={RESX.modal.add.option1.cta_title} className='btn btn-primary' disabled={state.scopeId === '' || state.deviceId === '' || state.sasKey === ''} onClick={() => clickAddDevice('dps')}>{RESX.modal.add.option1.cta_label}</button>
                        </div>
                    </>}

                    {panel !== 1 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>{RESX.modal.add.option1.label.clone}</label><br />
                                <Combo items={state._deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={updateField} value={state.mockDeviceCloneId || ''} />
                            </div>
                            <div className='form-group'>
                                <label>{RESX.modal.plugin}</label><br />
                                <Combo items={state._plugIns} cls='custom-textarea-sm' name='plugIn' onChange={updateField} value={state.plugIn || ''} />
                            </div>
                            <div className='form-group'>
                                <label>{RESX.modal.add.option1.label.connstr}</label>
                                <textarea className='custom-textarea form-control form-control-sm' name='connectionString' rows={4} onChange={updateField} value={state.connectionString || ''}></textarea>
                            </div>
                            <div className='form-group'>
                                <label>{RESX.modal.add.option1.label.friendly_sm}</label>
                                <input autoComplete="off" className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={state.mockDeviceName || ''} />
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button title={RESX.modal.add.option1.cta_title} className='btn btn-primary' disabled={!state.connectionString || state.connectionString === '' || state.mockDeviceName === ''} onClick={() => clickAddDevice('hub')}>{RESX.modal.add.option1.cta_label}</button>
                        </div>
                    </>}

                    {panel !== 2 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>{RESX.modal.add.option2.label.name}</label>
                                <input className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={state.mockDeviceName || ''} placeholder={RESX.modal.add.option2.label.name_placeholder} />
                            </div>
                            {deviceContext.ui.container ? null : <>
                                <br />
                                <div className='form-group'>
                                    <button className='btn btn-success' onClick={() => loadFromDisk('capabilityModel')}>{RESX.modal.add.option2.label.browse}</button>
                                </div>
                            </>}
                            <div className='form-group' style={{ height: "calc(100% - 190px)" }}>
                                <Json json={state.capabilityModel} cb={(text: any) => { updateJson(text, 'capabilityModel') }} err={() => setError(RESX.modal.error_json)} />
                            </div>
                            <div className="snippets" style={{ "marginTop": "-10px" }}>
                                <div>{RESX.modal.add.option2.label.catalog}</div>
                                <div className="snippet-links"><div onClick={() => getCatalogDevice('mockDevices')}>{RESX.modal.add.option2.label.catalog_sample}</div></div>
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button title={RESX.modal.add.option2.cta_title} className='btn btn-primary' onClick={() => clickAddDevice('template')}>{RESX.modal.add.option2.cta_label}</button>
                        </div>
                    </>}

                    {panel !== 3 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>{RESX.modal.add.option2.label.name}</label>
                                <input autoComplete="off" className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={state.mockDeviceName || ''} />
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button title={RESX.modal.add.option2.cta_title} className='btn btn-primary' disabled={!state.mockDeviceName || state.mockDeviceName === ''} onClick={() => clickAddDevice('template')}>{RESX.modal.add.option2.cta_label}</button>
                        </div>
                    </>}

                    {panel !== 4 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <div style={{ height: '300px' }}>
                                    <span>{RESX.modal.add.option3.label.description}</span>
                                    <br /><br />
                                    <label>{RESX.modal.add.option3.label.state}</label>
                                    <div>
                                        <span><input type='checkbox' name='merge' checked={merge} onClick={() => setMerge(!merge)} /> {RESX.modal.add.option3.label.merge}</span>
                                        <br /><br />
                                        <button className='btn btn-success' onClick={() => loadFromDisk('machineState')}>{RESX.modal.add.option3.label.browse}</button>
                                    </div>
                                </div>
                                <br />
                                <div>
                                    <label>{RESX.modal.add.option3.label.state_save}</label><br />
                                    <button className='btn btn-danger' onClick={() => saveToDisk()}>{RESX.modal.add.option3.label.browse_folder}</button>
                                </div>
                            </div>
                        </div>
                    </>}

                    {panel !== 5 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'><label>{RESX.modal.add.option3.label.copy}</label></div>
                            <div className='form-group' style={{ height: "calc(100% - 60px)" }}>
                                <Json json={state.machineStateClipboard} cb={(text: any) => { updateJson(text, 'machineStateClipboard') }} err={() => setError(RESX.modal.error_json)} />
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button title={RESX.modal.add.option3.cta_title} className='btn btn-primary' onClick={() => updateCurrentState('machineStateClipboard')}>{RESX.modal.add.option3.cta_label}</button>
                        </div>
                    </>}

                    {panel !== 6 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>Use a template or clone another device/module</label><br />
                                <Combo items={state._deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={(e) => setMainDeviceTemplate(e.target.value)} value={state.mockDeviceCloneId || ''} />
                            </div>

                            <div className='form-group'>
                                <label>{RESX.modal.plugin}</label><br />
                                <Combo items={state._plugIns} cls='custom-textarea-sm' name='plugIn' onChange={updateField} value={state.plugIn || ''} />
                            </div>

                            <div className='form-group'>
                                <label>DeviceID (Edge registration_id)</label><br />
                                <input autoComplete="off" autoFocus={true} id="device-id" className='form-control form-control-sm' type='text' name='deviceId' onChange={updateField} value={state.deviceId || ''} />
                            </div>

                            <div className='form-group'>
                                <label>Scope ID (Edge scope_id)</label>
                                <input autoComplete="off" className='form-control form-control-sm' type='text' name='scopeId' onChange={updateField} value={state.scopeId || ''} />
                            </div>
                            <div className='form-group'>
                                <label>SaS Key (Edge symmetric_Key)</label>
                                <input autoComplete="off" className='form-control form-control-sm' type='text' name='sasKey' onChange={updateField} value={state.sasKey || ''} />
                            </div>
                            <div className='form-group'>
                                <label>{RESX.modal.add.option1.label.root}</label>
                                <div><Toggle name='masterKey' checked={state.isMasterKey} defaultChecked={false} onChange={() => { toggleMasterKey() }} /></div>
                            </div>

                            <div className='form-group'>
                                <label>{RESX.modal.add.option1.label.friendly}</label>
                                <input autoComplete="off" className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={state.mockDeviceName || ''} />
                            </div>

                            <div className='form-group'>
                                <label>Add Modules (do not load manifest to skip module creation)</label><br />
                                <button title={RESX.modal.module.cta1_title} className='btn btn-sm btn-success' onClick={() => loadManifest()}>Load manifest JSON</button>
                            </div>

                            <div ref={edgeRef} className='form-group edge-modules-list'>
                                {state._modules && state._modules.length === 0 ? <span>No modules loaded</span> :
                                    <>
                                        <div>
                                            <label>Module Name</label>
                                            <label>Use Template or clone device/module</label>
                                        </div>
                                        {state._modules.map((element, index) => {
                                            return <div>
                                                <input type='text' className='form-control form-control-sm' value={element.id} />
                                                <Combo items={state._deviceList} cls='custom-textarea-sm' name={'module' + element.id} onChange={(e) => setModuleTemplate(e.target.value, index)} value={element.templateId || ''} />
                                            </div>
                                        })}
                                    </>
                                }
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button disabled={state.mockDeviceName === '' || state.deviceId === ''} title={RESX.modal.add.option4.cta_title} className='btn btn-primary' onClick={() => clickAddDevice('edge')}>{RESX.modal.add.option4.cta_label}</button>
                        </div>
                    </>}

                    {panel !== 7 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <label>{RESX.modal.add.option2.label.catalog_sample}</label>
                            <div className='form-group'>{RESX.modal.add.option1.label.quick} <span className='quick-url'>{RESX.modal.add.option1.label.quick_url}</span></div>
                            <div className='form-group'>
                                <div className='form-group'>
                                    <label>Plugin</label><br />
                                    <Combo items={state._plugIns} cls='custom-textarea-sm' name='plugIn' onChange={updateField} value={state.plugIn || ''} />
                                </div>
                                <div className='form-group'>
                                    <label>{RESX.modal.add.option1.label.dps}</label>
                                    <input autoComplete="off" autoFocus={true} className='form-control form-control-sm' type='text' name='scopeId' onChange={updateField} value={state.scopeId || ''} />
                                </div>
                                <div className='form-group'>
                                    <label>{RESX.modal.add.option1.label.deviceQuick}</label><br />
                                    <input autoComplete="off" id="device-id" className='form-control form-control-sm' type='text' name='deviceId' onChange={updateField} value={state.deviceId || ''} placeholder={RESX.modal.add.option1.label.deviceQuick_placeholder} />
                                </div>
                                <div className='form-group'>
                                    <label>{RESX.modal.add.option1.label.sas}</label>
                                    <input autoComplete="off" className='form-control form-control-sm' type='text' name='sasKey' onChange={updateField} value={state.sasKey || ''} />
                                </div>
                                <div className='form-group'>
                                    <label>{RESX.modal.add.option1.label.root}</label>
                                    <div><Toggle name='masterKey' checked={state.isMasterKey} defaultChecked={false} onChange={() => { toggleMasterKey() }} /></div>
                                </div>
                            </div>
                        </div>

                        <div className='m-tabbed-panel-footer'>
                            <button title={RESX.modal.add.option1.cta_title} className='btn btn-primary' disabled={!state.isMasterKey && state.deviceId === ''} onClick={() => clickAddDevice('quick')}>{RESX.modal.add.option1.cta_label}</button>
                        </div>
                    </>}

                    {panel !== 8 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>{RESX.modal.add.option8.title}</label>
                                <div>
                                    <button className='btn btn-success' onClick={() => loadFromQRCode()}>{RESX.modal.add.option3.label.browse}</button>
                                </div>
                            </div>
                            <div className='form-group'>
                                <label>{RESX.modal.plugin}</label><br />
                                <Combo items={state._plugIns} cls='custom-textarea-sm' name='plugIn' onChange={updateField} value={state.plugIn || ''} />
                            </div>
                            <div className='form-group'>
                                <label>{RESX.modal.add.option8.label.display_name}</label><br />
                                {state.mockDeviceName || RESX.modal.add.option8.cta_text}
                            </div>
                            <div className='form-group'>
                                <label>{RESX.modal.add.option8.label.scope_id}</label><br />
                                {state.scopeId || RESX.modal.add.option8.cta_text}
                            </div>
                            <div className='form-group'>
                                <label>{RESX.modal.add.option8.label.device_id}</label><br />
                                {state.deviceId || RESX.modal.add.option8.cta_text}
                            </div>
                            <div className='form-group'>
                                <label>{RESX.modal.add.option8.label.sas_key}</label><br />
                                {state.sasKey || RESX.modal.add.option8.cta_text}
                            </div>
                            <div className='form-group'>
                                <label>{RESX.modal.add.option8.label.template_id}</label><br />
                                {state.capabilityUrn || RESX.modal.add.option8.cta_text}
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button title={RESX.modal.add.option1.cta_title} className='btn btn-primary' disabled={state.scopeId === '' || state.deviceId === '' || state.sasKey === ''} onClick={() => clickAddDevice('dps')}>{RESX.modal.add.option1.cta_label}</button>
                        </div>
                    </>}
                </div>
            </div >
        </div>
    </div >
}