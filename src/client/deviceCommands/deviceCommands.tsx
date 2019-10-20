var classNames = require('classnames');
const cx = classNames.bind(require('./deviceCommands.scss'));

import * as React from 'react';

import { Modal } from '../modals/modal';
import { Edit } from '../modals/edit';

import { DeviceContext } from '../context/deviceContext';

export const DeviceCommands: React.FunctionComponent<any> = () => {
    const [showEdit, toggleEdit] = React.useState(false);

    return <DeviceContext.Consumer>
        {(sharedState: any) => (<div className='device-commands-container'>
            <div className='btn-bar'>
                <button className='btn btn-info' onClick={() => { sharedState.createCapability('property', 'd2c') }}><span className='fas fa-plus'></span> Reported</button>
                <button className='btn btn-info' onClick={() => { sharedState.createCapability('property', 'c2d') }}><span className='fas fa-plus'></span> Desired</button>
                <button className='btn btn-info' onClick={() => { sharedState.createCapability('method') }}><span className='fas fa-plus'></span> Method</button>
            </div>
            <div className='btn-bar'>
                {sharedState.device.configuration._kind != 'template' ? <button className='btn btn-warning' onClick={() => { toggleEdit(!showEdit) }}><span className='fas fa-edit'></span></button> : null}
                {sharedState.device.configuration._kind != 'template' ? <button className='btn btn-success' onClick={() => { sharedState.startDevice() }}><span className='fas fa-play'></span></button> : null}
                {sharedState.device.configuration._kind != 'template' ? <button className='btn btn-secondary' onClick={() => { sharedState.stopDevice() }}><span className='fas fa-stop'></span></button> : null}
                <div style={{ width: "20px" }}></div>
                <button className='btn btn-danger' onClick={() => { sharedState.deleteDevice() }}><span className={'fas fa-lg fa-trash-alt'}></span></button>
            </div>
            {showEdit ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><Edit handler={toggleEdit} /></div></Modal> : null}
        </div>
        )}
    </DeviceContext.Consumer>
}