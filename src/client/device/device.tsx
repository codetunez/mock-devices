var classNames = require('classnames');
const cx = classNames.bind(require('./device.scss'));

import * as React from 'react';
import { useParams } from 'react-router-dom'
import { DeviceTitle } from '../deviceTitle/deviceTitle';
import { DeviceCommands } from '../deviceCommands/deviceCommands';
import { DevicePower } from '../devicePower/devicePower';
import { DeviceFieldD2C } from '../deviceFields/deviceFieldD2C';
import { DeviceFieldC2D } from '../deviceFields/deviceFieldC2D';
import { DeviceFieldMethod } from '../deviceFields/deviceFieldMethod';
import { DevicePlan } from '../devicePlan/devicePlan';
import { DeviceEdge } from '../deviceEdge/deviceEdge';
import { RESX } from '../strings';

import { DeviceContext } from '../context/deviceContext';
import { AppContext } from '../context/appContext';
import { ControlContext } from '../context/controlContext';

export function Device() {

    const { id } = useParams<any>();

    const deviceContext: any = React.useContext(DeviceContext);
    const appContext: any = React.useContext(AppContext);
    appContext.clearDirty();

    React.useEffect(() => {
        appContext.clearDirty();
        deviceContext.getDevice(id);
    }, [id]);

    if (!deviceContext.device.configuration) { return null; }

    const kind = deviceContext.device.configuration._kind;
    const modules = deviceContext.device.configuration.modules || [];
    const modulesDocker = deviceContext.device.configuration.modulesDocker || {};
    const edgeDevices = deviceContext.device.configuration.edgeDevices || [];
    const content = deviceContext.device.configuration.planMode ? 'plan' : kind === 'edge' ? 'edge' : 'caps';
    const plugIn = deviceContext.device.configuration.plugIn && deviceContext.device.configuration.plugIn !== '' ? true : false;

    return <>{Object.keys(deviceContext.device).length > 0 ?
        <div className='device'>
            <div className='device-toolbar'>
                <ControlContext.Consumer>
                    {(state: any) => (
                        <DevicePower control={state.control} />
                    )}
                </ControlContext.Consumer>
            </div>
            <div className='device-title'><DeviceTitle /></div>
            <div className='device-commands'><DeviceCommands /></div>

            <div className='device-fields'>
                {content === 'plan' ? <div className='device-plan'><DevicePlan device={deviceContext.device} /></div> : null}
                {content === 'edge' ? <div className='device-edge'>
                    <ControlContext.Consumer>
                        {(state: any) => (
                            <DeviceEdge modules={modules} modulesDocker={modulesDocker} edgeDevices={edgeDevices} control={state.control} />
                        )}
                    </ControlContext.Consumer>
                </div> : null}
                {content === 'caps' ? <div className='device-capabilities'>
                    {deviceContext.device && deviceContext.device.comms && deviceContext.device.comms.map((capability: any) => {
                        const expand = appContext.property[capability._id] || false;
                        return <>
                            {capability.type && capability.type.direction === 'd2c' ? <DeviceFieldD2C capability={capability} shouldExpand={expand} template={kind === 'template'} sensors={deviceContext.sensors} plugIn={plugIn} /> : null}
                            {capability.type && capability.type.direction === 'c2d' ? <DeviceFieldC2D capability={capability} shouldExpand={expand} template={kind === 'template'} /> : null}
                            {capability._type === 'method' ? <DeviceFieldMethod capability={capability} shouldExpand={expand} template={kind === 'template'} originalName={capability.name} originalComponentName={capability.component ? capability.component.name : null} /> : null}
                        </>
                    })}
                    <div className='device-capabilities-empty'>
                        {deviceContext.device.comms && deviceContext.device.comms.length === 0 ? RESX.device.empty : ''}
                    </div>
                </div> : null}
            </div>
        </div> : null}
    </>
}