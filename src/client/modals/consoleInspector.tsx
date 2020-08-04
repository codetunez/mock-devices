import * as React from 'react';

var classNames = require('classnames');
const cx = classNames.bind(require('./consoleInspector.scss'));
const cxM = classNames.bind(require('./modal.scss'));
import { RESX } from '../strings';

export const ConsoleInspector: React.FunctionComponent<any> = ({ lines, index, handler }) => {

    const [messages, setMessages] = React.useState({ lines, index });

    React.useEffect(() => {
        setMessages({ lines, index });
    }, [index, lines]);

    const display = () => {
        const regex = /(.*?)([^\]]*)$/
        const match = messages.lines[messages.index].match(regex);

        let title = '';
        let preContent = '';
        if (match) {
            title = match[1];
            try {
                preContent = JSON.stringify(JSON.parse(match[2]), null, 2);
            } catch (err) {
                preContent = match[2].trim();
            }
        }

        return <>
            <div>{title}</div>
            <pre>{preContent}</pre>
        </>
    }

    const prev = () => {
        setMessages({ lines, index: messages.index > 0 ? messages.index - 1 : 0 });
    }
    const next = () => {
        setMessages({ lines, index: messages.index < lines.length - 1 ? messages.index + 1 : lines.length - 1 });
    }

    return <div className='m-modal'>
        <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='m-content'>
            <div className='console-buttons'>
                <a onClick={() => next()}><span className={cx('fas', 'fa-chevron-left')}></span></a>
                <a onClick={() => prev()}><span className={cx('fas', 'fa-chevron-right')}></span></a>
                <div>{RESX.modal.console.text1[0]} {lines.length - messages.index} {RESX.modal.console.text1[1]} {messages.lines.length}</div>
            </div>
            <div className='console-window'>
                <div className='console-message'>{display()}</div>
            </div>
        </div>
    </div>
}