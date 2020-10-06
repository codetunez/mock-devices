var classNames = require('classnames');
const cx = classNames.bind(require('./modalConfirm.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import * as React from 'react';

export const ModalConfirm: React.FunctionComponent<any> = ({ config }) => {
    return <div className='dialog-confirm'>
        <div className='m-modal'>
            <div className='m-close' onClick={() => config.options.close()}><i className='fas fa-times'></i></div>
            <div className='m-content'>
                <h4>{config.title}</h4>
                <h5>{config.message}</h5>
            </div>
            <div className='m-footer'>
                <div className='form-group btn-bar'>
                    {config && config.options.buttons.map((ele: any, index: number) => {
                        return <button className={cx('btn', index === 0 ? 'btn-primary' : 'btn-secondary')} onClick={() => config.options.handler(ele)}>{ele}</button>
                    })}
                </div>
            </div>
        </div>
    </div>
}