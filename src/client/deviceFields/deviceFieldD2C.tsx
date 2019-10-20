var classNames = require('classnames');
const cx = classNames.bind(require('./deviceFields.scss'));

import axios from 'axios';
import * as React from 'react';
import { Toggle, ReactToggleThemeProvider } from 'react-toggle-component';
import { toggleStyles } from '../ui/codeStyles';
import { DeviceContext } from '../context/deviceContext';
import { Combo } from '../ui/controls';

export const DeviceFieldD2C: React.FunctionComponent<any> = ({ capability, sensors }) => {

    const [expanded, setExpanded] = React.useState(capability.enabled);
    const [updatePayload, setPayload] = React.useState(capability);
    const [dirty, setDirty] = React.useState(false);
    const deviceContext: any = React.useContext(DeviceContext);

    React.useEffect(() => {
        setPayload(capability);
    }, [capability]);

    const updateField = (e: any) => {
        let node = {}

        switch (e.target.name) {
            case 'string':
                node = { string: (e.target.value === 'true' ? true : false) }
                break;
            case 'propertyObject.template':
                node = {
                    'propertyObject': {
                        'type': 'templated',
                        'template': e.target.value
                    }
                }
                break;
            case 'runloop.unit':
                node = {
                    'runloop': {
                        'include': updatePayload.runloop.include,
                        'unit': e.target.value,
                        'value': updatePayload.runloop.value
                    }
                }
                break;
            case 'runloop.value':
                node = {
                    'runloop': {
                        'include': updatePayload.runloop.include,
                        'unit': updatePayload.runloop.unit,
                        'value': e.target.value
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

    const updateMockField = (e: any) => {
        updatePayload.mock[e.target.name] = e.target.value;
        setPayload({
            ...updatePayload
        });
        setDirty(true);
    }

    const toggleEnabled = () => {
        setExpanded(!updatePayload.enabled);
        setPayload({
            ...updatePayload,
            enabled: !updatePayload.enabled
        });
        setDirty(true);
    }

    const toggleRunloop = () => {
        setPayload({
            ...updatePayload,
            runloop: {
                include: !updatePayload.runloop.include,
                unit: updatePayload.runloop.unit,
                value: updatePayload.runloop.value
            }
        });
        setDirty(true);
    }

    const toggleMockDevice = () => {
        setPayload({
            ...updatePayload,
            type: {
                mock: !updatePayload.type.mock,
                direction: updatePayload.type.direction
            }
        });
        setDirty(true);
    }

    const toggleComplex = () => {
        setPayload({
            ...updatePayload,
            propertyObject: {
                type: updatePayload.propertyObject.type === 'templated' ? 'default' : 'templated',
                templated: updatePayload.propertyObject.template
            }
        })
        setDirty(true);
    }

    const clickSensor = (sensor: any) => {
        axios.get('/api/sensors/' + sensor._type)
            .then((response: any) => {
                updatePayload.type.mock = true;
                setPayload({
                    ...updatePayload,
                    type: {
                        mock: true,
                        direction: updatePayload.type.direction
                    },
                    mock: response.data
                })
                setDirty(true);
            })
    }

    const save = (send: boolean) => {
        if (updatePayload.type.mock && (!updatePayload.mock || updatePayload.mock === undefined)) {
            alert('You must select a Sensor to update this property (or disable Auto Value)');
            return;
        }

        deviceContext.updateDevice(updatePayload, send);
        setDirty(false);
    }

    const title = () => {
        return <>Reported {updatePayload.runloop.include ? ' every ' + updatePayload.runloop.value + ' ' + updatePayload.runloop.unit : ''} {updatePayload.mock && updatePayload.type.mock ? ' (mock ' + updatePayload.mock._type + ')' : ''}</>
    }

    let fields = [];
    if (updatePayload.mock) {
        let keyCounter = 0;
        for (var field in updatePayload.mock) {
            if (field[0] != '_') {
                fields.push(<div key={keyCounter}>
                    <label title={field}>{updatePayload.mock._resx[field]}</label>
                    <input type='text' className='form-control form-control-sm' onChange={updateMockField} name={field} value={updatePayload.mock[field]} />
                </div>)
                keyCounter++;
            }
        }
    }

    return <DeviceContext.Consumer>
        {(sharedState: any) => (
            <div className={cx('device-field-card', expanded ? '' : 'device-field-card-small')} style={capability.color ? { backgroundColor: capability.color } : {}}>

                <div className='df-card-header'>
                    <div className='df-card-title'>
                        <div className='df-card-title-chveron' onClick={() => setExpanded(!expanded)}><i className={cx(expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i></div>
                        <div className='df-card-title-text'>
                            <div>{title()}</div>
                            <div>{updatePayload.name}</div>
                        </div>
                    </div>
                    <div className='df-card-value'>
                        <div>Last Sent</div>
                        <div>-</div>
                    </div>
                    <div className='df-card-cmd btn-bar'>
                        <button className={cx('btn btn-sm', dirty ? 'btn-warning' : 'btn-outline-warning')} onClick={() => { save(false) }}><span className='far fa-save'></span></button>
                        <button className='btn btn-sm btn-outline-danger' onClick={() => { sharedState.deleteCapability(capability._id, capability._type === 'method' ? 'method' : 'property') }}><span className='fa fa-times'></span></button>
                    </div>
                </div>

                <div className='df-card-row'>
                    <div><label>Enabled</label><div><ReactToggleThemeProvider theme={toggleStyles}><Toggle name={capability._id + '-enabled'} controlled={true} checked={updatePayload.enabled} onToggle={() => { toggleEnabled() }} /></ReactToggleThemeProvider></div></div>
                    <div><label>Name</label><div><input type='text' className='form-control form-control-sm single-width' name='name' value={updatePayload.name} onChange={updateField} /></div></div>                    
                    <div><label>String</label><div><Combo items={[{ name: 'Yes', value: true }, { name: 'No', value: false }]} cls='custom-textarea-sm single-width' name='string' onChange={updateField} value={updatePayload.string} /></div></div>
                    <div><label>Enter Value</label><div><input type='text' className='form-control form-control-sm double-width' name='value' value={updatePayload.value} onChange={updateField} /></div></div>
                    <div className='single-item'><button className='btn btn-sm btn-outline-primary' onClick={() => { save(true) }}>Send</button></div>
                </div>

                <div className='df-card-row'>
                    <div></div>
                    <div><label>API</label><div><Combo items={[{ name: 'Msg', value: 'msg' }, { name: 'Twin', value: 'twin' }]} cls='custom-textarea-sm double-width' name='sdk' onChange={updateField} value={updatePayload.sdk} /></div></div>
                    <div><label>Interface Name</label><div><input type='text' className='form-control form-control-sm double-width' name='interface' value={updatePayload.interface} readOnly={true} /></div></div>
                </div>

                <div className='df-card-row'>
                    <div><label>Looped</label><div><ReactToggleThemeProvider theme={toggleStyles}><Toggle name={capability._id + '-runloop'} controlled={true} checked={updatePayload.runloop.include} onToggle={() => { toggleRunloop() }} /></ReactToggleThemeProvider></div></div>
                    {updatePayload.runloop.include ? <>
                        <div><label>Unit</label><div><Combo items={[{ name: 'Mins', value: 'mins' }, { name: 'Secs', value: 'secs' }]} cls='custom-textarea-sm  double-width' name='runloop.unit' onChange={updateField} value={updatePayload.runloop.unit} /></div></div>
                        <div><label>Duration</label><div><input type='number' className='form-control form-control-sm double-width' name='runloop.value' min={0} value={updatePayload.runloop.value} onChange={updateField} /></div></div>
                    </> : <div style={{ height: '55px' }}></div>}
                </div>

                <div className='df-card-row'>
                    <div><label>Complex</label><div><ReactToggleThemeProvider theme={toggleStyles}><Toggle name={capability._id + '-json'} controlled={true} checked={updatePayload.propertyObject.type === 'templated'} onToggle={() => { toggleComplex() }} /></ReactToggleThemeProvider></div></div>
                    {updatePayload.propertyObject.type === 'templated' ? <>
                        <div>
                            <label>See Help for full list of AUTO macros</label>
                            <textarea className='form-control form-control-sm custom-textarea full-width' rows={7} name='propertyObject.template' onChange={updateField} >{capability.propertyObject.template || ''}</textarea>
                        </div>
                    </> : <div style={{ height: '55px' }}></div>}
                </div>

                <div className='df-card-row'>
                    <div><label>Auto Value</label><div><ReactToggleThemeProvider theme={toggleStyles}><Toggle name={capability._id + '-mock'} controlled={true} checked={updatePayload.type.mock} onToggle={() => { toggleMockDevice() }} /></ReactToggleThemeProvider></div></div>
                    {updatePayload.type.mock ? <>
                        <div><label>Mock Sensor</label><br />
                            <div className='btn-group' role='group' >
                                {sensors.map((sensor: any) => {
                                    let active = updatePayload.mock && sensor._type === updatePayload.mock._type ? 'active' : '';
                                    return <button type='button' className={classNames('btn btn-sm btn-outline-primary', active)} onClick={() => { clickSensor(sensor) }}>{sensor._type}</button>
                                })}
                            </div>
                        </div>
                    </> : <div style={{ height: '55px' }}></div>}
                </div>

                {updatePayload.type.mock ?
                    <div className='df-card-row'>
                        <div></div>
                        {fields}
                    </div>
                    : null}

            </div>
        )}
    </DeviceContext.Consumer>
}