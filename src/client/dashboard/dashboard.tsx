var classNames = require('classnames');
const cx = classNames.bind(require('./dashboard.scss'));
import * as React from 'react';
import { RESX } from '../strings';
import { Stats } from './stats';
import { Grid } from './grid';

export const Dashboard: React.FunctionComponent = () => {

    const [type, setType] = React.useState(0);

    return <div className='dashboard'>
        <div className='dashboard-toolbar'>
            <div className='btn-group' role='group' >
                <button className={cx('btn btn-sm', type === 0 ? 'btn-light' : 'btn-outline-light')}
                    title={RESX.dashboard.title_titles[0]}
                    type='button'
                    onClick={() => { setType(0) }} >{RESX.dashboard.title[0]}</button>
                <button className={cx('btn btn-sm', type === 1 ? 'btn-light' : 'btn-outline-light')}
                    title={RESX.dashboard.title_titles[1]}
                    type='button'
                    onClick={() => { setType(1) }} >{RESX.dashboard.title[1]}</button>
            </div>
        </div>
        <div className='dashboard-content'>
            {type === 0 ? <Grid /> : null}
            {type === 1 ? <Stats /> : null}
        </div>
    </div>
}