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
import { ControlProvider } from '../context/controlContext';

export function Device() {

    const deviceContext: any = React.useContext(DeviceContext);
    const appContext: any = React.useContext(AppContext);

    const kind = deviceContext.device.configuration && deviceContext.device.configuration._kind;
    const modules = deviceContext.device.configuration && deviceContext.device.configuration.modules || [];

    return <>{Object.keys(deviceContext.device).length > 0 ?
        <div className='device'>
            <div className='device-toolbar'><ControlProvider><DeviceToolbar /></ControlProvider></div>
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
                            return <>
                                {capability.type && capability.type.direction === 'd2c' ? <DeviceFieldD2C capability={capability} shouldExpand={expand} sensors={deviceContext.sensors} pnp={deviceContext.device.configuration.pnpSdk} template={kind === 'template'} /> : null}
                                {!deviceContext.device.configuration.pnpSdk ?
                                    <>
                                        {capability.type && capability.type.direction === 'c2d' ? <DeviceFieldC2D capability={capability} shouldExpand={expand} pnp={deviceContext.device.configuration.pnpSdk} template={kind === 'template'} /> : null}
                                        {capability._type === 'method' ? <DeviceFieldMethod capability={capability} shouldExpand={expand} pnp={deviceContext.device.configuration.pnpSdk} template={kind === 'template'} originalName={capability.name} /> : null}
                                    </>
                                    : null}
                            </>
                        })}
                        <div className='device-capabilities-empty'>
                            {deviceContext && kind != 'edge' && (deviceContext.device.comms && deviceContext.device.comms.length === 0) ? RESX.device.empty : ''}
                            {deviceContext && kind === 'edge' && modules.length === 0 ? <><p>{RESX.device.edge_empty[0]}</p><p>{RESX.device.edge_empty[1]}</p><p>{RESX.device.edge_empty[2]}</p></> : null}
                            {deviceContext && kind === 'edge' && modules.length > 0 ?
                                <div className='device-edge-modules'>
                                    <div className='title'><h4>Goto module</h4></div>
                                    <div className='list'>
                                        {modules.map((element) => {
                                            return <div><button className='btn btn-primary' onClick={() => { deviceContext.getDevice(element) }}>{element}</button></div>
                                        })}
                                    </div>
                                </div>
                            : null}
                        </div>
                    </div>
                }
            </div>
        </div>
        : null
    }</>
}