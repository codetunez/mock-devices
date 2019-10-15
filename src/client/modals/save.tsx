var classNames = require('classnames');
const cx = classNames.bind(require('./save.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import * as React from 'react';
import axios from 'axios';

export const Save: React.FunctionComponent<any> = ({ handler }) => {

    const [panel, setPanel] = React.useState(0);
    const [updatePayload, setPayload] = React.useState({
        state: ''
    });

    React.useEffect(() => {
        axios.get('/api/state')
            .then((response: any) => {
                setPayload({
                    ...updatePayload,
                    state: JSON.stringify(response.data, null, 2)
                })
            })
    }, []);

    const clickSaveState = () => {
        axios.post('/api/state/', JSON.parse(updatePayload.state))
            .then(response => {
                // force a reload of the application
                window.location.reload(false);
            })
    }

    const updateField = e => {
        setPayload({
            ...updatePayload,
            [e.target.name]: e.target.value
        });
    }

    return <div className='m-modal'>
        <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='m-content'>
            <div className='save-device'>
                <div className='m-tabbed-nav'>
                    <label>Manage State</label>
                    <button onClick={() => setPanel(0)} className={cx('btn btn-outline-primary', panel === 0 ? 'active' : '')}>Copy/Paste State</button><br />
                    <label>Local Storage</label>
                    <button onClick={() => setPanel(1)} className={cx('btn btn-outline-primary', panel === 1 ? 'active' : '')}>Load a State</button><br />
                    <button onClick={() => setPanel(2)} className={cx('btn btn-outline-primary', panel === 2 ? 'active' : '')}>Save Current State</button><br />
                </div>

                <div className='m-tabbed-panel'>
                    {panel != 0 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>Copy/Paste the State's JSON</label>
                                <textarea className='custom-textarea form-control form-control-sm' name='state' rows={19} onChange={updateField} value={updatePayload.state || ''}></textarea>
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' onClick={() => clickSaveState()}>Update current State</button>
                        </div>
                    </>}

                    {panel !== 1 ? null : <>
                        <div className='m-tabbed-panel-form'></div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-success' onClick={() => { alert('not implemented') }}>Load</button>
                        </div>
                    </>}
                    
                    {panel !== 2 ? null : <>
                        <div className='m-tabbed-panel-form'>
                            <div className='form-group'>
                                <label>State Save Name</label>
                                <input className='form-control form-control-sm' type='text' name='stateName' />
                            </div>
                        </div>
                        <div className='m-tabbed-panel-footer'>
                            <button className='btn btn-info' onClick={() => { alert('not implemented') }}>Save</button>
                        </div>
                    </>}

                </div>
            </div>
        </div>
    </div>
}