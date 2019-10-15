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
    const [deviceList, setDeviceList] = React.useState([]);
    const [updatePayload, setPayload] = React.useState({
        _kind: '',
        deviceId: '',
        devices: [],
        mockDeviceName: '',
        mockDeviceCount: 1,
        mockDeviceCloneId: '',
        mockDeviceState: '',
        connectionString: '',
        hubConnectionString: '',
        scopeId: '',
        dpsPayload: '',
        sasKey: '',
        isMasterKey: false,
        capabilityModel: ''
    });

    const clickAddDevice = (kind: string) => {
        updatePayload._kind = kind;
        axios.post('/api/device/new', updatePayload).then(res => {
            deviceContext.setDevices(res.data);
            handler(false);
        })
    }

    const toggleMasterKey = () => {
        setPayload({
            ...updatePayload,
            isMasterKey: !updatePayload.isMasterKey
        });
    }

    const updateField = e => {
        let node = e.target.name === 'deviceId' ? { [e.target.name]: e.target.value, 'mockDeviceName': e.target.value } : { [e.target.name]: e.target.value }
        setPayload({
            ...updatePayload,
            ...node
        });
    }

    React.useEffect(() => {
        let list = [];
        axios.get('/api/devices').then((response: any) => {
            list.push({ name: '--Select', value: null });
            response.data.map(function (ele: any) {
                list.push({ name: ele.configuration.mockDeviceName, value: ele._id });
            });
            setDeviceList(list);
        })
    }, []);

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
                </div>

                <div className='m-tabbed-panel'>
                    {panel !== 0 ? null : <>
                        <div className='m-tabbed-panel-form'>

                            <div className='form-group' style={{ display: 'flex', alignContent: 'stretch' }}>
                                <div className='form-group' style={{ paddingRight: '10px' }} >
                                    <label>DPS Scope ID</label>
                                    <input className='form-control form-control-sm' type='text' name='scopeId' onChange={updateField} value={updatePayload.scopeId || ''} />
                                </div>
                                <div className='form-group'>
                                    <label>Device Id</label>
                                    <input className='form-control form-control-sm' type='text' name='deviceId' onChange={updateField} value={updatePayload.deviceId || ''} />
                                </div>
                            </div>

                            <div className='form-group' style={{ display: 'flex', alignContent: 'stretch' }}>
                                <div className='form-group' style={{ paddingRight: '10px' }} >
                                    <label>SaS Key</label>
                                    <input className='form-control form-control-sm' type='text' name='sasKey' onChange={updateField} value={updatePayload.sasKey || ''} />
                                </div>

                                <div className='form-group'>
                                    <label>Is Root key (HMAC-SHA265)</label>
                                    <div><ReactToggleThemeProvider theme={toggleStyles}><Toggle name={'masterKey'} checked={updatePayload.isMasterKey} onToggle={() => { toggleMasterKey() }} /></ReactToggleThemeProvider></div>
                                </div>
                            </div>

                            <div className='form-group'>
                                <label>DPS Payload JSON (Optional)</label>
                                <textarea className='custom-textarea form-control form-control-sm' name='dpsPayload' rows={3} onChange={updateField} value={updatePayload.dpsPayload || ''}></textarea>
                            </div>

                            <div className='form-group'>
                                <h4>Mock Devices configuration</h4>
                                <div className='form-group' style={{ display: 'flex', alignContent: 'stretch' }}>
                                    <div className='form-group' style={{ paddingRight: '10px' }} >
                                        <label>Mock Name</label>
                                        <input className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={updatePayload.mockDeviceName || ''} />
                                    </div>
                                    <div className='form-group' style={{ paddingRight: '10px' }} >
                                        <label>Use Template</label><br />
                                        <Combo items={deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={updateField} value={updatePayload.mockDeviceCloneId || ''} />
                                    </div>
                                    <div className='form-group'>
                                        <label>Number of Devices</label><br />
                                        <input className='form-control form-control-sm' type='number' name='mockDeviceCount' onChange={updateField} value={updatePayload.mockDeviceCount || ''} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' onClick={() => clickAddDevice('dps')}>Add this DPS Device</button>
                        </div>
                    </>}

                    {panel != 1 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>Paste in an IoT Hub Device Connection String</label>
                                <textarea className='custom-textarea form-control form-control-sm' name='connectionString' rows={4} onChange={updateField} value={updatePayload.connectionString || ''}></textarea>
                            </div>
                            <div className='form-group' style={{ display: 'flex', alignContent: 'stretch' }}>
                                <div className='form-group' style={{ paddingRight: '10px' }} >
                                    <label>Mock Device Name</label>
                                    <input className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={updatePayload.mockDeviceName || ''} />
                                </div>
                                <div className='form-group'>
                                    <label>Use Template</label><br />
                                    <Combo items={deviceList} cls='custom-textarea-sm' name='mockDeviceCloneId' onChange={updateField} value={updatePayload.mockDeviceCloneId || ''} />
                                </div>
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' onClick={() => clickAddDevice('hub')}>Add this IoT Hub Device</button>
                        </div>
                    </>}

                    {panel != 2 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>Enter Device Capability Model JSON here (DTDL)</label>
                                <textarea className='custom-textarea form-control form-control-sm' name='capabilityModel' rows={18} onChange={updateField} value={updatePayload.capabilityModel || ''}></textarea>
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' onClick={() => clickAddDevice('template')}>Create Template</button>
                        </div>
                    </>}

                    {panel != 3 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>New Template Name</label>
                                <input className='form-control form-control-sm' type='text' name='mockDeviceName' onChange={updateField} value={updatePayload.mockDeviceName || ''} />
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' onClick={() => clickAddDevice('template')}>Create Template</button>
                        </div>
                    </>}

                </div>
            </div>
        </div>
    </div >
}