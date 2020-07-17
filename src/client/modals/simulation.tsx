var classNames = require('classnames');
const cx = classNames.bind(require('./simulation.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import axios from 'axios';
import * as React from 'react';
import { RESX } from '../strings';

export const Simulation: React.FunctionComponent<any> = ({ handler }) => {
    const [updatePayload, setPayload] = React.useState({
        simulation: ''
    })

    React.useEffect(() => {
        axios.get('/api/simulation').then((response: any) => {
            setPayload({
                ...updatePayload,
                "simulation": JSON.stringify(response.data, null, 1)
            })
        });
    }, []);


    const updateField = (e: any) => {
        setPayload({
            ...updatePayload,
            [e.target.name]: e.target.value
        });
    }

    const reset = () => {
        axios.post('/api/simulation', updatePayload).then(res => {
            handler(false);
        })
    }

    return <div className='simulation'>
        <div className='simulation-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='simulation-content'>
            <h2>{RESX.modal.simulation.title}</h2>
            <p>{RESX.modal.simulation.text1}</p>
            <div><label>{RESX.modal.simulation.configuration_label}</label>
                <textarea className='form-control form-control-sm custom-textarea full-width' rows={16} name='simulation' onChange={updateField} value={updatePayload.simulation || ''}></textarea>
            </div>
            <br />
            <div>
                <button title={RESX.modal.simulation.reset_title} onClick={() => reset()} className="btn btn-success">{RESX.modal.simulation.reset_label}</button>
            </div>
        </div>
    </div>
}