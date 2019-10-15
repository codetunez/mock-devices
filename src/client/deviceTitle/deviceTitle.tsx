var classNames = require('classnames');
const cx = classNames.bind(require('./deviceTitle.scss'));

import * as React from 'react';

export const DeviceTitle: React.FunctionComponent<any> = ({ device }) => {
    return <div className='device-title-container'>
        <span>{device && device.configuration && device.configuration.mockDeviceName}</span>
    </div>

}