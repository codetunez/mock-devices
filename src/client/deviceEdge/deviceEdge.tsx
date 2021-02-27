var classNames = require('classnames');
const cx2 = classNames.bind(require('../selector/selectorCard.scss'));
const cx = classNames.bind(require('./deviceEdge.scss'));

import * as React from 'react';
import { RESX } from '../strings';
import { controlEvents } from '../ui/utilities';
import { DeviceEdgeChildren } from './deviceEdgeChildren';
import { ControlContext } from '../context/controlContext';

export function DeviceEdge({ gatewayId, modules, modulesDocker, leafDevices, control }) {

    return <>{modules.length > 0 || leafDevices.length > 0 ?
        <div className='device-edge-modules'>
            <ControlContext.Consumer>
                {(state: any) => (

                    <div className='list'>
                        {modules.map((element, index) => {
                            const runningEvent = control && control[element] ? control[element][2] : controlEvents.OFF;
                            return <DeviceEdgeChildren control={state.control} gatewayId={gatewayId} index={index} compositeKey={element} running={runningEvent} type='module' docker={modulesDocker} />
                        })}
                        {leafDevices.map((element, index) => {
                            const runningEvent = control && control[element] ? control[element][2] : controlEvents.OFF;
                            return <DeviceEdgeChildren control={state.control} gatewayId={gatewayId} index={index} compositeKey={element} running={runningEvent} type='leafDevice' docker={null} />
                        })}
                    </div>
                )}
            </ControlContext.Consumer>
        </div>
        : null}
        <div className='device-edge-empty'>
            {modules.length === 0 || leafDevices.length === 0 ? <><p>{RESX.edge.empty[0]}</p><p>{RESX.edge.empty[1]}</p><p>{RESX.edge.empty[2]}</p><p>{RESX.edge.empty[3]}</p></> : null}
        </div>
    </>
}