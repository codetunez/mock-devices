var classNames = require('classnames');
const cx = classNames.bind(require('./edit.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';

export const Edit: React.FunctionComponent<any> = ({ handler }) => {

    const deviceContext: any = React.useContext(DeviceContext);
    const [updatePayload, setPayload] = React.useState<any>(JSON.stringify(deviceContext.device.configuration, null, 2) || '')

    const updateDeviceConfiguration = () => {
        deviceContext.updateDeviceConfiguration(JSON.parse(updatePayload));
        handler();
    }

    const updateField = e => {
        setPayload(e.target.value);
    }

    const json = () => {
        return JSON.stringify(updatePayload || {}, null, 2);
    }

    return <div className='m-modal'>
        <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='m-content'>
            <div className='edit-device'>
                <div className='form-group'>
                    <h2>{RESX.modal.edit.title}</h2>
                    <label></label>
                    <textarea className='custom-textarea form-control form-control-sm' name='configuration' rows={20} onChange={updateField} value={updatePayload}></textarea>
                </div>
                <button title={RESX.modal.edit.update_title} className='btn btn-info' onClick={() => updateDeviceConfiguration()}>{RESX.modal.edit.update_label}</button>
            </div>
        </div>
    </div>
}

// .order {
//     display: flex;
//     align-items: center;

//     div:first-child {
//       padding-right: $sm-gutter;
//       white-space: nowrap;
//     }

//     div:last-child {
//       width: 80px;
//     }
//   }


// const [order, setOrder] = React.useState(index + 1);

// const deviceIndexes = () => {
//     const items = [];
//     for (let i = 0; i < devices.length; i++) {
//         items.push({ name: i + 1, value: i + 1 })
//     }
//     return items
// }

// React.useEffect(() => {
//     setOrder(index + 1);
// }, [index])

// const updateField = e => {
//     const value = e.target.value;
//     axios.post('/api/state/reorder', { devices: devices, current: order - 1, next: parseInt(e.target.value) - 1 })
//         .then((res) => {
//             deviceContext.setDevices(res.data);
//             setOrder(value); // dangerous if BE doesn't succeeed
//         })
// }
