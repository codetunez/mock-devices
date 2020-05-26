var classNames = require('classnames');
const cx = classNames.bind(require('./device.scss'));

import * as React from 'react';

import { DeviceTitle } from '../deviceTitle/deviceTitle';
import { DeviceCommands } from '../deviceCommands/deviceCommands';
import { DeviceToolbar } from '../deviceToolbar/deviceToolbar';
import { DeviceFieldD2C } from '../deviceFields/deviceFieldD2C';
import { DeviceFieldC2D } from '../deviceFields/deviceFieldC2D';
import { DeviceFieldMethod } from '../deviceFields/deviceFieldMethod';
import { DevicePlan } from '../devicePlan/devicePlan';
import { RESX } from '../strings';

import { DeviceContext } from '../context/deviceContext';

export function Device() {

    const deviceContext: any = React.useContext(DeviceContext);

    return <>{Object.keys(deviceContext.device).length > 0 ?
        <div className='device'>
            <div className='device-toobar'><DeviceToolbar /></div>
            <div className='device-title'><DeviceTitle /></div>
            <div className='device-commands'><DeviceCommands /></div>

            <div className='device-fields'>
                {deviceContext.device.configuration.planMode ?
                    <div className='device-plan'>
                        <DevicePlan device={deviceContext.device} />
                    </div>
                    :
                    <div className='device-capabilities'>
                        {deviceContext.device && deviceContext.device.comms && deviceContext.device.comms.map((capability: any) => {
                            const expand = capability.enabled;
                            const isTemplate = deviceContext.device.configuration._kind === 'template';
                            return <>
                                {capability.type && capability.type.direction === 'd2c' ? <DeviceFieldD2C capability={capability} expand={expand} sensors={deviceContext.sensors} pnp={deviceContext.device.configuration.pnpSdk} template={isTemplate} /> : null}
                                {capability.type && capability.type.direction === 'c2d' ? <DeviceFieldC2D capability={capability} expand={false} pnp={deviceContext.device.configuration.pnpSdk} /> : null}
                                {capability._type === 'method' ? <DeviceFieldMethod capability={capability} expand={false} pnp={deviceContext.device.configuration.pnpSdk} template={isTemplate} /> : null}
                            </>
                        })}
                        {deviceContext && deviceContext.device.comms && deviceContext.device.comms.length === 0 ? RESX.device.empty : ''}
                    </div>
                }
            </div>
        </div>
        : null
    }</>
}