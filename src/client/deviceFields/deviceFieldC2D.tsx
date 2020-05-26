var classNames = require('classnames');
const cx = classNames.bind(require('./deviceFields.scss'));
import "react-toggle/style.css"

import * as React from 'react';
import Toggle from 'react-toggle';
import { DeviceContext } from '../context/deviceContext';

export function DeviceFieldC2D({ capability, expand, pnp }) {

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

    const save = (send: boolean) => {
        deviceContext.updateDeviceProperty(updatePayload, send);
        setDirty(false);
    }

    const read = (id: string) => {
        deviceContext.getCapability(id);
        setDirty(false);
    }


    return <div className={cx('device-field-card', expanded ? '' : 'device-field-card-small')} style={capability.color ? { backgroundColor: capability.color } : {}}>

        <div className='df-card-header'>
            <div className='df-card-title'>
                <div className='df-card-title-chveron' onClick={() => setExpanded(!expanded)}><i className={cx(expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i></div>
                <div className='df-card-title-text'>
                    <div>Receive Twin (Desired)</div>
                    <div>{capability.name}</div>
                </div>
            </div>
            {/* <div className='df-card-value'>
                        <div>Last Read</div>
                        <div>-</div>
                    </div> */}
            <div className='df-card-cmd btn-bar'>
                <button className={cx('btn btn-sm', dirty ? 'btn-warning' : 'btn-outline-warning')} onClick={() => { save(false) }}><span className='far fa-save'></span></button>
                <button className='btn btn-sm btn-outline-danger' onClick={() => { deviceContext.deleteCapability(capability._id, capability._type === 'method' ? 'method' : 'property') }}><span className='fa fa-times'></span></button>
            </div>
        </div>

        <div className='df-card-row'>
            <div><label>Enabled</label><div><Toggle name={capability._id + '-enabled'} disabled={true} checked={true} onChange={() => { }} /></div></div>
            <div><label>Property Name</label><div><input type='text' className='form-control form-control-sm full-width' name='name' value={updatePayload.name} onChange={updateField} /></div></div>
            <div className='single-item'><button className='btn btn-sm btn-outline-primary' onClick={() => { read(capability._id) }}>Read</button></div>
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
            <div>Received</div>
            <div><label>Version</label><div><input type='text' className='form-control form-control-sm full-width' value={updatePayload.version} /></div></div>
        </div>
        <div className='df-card-row'>
            <div></div>
            <div><label>Value</label><div><textarea className='form-control form-control-sm custom-textarea full-width' rows={8} value={updatePayload.value || ''}>{updatePayload.value || ''}</textarea></div></div>
        </div>
    </div>
}