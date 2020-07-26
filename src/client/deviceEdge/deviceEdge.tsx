var classNames = require('classnames');
const cx = classNames.bind(require('./deviceEdge.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';

export function DeviceEdge({ modules }) {
    const deviceContext: any = React.useContext(DeviceContext);

    return <>{modules.length > 0 ?
        <div className='device-edge-modules'>
            <div className='title'><h4>{RESX.edge.title}</h4></div>
            <div className='list'>
                {modules.map((element) => {
                    const id = element;
                    return <div>
                        <button title={RESX.edge.buttons.module_title} className='btn btn-primary' onClick={() => { deviceContext.getDevice(id) }}>{element}</button>
                        <button title={RESX.edge.buttons.delete_title} className='btn btn-danger' onClick={() => { deviceContext.deleteModule(id) }}><span className='fa fa-times'></span></button>
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