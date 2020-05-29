var classNames = require('classnames');
const cx = classNames.bind(require('./selectorCard.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';

export const SelectorCard: React.FunctionComponent<any> = ({ exp, index, active, device }) => {

  const deviceContext: any = React.useContext(DeviceContext);
  const [expanded, setExpanded] = React.useState(exp);

  React.useEffect(() => {
    setExpanded(exp);
  }, [exp]);

  return <>
    <div className='expander' onClick={() => setExpanded(!expanded)}><i className={cx(expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i></div>
    <div className={cx('selector-card', active ? 'selector-card-active' : '')} onClick={() => deviceContext.setDevice(device)}>
      {expanded ?
        <div className='selector-card-expanded'>
          <h4>{device.configuration.mockDeviceName || ''}</h4>
          {device.configuration._kind === 'template' ?
            <div className='selector-card-spinner'>
              <i className={classNames('fa fa-ban fa-2x fa-fw')}></i>
            </div>
            :
            <>
              <strong>{device.configuration.deviceId || ''}</strong>
              <div className='selector-card-spinner'>
                <i className={cx('fas fa-spinner fa-2x fa-fw', { 'fa-pulse': device.running })} ></i>
              </div>
            </>
          }
          <strong>{device.configuration._kind || ''} / {device.configuration.pnpSdk ? 'pnp' : 'current'}</strong>
        </div>
        :
        <div className='selector-card-mini'>
          {device.configuration._kind === 'template' ?
            <i className={classNames('fa fa-ban fa-sm fa-fw')}></i> :
            <i className={cx('fas fa-spinner fa-sm fa-fw', { 'fa-pulse': device.running })} ></i>}
          <h5>{device.configuration.mockDeviceName || ''}</h5>
        </div>
      }
    </div>
  </>
}