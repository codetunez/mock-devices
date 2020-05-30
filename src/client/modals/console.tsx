import * as React from 'react';

var classNames = require('classnames');
const cx = classNames.bind(require('./console.scss'));
const cxM = classNames.bind(require('./modal.scss'));

export const Console: React.FunctionComponent<any> = ({ lines, index, handler }) => {
    const [selectedIndex, setIndex] = React.useState(index);

    React.useEffect(() => {
        setIndex(index);
    }, [index]);

    const display = () => {
        const DOM = [];
        try {
            const regex = /(\[.*\])|(\{.*?\})$/g
            const msg = lines[selectedIndex];

            const matches = msg.matchAll(regex);
            for (const match of matches) {
                if (match[1] != undefined) {
                    DOM.push(<div>{match[1]}</div>);
                } else {
                    DOM.push(<pre>{JSON.stringify(JSON.parse(match[0]), null, 2)}</pre>);
                }
            }
        } catch (err) {
            DOM.push(lines[selectedIndex]);
        }
        return DOM
    }

    const prev = () => {
        setIndex(selectedIndex > 0 ? selectedIndex - 1 : 0);
    }
    const next = () => {
        setIndex(selectedIndex < lines.length - 1 ? selectedIndex + 1 : lines.length - 1);
    }

    return <div className='m-modal'>
        <div className='m-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='m-content'>
            <div className='console-buttons'>
                <a onClick={() => prev()}><span className={cx('fas', 'fa-chevron-left')}></span></a>
                <a onClick={() => next()}><span className={cx('fas', 'fa-chevron-right')}></span></a>
                <div>[{selectedIndex + 1}/{lines.length}]</div>
            </div>
            <div className='console-window'>
                <div className='console-message'>{display()}</div>
            </div>
        </div>
    </div>
}