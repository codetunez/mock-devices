var classNames = require('classnames');
const cx = classNames.bind(require('./selector.scss'));

import * as React from 'react';
import { SelectorCard } from './selectorCard';
import { DeviceContext } from '../context/deviceContext';
import { AppContext } from '../context/appContext';
import { ControlContext } from '../context/controlContext';
import { RESX } from '../strings';
import { decodeModuleKey } from '../ui/utilities';
import { useRouteMatch } from 'react-router-dom'

export const Selector: React.FunctionComponent = () => {

  const deviceContext: any = React.useContext(DeviceContext);
  const appContext: any = React.useContext(AppContext);
  const match: any = useRouteMatch("/devices/:routeDeviceId");
  const routeDeviceId = match && match.params.routeDeviceId && match.params.routeDeviceId

  return <div className='selector-container '>
    <div className='selector-container-header'>
      {deviceContext.devices.length === 0 ? null : <>
        <div className='section-title'>{RESX.selector.title}</div>
        <button className='selector-toggle' onClick={() => appContext.setSelectorExpand(!appContext.selectorExpand)}>
          <i className={cx("fas fa-sm", appContext.selectorExpand ? 'fa-chevron-down' : 'fa-chevron-up')}></i>
        </button>
      </>
      }
    </div>
    <div className='selector-container-body'>
      {deviceContext.devices.map((item: any, index: number) => {
        const decoded = decodeModuleKey(routeDeviceId || '')
        const active = routeDeviceId && routeDeviceId === item._id || item.configuration._kind === 'edge' && decoded && decoded.deviceId === item._id || false
        // hide the any modules as these are found in the Edge device
        return item.configuration._kind === 'module' ? null :
          <ControlContext.Consumer>
            {(state: any) => (
              <SelectorCard key={item._id} exp={appContext.selectorExpand} index={index} active={active} device={item} control={state.control} />
            )}
          </ControlContext.Consumer>
      })}
      {deviceContext.devices.length === 0 ? <><span>{RESX.selector.empty[0]} </span><span className='fa fa-plus'></span><span>{RESX.selector.empty[1]}</span></> : ''}
    </div>
  </div>
}
