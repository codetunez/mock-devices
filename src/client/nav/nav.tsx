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
                    <button title={RESX.nav.devices[1]} className={cx('btn btn-outline-primary', match && match.url.indexOf('/devices') > -1 ? 'nav-active' : '')}><span className='fa fa-list'></span><div>{RESX.nav.devices[0]}</div></button>
                </NavLink >
                <NavLink to='/dashboard'>
                    <button title={RESX.nav.stats[1]} className={cx('btn btn-outline-primary', match && match.url.indexOf('/dashboard') > -1 ? 'nav-active' : '')}><span className='fa fa-tachometer-alt'></span><div>{RESX.nav.stats[0]}</div></button>
                </NavLink >
                <button title={RESX.nav.file[1]} onClick={() => actions.menuAdd()} className={'btn btn-outline-primary'}><span className='fa fa-plus'></span><div>{RESX.nav.file[0]}</div></button >
                <button title={RESX.nav.connect[1]} onClick={() => actions.menuCentral()} className={'btn btn-outline-primary'}><span className='fas fa-dice-d20'></span><div>{RESX.nav.connect[0]}</div></button >
                <hr />
                <button title={RESX.nav.power[1]} onClick={() => actions.menuStartAll()} className='btn btn-outline-primary'><span className='fas fa-power-off'></span><div>{RESX.nav.power[0]}</div></button>
                <button title={RESX.nav.stop[1]} onClick={() => actions.menuStopAll()} className='btn btn-outline-primary'><span className='fas fa-stop'></span><div>{RESX.nav.stop[0]}</div></button>
                <hr />
                <button title={RESX.nav.bulk[1]} onClick={() => actions.menuBulk()} className='btn btn-outline-primary'><span className='fas fa-pencil-alt'></span><div>{RESX.nav.bulk[0]}</div></button>
                <button title={RESX.nav.sim[1]} onClick={() => actions.menuSimulation()} className='btn btn-outline-primary'><span className='fas fa-flask'></span><div>{RESX.nav.sim[0]}</div></button>
                <hr />
                <button title={RESX.nav.help[1]} onClick={() => actions.menuHelp()} className={'btn btn-outline-primary'}><span className='fas fa-question-circle'></span><div>{RESX.nav.help[0]}</div></button >
                <button title={RESX.nav.reset[1]} onClick={() => actions.menuReset()} className='btn btn-outline-danger'><span className='fas fa-trash'></span><div>{RESX.nav.reset[0]}</div></button>
            </div>
            <div className="nav-items">
                {deviceContext.ui.container ? <div className='container'><i className="fab fa-docker fa-2x fa-fw" /></div> : null}
                <button title={RESX.nav.ux[1]} onClick={() => actions.menuUx()} className='btn btn-outline-primary'><span className='fas fa-desktop'></span><div>{RESX.nav.ux[0]}</div></button>
            </div>
        </div>
    </div >
}