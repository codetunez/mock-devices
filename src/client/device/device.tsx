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
import { AppContext } from '../context/appContext';

export function Device() {

    const deviceContext: any = React.useContext(DeviceContext);
    const appContext: any = React.useContext(AppContext);

    return <>{Object.keys(deviceContext.device).length > 0 ?
        <div className='device'>
            <div className='device-toolbar'><DeviceToolbar /></div>
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
                            const expand = appContext.property[capability._id] || false;
                            const isTemplate = deviceContext.device.configuration._kind === 'template';
                            return <>
                                {capability.type && capability.type.direction === 'd2c' ? <DeviceFieldD2C capability={capability} shouldExpand={expand} sensors={deviceContext.sensors} pnp={deviceContext.device.configuration.pnpSdk} template={isTemplate} /> : null}
                                {!deviceContext.device.configuration.pnpSdk ?
                                    <>
                                        {capability.type && capability.type.direction === 'c2d' ? <DeviceFieldC2D capability={capability} shouldExpand={expand} pnp={deviceContext.device.configuration.pnpSdk} template={isTemplate} /> : null}
                                        {capability._type === 'method' ? <DeviceFieldMethod capability={capability} shouldExpand={expand} pnp={deviceContext.device.configuration.pnpSdk} template={isTemplate} originalName={capability.name} /> : null}
                                    </>
                                    : null}
                            </>
                        })}
                        <div className='device-capabilities-empty'>
                            {deviceContext && deviceContext.device.comms && deviceContext.device.comms.length === 0 ? RESX.device.empty : ''}
                        </div>
                    </div>
                }
            </div>
        </div>
        : null
    }</>
}