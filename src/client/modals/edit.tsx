var classNames = require('classnames');
const cx = classNames.bind(require('./edit.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import * as React from 'react';
import axios from 'axios';
import { DeviceContext } from '../context/deviceContext';

export const Edit: React.FunctionComponent<any> = ({ handler }) => {
    const deviceContext: any = React.useContext(DeviceContext);
    const [updatePayload, setPayload] = React.useState<any>({
        configuration: ''
    });

    React.useEffect(() => {
        axios.get('/api/device/' + deviceContext.device.configuration.deviceId)
            .then((response: any) => {
                setPayload({
                    ...updatePayload,
                    configuration: JSON.stringify(response.data.configuration, null, 1)
                })
            })
    }, []);

    const updateDeviceConfiguration = () => {
        axios.put('/api/device/' + deviceContext.device.configuration.deviceId, JSON.parse(updatePayload.configuration))
            .then((response: any) => {
                deviceContext.refreshAllDevices();
                handler();
            })
    }

    const updateField = e => {
        setPayload({
            ...updatePayload,
            [e.target.name]: e.target.value
        });
    }

    return <div className='m-modal'>
        <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='m-content'>
            <div className='edit-device'>
                <div className='form-group'>
                    <label>Update this device's connection details</label>
                    <textarea className='custom-textarea form-control form-control-sm' name='configuration' rows={19} onChange={updateField} value={updatePayload.configuration || ''}></textarea>
                </div>
                <button className='btn btn-info' onClick={() => updateDeviceConfiguration()}>Update</button>
            </div>
        </div>
    </div>
}