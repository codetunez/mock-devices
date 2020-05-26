var classNames = require('classnames');
const cx = classNames.bind(require('./deviceFields.scss'));
import "react-toggle/style.css"

import * as React from 'react';
import Toggle from 'react-toggle';
import { DeviceContext } from '../context/deviceContext';

export const DeviceFieldMethod: React.FunctionComponent<any> = ({ capability, expand, pnp, template }) => {

    const [expanded, setExpanded] = React.useState(expand);
    const [updatePayload, setPayload] = React.useState(capability);
    const [dirty, setDirty] = React.useState(false);
    const deviceContext: any = React.useContext(DeviceContext);

    React.useEffect(() => {
        setPayload(capability);
        setExpanded(expand);
    }, [capability, expand]);

    const updateField = (e: any) => {
        let node = {}
        switch (e.target.name) {
            case 'string':
                node = { string: (e.target.value === 'true' ? true : false) }
                break;
            case 'interface.name':
                node = {
                    'interface': {
                        'name': e.target.value,
                        'urn': updatePayload.interface.urn
                    }
                }
                break;
            case 'interface.urn':
                node = {
                    'interface': {
                        'name': updatePayload.interface.name,
                        'urn': e.target.value
                    }
                }
                break;
            default:
                node = { [e.target.name]: e.target.value }
                break
        }
        setPayload({
            ...updatePayload,
            ...node
        });
        setDirty(true);
    }

    const toggleSendTwin = () => {
        setPayload({
            ...updatePayload,
            asProperty: !updatePayload.asProperty
        });
        setDirty(true);
    }

    const toggleExecution = (e: any) => {
        setPayload({
            ...updatePayload,
            execution: e.target.checked ? 'cloud' : 'direct'
        });
        setDirty(true);
    }

    const save = (send: boolean) => {
        deviceContext.updateDeviceMethod(updatePayload, send);
        setDirty(false);
    }

    const request = () => {
        return deviceContext.requests[capability._id] && deviceContext.requests[capability._id].payload;
    }

    const requestDate = () => {
        return deviceContext.requests[capability._id] && deviceContext.requests[capability._id].date;
    }

    return <div className={cx('device-field-card', expanded ? '' : 'device-field-card-small')} style={capability.color ? { backgroundColor: capability.color } : {}}>

                <div className='df-card-header'>
                    <div className='df-card-title'>
                        <div className='df-card-title-chveron' onClick={() => setExpanded(!expanded)}><i className={cx(expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i></div>
                        <div className='df-card-title-text'>
                            <div>Method (Command)</div>
                            <div>{capability.name}</div>
                        </div>
                    </div>
                    {/* <div className='df-card-value'>
                        <div>Last Called</div>
                        <div>-</div>
                    </div> */}
                    <div className='df-card-cmd btn-bar'>
                        <button className={cx('btn btn-sm', dirty ? 'btn-warning' : 'btn-outline-warning')} onClick={() => { save(false) }}><span className='far fa-save'></span></button>
                        <button className='btn btn-sm btn-outline-danger' onClick={() => { deviceContext.deleteCapability(capability._id, capability._type === 'method' ? 'method' : 'property') }}><span className='fa fa-times'></span></button>
                    </div>
                </div>

                <div className='df-card-row'>
                    <div><label>Enabled</label><div><Toggle name={capability._id + '-enabled'} disabled={true} defaultChecked={true} checked={true} onChange={() => { }} /></div></div>
                    <div><label>Method Name</label><div><input type='text' className='form-control form-control-sm full-width' name='name' value={updatePayload.name} onChange={updateField} /></div></div>
                </div>

                <div className='df-card-row'>
                    <div><label>Execution</label><div></div></div>
                    <div><label>Make C2D Command (off is Direct Method)</label><div><Toggle name={capability._id + '-execution'} defaultChecked={false} checked={updatePayload.execution === 'cloud' ? true : false} onChange={(e) => { toggleExecution(e) }} /></div></div>
                </div>

                {pnp ?
                    <>
                        <div className='df-card-row'>
                            <div>Interface</div>
                            <div><label>Name</label><div><input type='text' className='form-control form-control-sm full-width' name='interface.name' value={updatePayload.interface.name || 'Not supported'} onChange={updateField} /></div></div>

                        </div>
                        <div className='df-card-row'>
                            <div></div>
                            <div><label>URN</label><div><input type='text' className='form-control form-control-sm full-width' name='interface.urn' value={updatePayload.interface.urn || 'Not supported'} onChange={updateField} /></div></div>
                        </div>
                    </>
                    : null}

                <div className='df-card-row'>
                    <div><label>Parameters</label><div>
                        {!template ? <button className='btn btn-sm btn-outline-success' onClick={() => { deviceContext.getCapabilityMethodRequest(capability._id) }}><span className='fa fa-read'></span>Read</button> : null}
                    </div></div>
                    <div><label>Request - {requestDate() || 'Not Called'}</label><div><textarea className='form-control form-control-sm custom-textarea full-width' rows={3} readOnly={true} value={request()}></textarea></div></div>
                </div>

                <div className='df-card-row'>
                    <div>Response</div>
                    <div><label>Status</label><div><input type='number' max={3} className='form-control form-control-sm full-width' name='status' value={updatePayload.status} onChange={updateField} /></div></div>
                </div>

                <div className='df-card-row'>
                    <div></div>
                    <div><label>Response JSON</label><div><textarea className='form-control form-control-sm custom-textarea full-width' rows={6} name='payload' onChange={updateField} >{capability.payload || ''}</textarea></div></div>
                </div>

                <div className='df-card-row'>
                    <div></div>
                    <div><label>Send response as Twin reported using same name</label><div><Toggle name={capability._id + '-sendtwin'} defaultChecked={false} checked={updatePayload.asProperty} onChange={() => { toggleSendTwin() }} /></div></div>
                </div>

            </div>
}