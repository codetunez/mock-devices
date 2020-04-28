var classNames = require('classnames');
const cx = classNames.bind(require('./deviceFields.scss'));

import * as React from 'react';
import { Toggle, ReactToggleThemeProvider } from 'react-toggle-component';
import { toggleStyles } from '../ui/codeStyles';
import { DeviceContext } from '../context/deviceContext';
import { Combo } from '../ui/controls';

export const DeviceFieldC2D: React.FunctionComponent<any> = ({ capability, expand }) => {

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
        deviceContext.updateDevice(updatePayload, send);
        setDirty(false);
    }

    const read = (id: string) => {
        deviceContext.getCapability(id);
        setDirty(false);
    }


    return <DeviceContext.Consumer>
        {(sharedState: any) => (
            <div className={cx('device-field-card', expanded ? '' : 'device-field-card-small')} style={capability.color ? { backgroundColor: capability.color } : {}}>

                <div className='df-card-header'>
                    <div className='df-card-title'>
                        <div className='df-card-title-chveron' onClick={() => setExpanded(!expanded)}><i className={cx(expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i></div>
                        <div className='df-card-title-text'>
                            <div>Desired</div>
                            <div>{capability.name}</div>
                        </div>
                    </div>
                    <div className='df-card-value'>
                        <div>Last Read</div>
                        <div>-</div>
                    </div>
                    <div className='df-card-cmd btn-bar'>
                        <button className={cx('btn btn-sm', dirty ? 'btn-warning' : 'btn-outline-warning')} onClick={() => { save(false) }}><span className='far fa-save'></span></button>
                        <button className='btn btn-sm btn-outline-danger' onClick={() => { sharedState.deleteCapability(capability._id, capability._type === 'method' ? 'method' : 'property') }}><span className='fa fa-times'></span></button>
                    </div>
                </div>
                <div className='df-card-row'>
                    <div><label>Enabled</label><div><ReactToggleThemeProvider theme={toggleStyles}><Toggle name={capability._id + '-enabled'} disabled={true} checked={true} /></ReactToggleThemeProvider></div></div>
                    <div><label>Name</label><div><input type='text' className='form-control form-control-sm double-width' name='name' value={updatePayload.name} onChange={updateField} /></div></div>
                    <div><label>API</label><div><Combo items={[{ name: 'Twin', value: 'twin' }]} cls='custom-textarea-sm single-width' name='sdk' onChange={updateField} value={updatePayload.sdk} /></div></div>
                    <div><label>Version</label><div><input type='text' className='form-control form-control-sm single-width' value={updatePayload.version} /></div></div>
                    <div className='single-item'><button className='btn btn-sm btn-outline-primary' onClick={() => { read(capability._id) }}>Read</button></div>
                </div>
                <div className='df-card-row'>
                    <div></div>
                    <div><label>Value</label><div>
                        <textarea className='form-control form-control-sm custom-textarea full-width' rows={18} value={updatePayload.value || ''}>{updatePayload.value || ''}</textarea>
                    </div>
                    </div>
                </div>
            </div>
        )}
    </DeviceContext.Consumer>
}