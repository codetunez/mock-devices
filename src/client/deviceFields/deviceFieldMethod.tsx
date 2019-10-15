var classNames = require('classnames');
const cx = classNames.bind(require('./deviceFields.scss'));

import * as React from 'react';
import { Toggle, ReactToggleThemeProvider } from 'react-toggle-component';
import { toggleStyles } from '../ui/codeStyles';
import { DeviceContext } from '../context/deviceContext';

export const DeviceFieldMethod: React.FunctionComponent<any> = ({ capability }) => {

    const [expanded, setExpanded] = React.useState(false);
    const [updatePayload, setPayload] = React.useState(capability);
    const [dirty, setDirty] = React.useState(false);
    const deviceContext: any = React.useContext(DeviceContext);

    React.useEffect(() => {
        setPayload(capability);
    }, [capability]);

    const updateField = (e: any) => {
        setPayload({
            ...updatePayload,
            [e.target.name]: e.target.value
        });
        setDirty(true);
    }

    const save = (send: boolean) => {
        deviceContext.updateDevice(updatePayload, send);
        setDirty(false);
    }

    const request = () => {
        return deviceContext.requests[capability._id] && deviceContext.requests[capability._id].payload;
    }

    const requestDate = () => {
        return deviceContext.requests[capability._id] && deviceContext.requests[capability._id].date;
    }

    return <DeviceContext.Consumer>
        {(sharedState: any) => (
            <div className={cx('device-field-card', expanded ? '' : 'device-field-card-small')}>

                <div className='df-card-header'>
                    <div className='df-card-title'>
                        <div className='df-card-title-chveron' onClick={() => setExpanded(!expanded)}><i className={cx(expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i></div>
                        <div className='df-card-title-text'>
                            <div>Method</div>
                            <div>{capability.name}</div>
                        </div>
                    </div>
                    <div className='df-card-value'>
                        <div>Last Called</div>
                        <div>n/a</div>
                    </div>
                    <div className='df-card-cmd btn-bar'>
                        <button className={cx('btn btn-sm', dirty ? 'btn-warning' : 'btn-outline-warning')} onClick={() => { save(false) }}><span className='far fa-save'></span></button>
                        <button className='btn btn-sm btn-outline-danger' onClick={() => { sharedState.deleteCapability(capability._id, capability._type === 'method' ? 'method' : 'property') }}><span className='fa fa-times'></span></button>
                    </div>
                </div>

                <div className='df-card-row'>
                    <div><label>Enabled</label><div><ReactToggleThemeProvider theme={toggleStyles}><Toggle name={capability._id + '-enabled'} disabled={true} checked={true} /></ReactToggleThemeProvider></div></div>
                    <div><label>Name</label><div><input type='text' className='form-control form-control-sm half-width' name='name' value={updatePayload.name} onChange={updateField} /></div></div>
                    <div><label>Status</label><div><input type='number' max={3} className='form-control form-control-sm half-width' name='status' value={updatePayload.status} onChange={updateField} /></div></div>
                </div>

                <div className='df-card-row'>
                    <div></div>
                    <div><label>Response</label><div><textarea className='form-control form-control-sm custom-textarea full-width' rows={6} name='payload' onChange={updateField} >{capability.payload || ''}</textarea></div></div>
                </div>

                <div className='df-card-row'>
                    <div><label>Action</label><div><button className='btn btn-sm btn-outline-success' onClick={() => { sharedState.getCapabilityMethodRequest(capability._id) }}><span className='fa fa-read'></span>Read</button></div></div>
                    <div><label>Request - {requestDate() || 'Not Called'}</label><div><textarea className='form-control form-control-sm custom-textarea full-width' rows={5} readOnly={true} value={request()}></textarea></div></div>

                </div>

            </div>
        )}
    </DeviceContext.Consumer>
}