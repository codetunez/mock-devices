var classNames = require('classnames');
const cx = classNames.bind(require('./ux.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import * as React from 'react';
import { Combo } from '../ui/controls';
import { getEndpoint, GlobalContext } from '../context/globalContext';
import { RESX } from '../strings';

export const Ux: React.FunctionComponent<any> = ({ handler, index }) => {

    const globalContext: any = React.useContext(GlobalContext);
    const [state, setPayload] = React.useState({ serverEndpoint: getEndpoint(), serverMode: '' });

    const updateField = (e: any) => {
        setPayload({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    const combo = [{ name: '--Select to change', value: null },{ name: 'ux', value: 'ux' }, { name: 'server', value: 'server' }, { name: 'mixed', value: 'mixed' },]

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
                    <button title={RESX.modal.ux.cta_title} className='btn btn-info' onClick={() => globalContext.setEndpoint(state)}>{RESX.modal.ux.cta_label}</button>
                    <button title={RESX.modal.ux.cta2_title} className='btn btn-outline-info' onClick={() => globalContext.resetEndpoint(state)}>{RESX.modal.ux.cta2_label}</button>
                </div>
            </div>
        </div>
    </div>
}