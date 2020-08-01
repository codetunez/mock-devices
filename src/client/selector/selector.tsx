var classNames = require('classnames');
const cx = classNames.bind(require('./selector.scss'));

import * as React from 'react';
import { SelectorCard } from './selectorCard';
import { DeviceContext } from '../context/deviceContext';
import { AppContext } from '../context/appContext';
import { ControlContext } from '../context/controlContext';
import { RESX } from '../strings';
import { decodeModuleKey } from '../ui/utilities';

export const Selector: React.FunctionComponent = () => {

  const deviceContext: any = React.useContext(DeviceContext);
  const appContext: any = React.useContext(AppContext);

  return <ControlContext.Consumer>
    {(state: any) => (
      <div className='selector-container '>
        <div className='selector-container-header'>
          {deviceContext.devices.length === 0 ? null : <>
            <div className='section-title'>{RESX.selector.title}</div>
            <div className='selector-toggle'>
              {appContext.selectorExpand ? <i onClick={() => appContext.setSelectorExpand(false)} className="fas fa-sm fa-chevron-down"></i> : <i onClick={() => appContext.setSelectorExpand(true)} className="fas fs-sm fa-chevron-up"></i>}
            </div>
          </>
          }
        </div>
        <div className='selector-container-body'>
          {deviceContext.devices.map((item: any, index: number) => {
            const decoded = decodeModuleKey(deviceContext.device._id || '')
            const active = deviceContext.device._id === item._id || item.configuration._kind === 'edge' && decoded && decoded.deviceId === item._id || false
            // hide the any modules as these are found in the Edge device
            return item.configuration._kind === 'module' ? null : <SelectorCard key={item._id} exp={appContext.selectorExpand} index={index} active={active} device={item} control={state.control} />
          })}
          {deviceContext.devices.length === 0 ? <><span>{RESX.selector.empty[0]} </span><span className='fa fa-plus'></span><span>{RESX.selector.empty[1]}</span></> : ''}
        </div>
      </div>
    )}
  </ControlContext.Consumer>
}
