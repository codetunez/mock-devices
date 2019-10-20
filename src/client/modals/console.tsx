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
        let msg = lines[selectedIndex];
        try {
            let split = msg.split(/->|<-/g)
            msg = <><pre>{split[0]}<br /><br />{JSON.stringify(JSON.parse(split[1]), null, 2)}</pre></>
        } catch (ex) { }
        return msg
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