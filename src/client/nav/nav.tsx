var classNames = require('classnames');
const cx = classNames.bind(require('./nav.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';
import { NavLink, useRouteMatch } from 'react-router-dom'

export function Nav({ actions }) {

    const deviceContext: any = React.useContext(DeviceContext);
    let match = useRouteMatch("/:content");

    return <div className='nav'>
        <div className='section-title section-title-nav'>{RESX.app.version}</div>
        <div className="nav-links">
            <div className="nav-items">
                <NavLink to='/devices'>
                    <button title={RESX.nav.devices} className={cx('btn btn-outline-primary', match && match.url.indexOf('/devices') > -1 ? 'nav-active' : '')}><span className='fa fa-list'></span></button>
                </NavLink >
                <NavLink to='/dashboard'>
                    <button title={RESX.nav.stats} className={cx('btn btn-outline-primary', match && match.url.indexOf('/dashboard') > -1 ? 'nav-active' : '')}><span className='fa fa-tachometer-alt'></span></button>
                </NavLink >
                <button title={RESX.nav.file} onClick={() => actions.menuAdd()} className={'btn btn-outline-primary'}><span className='fa fa-plus'></span></button >
                <hr />
                <button title={RESX.nav.power} onClick={() => actions.menuStartAll()} className='btn btn-outline-primary'><span className='fas fa-power-off'></span></button>
                <button title={RESX.nav.stop} onClick={() => actions.menuStopAll()} className='btn btn-outline-primary'><span className='fas fa-stop'></span></button>
                <hr />
                <button title={RESX.nav.sim} onClick={() => actions.menuSimulation()} className='btn btn-outline-primary'><span className='fas fa-flask'></span></button>
                <hr />
                <button title={RESX.nav.help} onClick={() => actions.menuHelp()} className={'btn btn-outline-primary'}><span className='fas fa-question-circle'></span></button >
                <button title={RESX.nav.reset} onClick={() => actions.menuReset()} className='btn btn-outline-danger'><span className='fas fa-trash'></span></button>
            </div>
            <div className="nav-items">
                {deviceContext.ui.container ? <div className='container'><i className="fab fa-docker fa-2x fa-fw" /></div> : null}
                <button title={RESX.nav.ux} onClick={() => actions.menuUx()} className='btn btn-outline-primary'><span className='fas fa-desktop'></span></button>
            </div>
        </div>
    </div >
}