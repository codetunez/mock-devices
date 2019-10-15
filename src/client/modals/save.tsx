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
                    state: JSON.stringify(response.data, null, 1)
                })
            })
    }, []);

    const updateCurrentState = () => {
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

    const loadFromDisk = () => {
        axios.get('/api/openDialog')
            .then(response => {
                setPayload({
                    ...updatePayload,
                    state: JSON.stringify(response.data, null, 1)
                })
            })
    }

    const saveToDisk = () => {
        axios.post('/api/saveDialog', updatePayload.state, { headers: { 'Content-Type': 'application/json' } })
    }

    return <div className='m-modal'>
        <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='m-content'>
            <div className='save-device'>
                <div className='m-tabbed-nav'>
                    <label>Manage State</label>
                    <button onClick={() => setPanel(0)} className={cx('btn btn-outline-primary', panel === 0 ? 'active' : '')}>Copy/Paste state</button><br />
                    <label>File System</label>
                    <button onClick={() => loadFromDisk()} className={cx('btn btn-outline-primary')}>Load a state</button><br />
                    <button onClick={() => saveToDisk()} className={cx('btn btn-outline-primary')}>Save current state</button><br />
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
                            <button className='btn btn-info' onClick={() => updateCurrentState()}>Update current State</button>
                        </div>
                    </>}

                </div>
            </div>
        </div>
    </div>
}