var classNames = require('classnames');
const cx = classNames.bind(require('./edit.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';
import { Combo, Json } from '../ui/controls';

export const Edit: React.FunctionComponent<any> = ({ handler, index }) => {

    const deviceContext: any = React.useContext(DeviceContext);
    const [json, setJson] = React.useState({ simulation: {} });
    const [error, setError] = React.useState<any>('');
    const [position, setPosition] = React.useState<any>(index + 1);

    React.useEffect(() => {
        deviceContext.getDevice(deviceContext.device.configuration.deviceId);
    }, [])

    const updateDeviceConfiguration = () => {
        deviceContext.updateDeviceConfiguration(json);
        handler();
    }

    const updateDevicePosition = () => {
        deviceContext.reorderDevicePosition({ current: index, next: position - 1 });
        handler();
    }

    const updateField = (text: any) => {
        setJson(text);
        setError('');
    }

    const updatePosition = (e: any) => {
        setPosition(parseInt(e.target.value));
    }

    const indexes = deviceContext.devices.map((ele, index) => {
        return { name: index + 1, value: index + 1 }
    });

    return <div className='dialog-edit'>
        <div className='m-modal'>
            <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
            <div className='m-content'>
                <div className='form-group'>
                    <h4>{RESX.modal.edit.title1}</h4>
                    <p>{RESX.modal.edit.text1}</p>
                    <div className="editor">
                        <Json json={deviceContext.device.configuration || {}} cb={(text: any) => { updateField(text) }} err={() => setError(RESX.modal.error_json)} />
                    </div>
                    <br />
                    <button title={RESX.modal.edit.update1_title} className='btn btn-primary' onClick={() => updateDeviceConfiguration()}>{RESX.modal.edit.update1_label}</button>
                    <div><span className='error'>{error}</span></div>
                </div>
                <br />
                <div className='form-group'>
                    <label>{RESX.modal.edit.title2}</label>
                    <div>
                        <Combo items={indexes} name='color' onChange={updatePosition} value={position} />
                    </div>
                    <br />
                    <button title={RESX.modal.edit.update2_title} className='btn btn-primary' onClick={() => updateDevicePosition()}>{RESX.modal.edit.update2_label}</button>
                </div>
            </div>
        </div>
    </div>
}