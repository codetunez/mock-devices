var classNames = require('classnames');
const cx = classNames.bind(require('./simulation.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import axios from 'axios';
import * as React from 'react';
import { RESX } from '../strings';
import { Json } from '../ui/controls';

export const Simulation: React.FunctionComponent<any> = ({ handler }) => {
    const [updatePayload, setPayload] = React.useState({ simulation: {} });
    const [json, setJson] = React.useState({ simulation: {} });
    const [error, setError] = React.useState<any>('');

    React.useEffect(() => {
        axios.get('/api/simulation')
            .then((response: any) => {
                setPayload(response.data);
            })
            .catch((err) => {
                setError(RESX.modal.simulation.error_load);
            });
    }, []);

    const updateField = (text: any) => {
        setJson(text);
        setError('');
    }

    const reset = () => {
        if (error != '') { return; }
        axios.post('/api/simulation', { simulation: json })
            .then(res => {
                handler(false);
            })
            .catch((err) => {
                setError(RESX.modal.simulation.error_save);
            })
    }

    return <div className='simulation'>
        <div className='simulation-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='simulation-content'>
            <h2>{RESX.modal.simulation.title}</h2>
            <p>{RESX.modal.simulation.text1}</p>
            <label>{RESX.modal.simulation.configuration_label}</label>
            <div className="editor">
                <Json json={updatePayload} cb={(text: any) => { updateField(text) }} err={() => setError(RESX.modal.error_json)} />
            </div>
        </div>
        <div className='simulation-footer'>
            <button title={RESX.modal.simulation.reset_title} onClick={() => reset()} className="btn btn-success">{RESX.modal.simulation.reset_label}</button>
            <div><span className='error'>{error}</span></div>
        </div>
    </div>
}