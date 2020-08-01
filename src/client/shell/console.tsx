var classNames = require('classnames');
const cx = classNames.bind(require('./console.scss'));
import { Endpoint } from '../context/endpoint';

import * as React from 'react';

import { Modal } from '../modals/modal';
import { ConsoleInspector } from '../modals/consoleInspector';
import { RESX } from '../strings';

interface State {
    dialog: any;
    data: any;
}

interface Action {
    type: string;
    payload: any;
}

const reducer = (state: State, action: Action) => {

    const item = action.type.split('-')[1]
    const newData = Object.assign({}, state.data);

    switch (action.type) {
        case 'lines-add':
            // reverse the incoming list and unshift the array with new messages      
            const newList = action.payload.data.split('\n').reverse().concat(newData.lines);
            const trim = newData.lines.length - 2000;
            for (let i = 0; i < trim; i++) { newData.lines.pop(); };
            return { ...state, data: { lines: newList } };
        case 'lines-clear':
            return { ...state, data: { lines: [] } };
        case 'dialog-show':
            // create a small window of events to scroll between
            const i = action.payload.index;
            const start = newData.lines.slice(i - 50, i);
            const newIndex = start.slice(0).length;
            const end = newData.lines.slice(i, i + 50);
            return { ...state, dialog: { showDialog: true, dialogIndex: newIndex, dialogLines: start.concat(end) } };
        case 'dialog-close':
            return { ...state, dialog: { showDialog: false, dialogIndex: -1, dialogLines: [] } };
        default:
            return state;
    }
}

export const Console: React.FunctionComponent = () => {

    const [state, dispatch] = React.useReducer(reducer, { data: { lines: [], dialogIndex: -1, dialogLines: [] }, dialog: { showDialog: false } });
    const [paused, setPause] = React.useState(false);

    let eventSource = null;

    React.useEffect(() => {
        eventSource = new EventSource(`${Endpoint.getEndpoint()}api/events/message`)
        eventSource.onmessage = ((e) => {
            dispatch({ type: 'lines-add', payload: { data: e.data } })
        });
    }, []);

    const closeDialog = () => { dispatch({ type: 'dialog-close', payload: null }) }

    return <>
        <div className={cx('shell-console')}>
            <a title={RESX.console.pause_title} className='console-pause' onClick={() => setPause(!paused)}><span className={cx('fas', paused ? 'fa-play' : 'fa-pause')}></span></a>
            <a title={RESX.console.erase_title} className='console-erase' onClick={() => { dispatch({ type: 'lines-clear', payload: null }) }}><span className={cx('fas', 'fa-times')}></span></a>
            <div>
                {state.data.lines.length > 0 && state.data.lines.map((element, index) => {
                    const i = index;
                    return <div className={cx('console-line', 'ellipsis')} onClick={() => { dispatch({ type: 'dialog-show', payload: { index: i } }) }}>{element}</div>
                })}
            </div>
        </div>

        {state.dialog.showDialog ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><ConsoleInspector lines={state.dialog.dialogLines} index={state.dialog.dialogIndex} handler={closeDialog} /></div></Modal> : null}
    </>
}