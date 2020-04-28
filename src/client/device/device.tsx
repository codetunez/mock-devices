var classNames = require('classnames');
const cx = classNames.bind(require('./device.scss'));

import * as React from 'react';

import { DeviceTitle } from '../deviceTitle/deviceTitle';
import { DeviceCommands } from '../deviceCommands/deviceCommands';
import { DeviceToolbar } from '../deviceToolbar/deviceToolbar';
import { DeviceFieldD2C } from '../deviceFields/deviceFieldD2C';
import { DeviceFieldC2D } from '../deviceFields/deviceFieldC2D';
import { DeviceFieldMethod } from '../deviceFields/deviceFieldMethod';

import { DeviceContext } from '../context/deviceContext';

export const Device: React.FunctionComponent = () => {

    const [expandAll, setExpandAll] = React.useState(false);

    const expandHandler = (value: boolean) => {
        setExpandAll(value);
    }

    return <DeviceContext.Consumer>
        {(sharedState: any) => (
            Object.keys(sharedState.device).length > 0 ?
                <div className='device'>
                    <div className='device-title'>
                        <DeviceTitle device={sharedState.device} />
                    </div>
                    <div className='device-toobar'>
                        <DeviceToolbar devices={sharedState.devices} index={sharedState.deviceIndex} handler={expandHandler} />
                    </div>
                    <div className='device-commands'>
                        <DeviceCommands device={sharedState.device} />
                    </div>
                    <div className='device-fields'>
                        <div className='device-fields-container'>
                            {sharedState.device && sharedState.device.comms && sharedState.device.comms.map((capability: any) => {
                                return <>
                                    {capability.type && capability.type.direction === 'd2c' ? <DeviceFieldD2C capability={capability} sensors={sharedState.sensors} expand={expandAll} /> : null}
                                    {capability.type && capability.type.direction === 'c2d' ? <DeviceFieldC2D capability={capability} expand={expandAll} /> : null}
                                    {capability._type === 'method' ? <DeviceFieldMethod capability={capability} expand={expandAll} /> : null}
                                </>
                            })}
                            {sharedState && sharedState.device.comms && sharedState.device.comms.length === 0 ? 'Use + Reported/Desired/Method to send or receive data' : ''}
                        </div>
                    </div>
                </div>
                : null
        )}
    </DeviceContext.Consumer>
}