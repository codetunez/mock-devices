import * as React from 'react';

var classNames = require('classnames');
const cx = classNames.bind(require('./console.scss'));
const cxM = classNames.bind(require('./modal.scss'));

export const Console: React.FunctionComponent<any> = ({ message, handler }) => {

    const display = () => {
        let msg = message;
        try {
            let split = message.split(/->|<-/g)
            msg = <><pre>{split[0]}<br /><br />{JSON.stringify(JSON.parse(split[1]), null, 2)}</pre></>
        } catch (ex) { }
        return msg
    }

    return <div className='m-modal'>
        <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='m-content console-message'>
            <div className='console-window'>
                {display()}
            </div>
        </div>
    </div>
}