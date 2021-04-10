var classNames = require('classnames');
const cx = classNames.bind(require('./dashboard.scss'));
import { StatsContext } from '../context/statsContext';
import * as React from 'react';
import { RESX } from '../strings';
import { Link } from 'react-router-dom'

export function Stats() {
    function dom(stats) {
        const dom = []
        for (const item in stats) {
            const dom2 = [];
            for (const item2 in stats[item]) {
                const lbl = RESX.UI.STATS[item2] || item2
                dom2.push(<div className={'tile-field'}>
                    <div>{lbl}</div>
                    <div>{stats[item][item2] || RESX.dashboard.nodata}</div>
                </div>);
            }
            dom.push(<div className='tile'>
                <div className='header'><Link to={'/devices/' + item}>{item}</Link></div>
                <div className='body'>{dom2}</div>
            </div>);
        }
        return dom;
    }

    return <StatsContext.Consumer>
        {(state: any) => (<div className='stats-grid'>
            {state.stats && Object.keys(state.stats).length === 0 ? <div className='waiting'>{RESX.dashboard.waiting}</div> :
                <div className='tile-host'>{dom(state.stats)}</div>
            }
        </div>)}
    </StatsContext.Consumer>
}