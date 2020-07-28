var classNames = require('classnames');
const cx2 = classNames.bind(require('../selector/selectorCard.scss'));
const cx = classNames.bind(require('./deviceEdge.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';
import { decodeModuleKey, controlEvents } from '../ui/utilities';

export function DeviceEdge({ modules, control }) {
    const deviceContext: any = React.useContext(DeviceContext);

    return <>{modules.length > 0 ?
        <div className='device-edge-modules'>
            <div className='title'>{RESX.edge.title}</div>
            <div className='list'>
                {modules.map((element, index) => {
                    const id = element;
                    const decoded = decodeModuleKey(id);
                    const runningEvent = control && control[id] ? control[id][2] : controlEvents.OFF;
                    return <div className="edge-module">
                        <div className='expander'>
                            <div>{RESX.edge.card.title} {index + 1}</div>
                            <button title={RESX.edge.buttons.delete_title} className='btn btn-sm btn-outline-danger' onClick={() => { deviceContext.deleteModule(id) }}><span className='fa fa-times'></span></button>
                        </div>
                        <div className='selector-card'>
                            <div className='selector-card-expanded' onClick={() => { deviceContext.getDevice(id) }}>
                                <h4>{decodeModuleKey(element).moduleId}</h4>
                                <strong>{decoded.deviceId || ''}</strong>
                                <div className='selector-card-spinner'>
                                    <i className={cx('fas fa-spinner fa-2x fa-fw', { 'fa-pulse': runningEvent != controlEvents.OFF })} ></i>
                                </div>
                                <div className={'control control-' + runningEvent}>{runningEvent}</div>
                            </div>
                        </div>
                    </div>
                })}
            </div>
        </div>
        : null}
        <div className='device-edge-empty'>
            {modules.length === 0 ? <><p>{RESX.edge.empty[0]}</p><p>{RESX.edge.empty[1]}</p><p>{RESX.edge.empty[2]}</p></> : null}
        </div>
    </>
}