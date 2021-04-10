var classNames = require('classnames');
const cx = classNames.bind(require('./dashboard.scss'));
import * as React from 'react';
import { RESX } from '../strings';
import { Stats } from './stats';
import { Grid } from './grid';

export const Dashboard: React.FunctionComponent = () => {

    const [type, setType] = React.useState(1);

    return <div className='dashboard'>
        <div className='dashboard-toolbar'>
            <div className='btn-group' role='group' >
                <button className={cx('btn btn-sm', type === 1 ? 'btn-light' : 'btn-outline-light')}
                    title='Statistics'
                    type='button'
                    onClick={() => { setType(1) }} >{RESX.dashboard.title}</button>
                <button className={cx('btn btn-sm', type === 2 ? 'btn-light' : 'btn-outline-light')}
                    title='Power grid'
                    type='button'
                    onClick={() => { setType(2) }} >POWER GRID</button>
            </div>
        </div>
        <div className='dashboard-content'>
            {type === 1 ? <Stats /> : null}
            {type === 2 ? <Grid /> : null}
        </div>
    </div>
}