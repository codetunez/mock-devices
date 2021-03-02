var classNames = require('classnames');
const cx = classNames.bind(require('./simulation.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import axios from 'axios';
import * as React from 'react';

import { RESX } from '../strings';
import { Json } from '../ui/controls';
import { Endpoint } from '../context/endpoint';

export const Simulation: React.FunctionComponent<any> = ({ handler }) => {

    const [updatePayload, setPayload] = React.useState({ simulation: {} });
    const [json, setJson] = React.useState({});
    const [error, setError] = React.useState<any>('');

    React.useEffect(() => {
        axios.get(`${Endpoint.getEndpoint()}api/simulation`)
            .then((response: any) => {
                setPayload(response.data);
            })
            .catch((err) => {
                setError(RESX.modal.simulation.error_load);
            });
    }, []);

    const updateField = (obj: any) => {
        setJson(obj);
        setError('');
    }

    const reset = () => {
        if (error != '') { return; }
        axios.post(`${Endpoint.getEndpoint()}api/simulation`, { simulation: json })
            .then((res) => {
                // this is a temp hack to workaround a routing issue
                window.location.href = "/";
                handler(false);
            })
            .catch((err) => {
                setError(RESX.modal.simulation.error_save);
            })
    }

    return <div className='simulation'>
        <div className='simulation-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='simulation-content'>
            <h4>{RESX.modal.simulation.title}</h4>
            <p>{RESX.modal.simulation.text1}</p>
            <div className="editor">
                <Json json={updatePayload} cb={(obj: any) => { updateField(obj) }} err={() => setError(RESX.modal.error_json)} />
            </div>
            <p>{RESX.modal.simulation.text2}</p>
        </div>
        <div className='simulation-footer'>
            <button disabled={Object.keys(json).length === 0} title={RESX.modal.simulation.reset_title} onClick={() => reset()} className="btn btn-success">{RESX.modal.simulation.reset_label}</button>
            <div><span className='error'>{error}</span></div>
        </div>
    </div>
}