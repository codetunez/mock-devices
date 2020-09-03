import * as React from 'react';
import { Route } from 'react-router-dom';

var classNames = require('classnames');
const cx = classNames.bind(require('./devices.scss'));
const cx2 = classNames.bind(require('../shell/shell.scss'));

import { Selector } from '../selector/selector';
import { Device } from '../device/device';

export const Devices: React.FunctionComponent = () => {
    return <>
        <div className={cx('shell-content-selector')}><Selector /></div>
        <div className={cx('shell-content')}><Route path="/devices/:id" component={Device} /></div>
    </>
}