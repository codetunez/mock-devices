var classNames = require('classnames');
const cx2 = classNames.bind(require('../selector/selectorCard.scss'));
const cx = classNames.bind(require('./deviceEdge.scss'));

import * as React from 'react';
import { RESX } from '../strings';
import { controlEvents } from '../ui/utilities';
import { DeviceModule } from './deviceModule';

export function DeviceEdge({ modules, modulesDocker, edgeDevices, control }) {

    return <>{modules.length > 0 || edgeDevices.length > 0 ?
        <div className='device-edge-modules'>
            <div className='title'>{RESX.edge.title}</div>
            <div className='list'>
                {modules.map((element, index) => {
                    const runningEvent = control && control[element] ? control[element][2] : controlEvents.OFF;
                    return <DeviceModule index={index} compositeKey={element} running={runningEvent} type='module' docker={modulesDocker} />
                })}
                {edgeDevices.map((element, index) => {
                    const runningEvent = control && control[element] ? control[element][2] : controlEvents.OFF;
                    return <DeviceModule index={index} compositeKey={element} running={runningEvent} type='edgeDevice' docker={null} />
                })}
            </div>
        </div>
        : null}
        <div className='device-edge-empty'>
            {modules.length === 0 || edgeDevices.length === 0 ? <><p>{RESX.edge.empty[0]}</p><p>{RESX.edge.empty[1]}</p><p>{RESX.edge.empty[2]}</p><p>{RESX.edge.empty[3]}</p></> : null}
        </div>
    </>
}