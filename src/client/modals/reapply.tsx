var classNames = require('classnames');
const cx = classNames.bind(require('./reapply.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';

export const Reapply: React.FunctionComponent<any> = ({ handler }) => {

    const deviceContext: any = React.useContext(DeviceContext);
    const [all, setAll] = React.useState(false);

    const apply = () => {
        const selectedList = [];
        if (!all) {
            const list: any = document.getElementById('devices');
            for (const item of list) { if (item.selected) { selectedList.push(item.value) } }
        }
        deviceContext.reapplyTemplate({ templateId: deviceContext.device._id, devices: selectedList, all: all })
        handler();
    }

    const indexes = deviceContext.devices.map((ele) => {
        if (ele.configuration._kind === 'dps' || ele.configuration._kind === 'hub' || ele.configuration._kind === 'module') {
            return { name: ele.configuration.mockDeviceName, value: ele.configuration.deviceId }
        }
    });

    return <div className='dialog-reapply'>
        <div className='m-modal'>
            <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
            <div className='m-content'>
                <div className='form-group'>
                    <h4>{RESX.modal.reapply.title1}</h4>
                    <span>{RESX.modal.reapply.title2}</span>
                    <br /><br />
                    <span><input type='checkbox' name='all' checked={all} onClick={() => setAll(!all)} /> {RESX.modal.reapply.selectAll}</span>
                    <select id='devices' disabled={all} multiple={true} size={16}>
                        {indexes && indexes.map((ele) => {
                            if (ele) { return <option value={ele.value}>{ele.name}</option> }
                        })}
                    </select>                    
                </div>
                <div className='m-footer'>
                    <div className='form-group btn-bar'>
                        <button title={RESX.modal.reapply.apply_title} className='btn btn-primary' onClick={() => apply()}>{RESX.modal.reapply.apply_label}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}