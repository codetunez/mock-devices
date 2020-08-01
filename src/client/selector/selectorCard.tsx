var classNames = require('classnames');
const cx = classNames.bind(require('./selectorCard.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';
import { controlEvents } from '../ui/utilities';

export const SelectorCard: React.FunctionComponent<any> = ({ exp, index, active, device, control }) => {

  const deviceContext: any = React.useContext(DeviceContext);
  const [expanded, setExpanded] = React.useState(exp);

  React.useEffect(() => {
    setExpanded(exp);
  }, [exp]);

  const runningEvent = control && control[device._id] ? control[device._id][2] : controlEvents.OFF;
  const kind = device.configuration._kind
  const selected = kind === 'edge' ? 'selector-card-active-edge' : 'selector-card-active';

  return <>
    <div className='expander' onClick={() => setExpanded(!expanded)}><i className={cx(expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i></div>
    <div title={device.configuration._kind === 'template' ? RESX.selector.card.template_title : RESX.selector.card.device_title} className={cx('selector-card', active ? selected : '')} onClick={() => deviceContext.setDevice(device)}>
      {expanded ?
        <div className='selector-card-expanded'>
          <h4>{device.configuration.mockDeviceName || ''}</h4>
          {kind === 'template' ?
            <>
              <div className='selector-card-spinner'>
                <i className={classNames('fa fa-pencil-alt fa-2x fa-fw')}></i>
              </div>
              <strong>{kind}</strong>
            </>
            : null}

          {kind === 'edge' ? <>
            <strong>{device.configuration.deviceId || ''}</strong>
            <div className='selector-card-spinner'>
              <i className={classNames('fa fa-hdd fa-2x fa-fw')}></i>
            </div>
            <div className='module-count'>{device.configuration.modules && device.configuration.modules.length} {RESX.selector.card.modules_title}</div>
            <strong>{kind} {RESX.core.deviceL}</strong>
          </>
            : null}

          {kind != 'edge' && kind != 'template' ?
            <>
              <strong>{device.configuration.deviceId || ''}</strong>
              <div className='selector-card-spinner'>
                <i className={cx('fas fa-spinner fa-2x fa-fw', { 'fa-pulse': runningEvent != controlEvents.OFF })} ></i>
              </div>
              <div className={'control control-' + runningEvent}>{runningEvent}</div>
              <strong>{kind} {RESX.core.deviceL}</strong>
            </>
            : null}
        </div>
        :
        <div className='selector-card-mini'>
          <div>
            {kind === 'template' ? <i className={classNames('fa fa-pencil-alt fa-sm fa-fw')}></i> : null}
            {kind === 'edge' ? <i className={classNames('fa fa-hdd fa-sm fa-fw')}></i> : null}
            {kind != 'edge' && kind != 'template' ? <i className={cx('fas fa-spinner fa-sm fa-fw', { 'fa-pulse': runningEvent != controlEvents.OFF })} ></i> : null}
            <h5>{device.configuration.mockDeviceName || ''}</h5>
          </div>
          {kind != 'edge' && kind != 'template' ? <div><span className={'control control-' + runningEvent}>&#9679;</span></div> : null}
        </div>
      }
    </div>
  </>
}