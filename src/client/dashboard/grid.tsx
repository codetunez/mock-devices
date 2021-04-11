
var classNames = require('classnames');
const cx = classNames.bind(require('./dashboard.scss'));
import { ControlContext } from '../context/controlContext';
import { DeviceContext } from '../context/deviceContext';

import * as React from 'react';
import { RESX } from '../strings';
import { Link } from 'react-router-dom'

export function Grid() {

    const buildBoxes = (control: any) => {
        const dom = [];
        for (const key in control) {
            if (key === '__clear') { continue; }
            dom.push(
                <Link to={'/devices/' + key}>
                    <div title={key} className={'power-icon control-' + control[key][2]}>
                        <i className={cx('fas fa-cog fa-2x fa-fw', { 'fa-spin': control[key][2] !== 'OFF' })} ></i>
                        {control[key][2]}
                    </div>
                </Link>
            )
        }
        return <div className='power-icons'>{dom}</div>
    }

    return <ControlContext.Consumer>
        {(state: any) => <div className='power-grid'>
            {buildBoxes(state.control)}
        </div>}
    </ControlContext.Consumer>

}