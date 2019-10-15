var classNames = require('classnames');
const cx = classNames.bind(require('./nav.scss'));

import * as React from 'react';
import { Modal } from '../modals/modal';
import { Help } from '../modals/help';
import { AddDevice } from '../modals/addDevice';
import { Save } from '../modals/save';
import { DeviceContext, DeviceContextState } from '../context/deviceContext';

export const Nav: React.FunctionComponent = () => {
    const [showHelp, toggleHelp] = React.useState(false);
    const [showDevices, toggleDevices] = React.useState(false);
    const [showSave, toggleSave] = React.useState(false);

    return <DeviceContext.Consumer>
        {(sharedState: any) => (
            <div className='nav'>
                <div className='section-title section-title-nav'>v4</div>
                <button onClick={() => toggleHelp(!showHelp)} className={'btn btn-outline-primary'}><span className='fas fa-question-circle'></span></button >
                <button onClick={() => toggleDevices(!showDevices)} className={'btn btn-outline-primary'}><span className='fas fa-plus'></span></button >
                <button onClick={() => toggleSave(!showSave)} className={'btn btn-outline-primary'}><span className='far fa-save'></span></button >
                <hr />
                <button onClick={() => sharedState.startAllDevices()} className='btn btn-outline-primary'><span className='fas fa-play'></span></button>
                <button onClick={() => sharedState.stopAllDevices()} className='btn btn-outline-primary'><span className='fas fa-stop'></span></button>
                <button onClick={() => sharedState.refreshAllDevices()} className='btn btn-outline-primary'><span className='fas fa-sync'></span></button>
                {showHelp ? <Modal><div className='blast-shield'></div><div className='app-modal context-modal'><Help handler={toggleHelp} /></div></Modal> : null}
                {showDevices ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><AddDevice handler={toggleDevices} /></div></Modal> : null}
                {showSave ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><Save handler={toggleSave} /></div></Modal> : null}
            </div>
        )}
    </DeviceContext.Consumer>
}