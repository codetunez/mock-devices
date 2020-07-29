var classNames = require('classnames');
const cx = classNames.bind(require('./nav.scss'));

import * as React from 'react';
import { Modal } from '../modals/modal';
import { Help } from '../modals/help';
import { AddDevice } from '../modals/addDevice';
import { Simulation } from '../modals/simulation';
import { Ux } from '../modals/ux';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';

export function Nav() {

    const deviceContext: any = React.useContext(DeviceContext);

    const [showHelp, toggleHelp] = React.useState(false);
    const [showDevices, toggleDevices] = React.useState(false);
    const [showSimulation, toggleSimulation] = React.useState(false);
    const [showUx, toggleUx] = React.useState(false);

    return <div className='nav'>
        <div className='section-title section-title-nav'>{RESX.app.version}</div>
        <div className="nav-links">
            <div>
                <button title={RESX.nav.help} onClick={() => toggleHelp(!showHelp)} className={'btn btn-outline-primary'}><span className='fas fa-question-circle'></span></button >
                <button title={RESX.nav.file} onClick={() => toggleDevices(!showDevices)} className={'btn btn-outline-primary'}><span className='fa fa-plus'></span></button >
                <hr />
                <button title={RESX.nav.power} onClick={() => deviceContext.startAllDevices()} className='btn btn-outline-primary'><span className='fas fa-power-off'></span></button>
                <button title={RESX.nav.stop} onClick={() => deviceContext.stopAllDevices()} className='btn btn-outline-primary'><span className='fas fa-stop'></span></button>
                <button title={RESX.nav.sync} onClick={() => deviceContext.refreshAllDevices()} className='btn btn-outline-primary'><span className='fas fa-sync'></span></button>
                <hr />
                <button title={RESX.nav.sim} onClick={() => toggleSimulation(!showSimulation)} className='btn btn-outline-primary'><span className='fas fa-flask'></span></button>
                <hr />
                <button title={RESX.nav.reset} onClick={() => deviceContext.reset()} className='btn btn-outline-danger'><span className='fas fa-trash'></span></button>
            </div>
            <button title={RESX.nav.ux} onClick={() => toggleUx(!showUx)} className='btn btn-outline-primary'><span className='fas fa-desktop'></span></button>
        </div>

        {showHelp ? <Modal><div className='blast-shield'></div><div className='app-modal context-modal context-modal-wide'><Help handler={toggleHelp} /></div></Modal> : null}
        {showDevices ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><AddDevice handler={toggleDevices} /></div></Modal> : null}
        {showSimulation ? <Modal><div className='blast-shield'></div><div className='app-modal context-modal'><Simulation handler={toggleSimulation} /></div></Modal> : null}
        {showUx ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal small-modal'><Ux handler={toggleUx} /></div></Modal> : null}
    </div>
}