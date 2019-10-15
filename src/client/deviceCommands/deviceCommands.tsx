var classNames = require('classnames');
const cx = classNames.bind(require('./deviceCommands.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';

export const DeviceCommands: React.FunctionComponent<any> = () => {

    return <DeviceContext.Consumer>
        {(sharedState: any) => (<div className='device-commands-container'>
            <div className='btn-bar'>
                <button className='btn btn-info' onClick={() => { sharedState.createCapability('property', 'd2c') }}><span className='fas fa-plus'></span> D2C</button>
                <button className='btn btn-info' onClick={() => { sharedState.createCapability('property', 'c2d') }}><span className='fas fa-plus'></span> Desired</button>
                <button className='btn btn-info' onClick={() => { sharedState.createCapability('method') }}><span className='fas fa-plus'></span> Method</button>
            </div>
            {sharedState.device.configuration._kind != 'template' ?
                <div className='btn-bar'>
                    <button className='btn btn-success' onClick={() => { sharedState.startDevice() }}><span className='fas fa-play'></span></button>
                    <button className='btn btn-secondary' onClick={() => { sharedState.stopDevice() }}><span className='fas fa-stop'></span></button>
                    <button className='btn btn-danger' onClick={() => { sharedState.deleteDevice() }}><span className={'fas fa-lg fa-trash-alt'}></span></button>
                </div> : null}
        </div>
        )}
    </DeviceContext.Consumer>
}