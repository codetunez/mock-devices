var classNames = require('classnames');
const cx = classNames.bind(require('./ux.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import * as React from 'react';
import { Combo } from '../ui/controls';
import { RESX } from '../strings';
import { Endpoint } from '../context/endpoint';
import { DeviceContext } from '../context/deviceContext';

export const Ux: React.FunctionComponent<any> = ({ handler, index }) => {

    const deviceContext: any = React.useContext(DeviceContext);
    const [state, setPayload] = React.useState({ serverEndpoint: Endpoint.getEndpoint(), serverMode: '' });

    const updateField = (e: any) => {
        setPayload({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    const save = (state?) => {
        if (state) { Endpoint.setEndpoint(state) } else { Endpoint.resetEndpoint() };
        handler(false);
    }

    const combo = [{ name: '--Select to change', value: null }, { name: 'ux', value: 'ux' }, { name: 'server', value: 'server' }, { name: 'mixed', value: 'mixed' },]

    return <div className='m-modal'>
        <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='m-content'>
            <div className='module'>
                <h5>{RESX.modal.ux.title}</h5>
                <div className='form-group'>
                    <label>{RESX.modal.ux.label.server}</label><br />
                    <input id="serverEndpoint" className='form-control form-control-sm' type='text' name='serverEndpoint' onChange={updateField} value={state.serverEndpoint || ''} />
                </div>
                <div className='form-group'>
                    <label>{RESX.modal.ux.label.mode}</label><br />
                    <Combo items={combo} cls='custom-textarea-sm' name='serverMode' onChange={updateField} value={state.serverMode || ''} />
                </div>
                <div className='form-group'>
                    <span className='text-warning'>{RESX.modal.ux.warning}</span>
                </div>
            </div>
            <div className='m-footer module-footer'>
                <div className='form-group btn-bar'>
                    <button title={RESX.modal.ux.cta_title} className='btn btn-info' onClick={() => save(state)}>{RESX.modal.ux.cta_label}</button>
                    <button title={RESX.modal.ux.cta2_title} className='btn btn-outline-info' onClick={() => save()}>{RESX.modal.ux.cta2_label}</button>
                </div>
            </div>
        </div>
    </div>
}