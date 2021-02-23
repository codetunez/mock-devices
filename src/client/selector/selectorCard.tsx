var classNames = require('classnames');
const cx = classNames.bind(require('./selectorCard.scss'));

import * as React from 'react';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';
import { controlEvents, decodeModuleKey } from '../ui/utilities';
import { Link } from 'react-router-dom'

export const SelectorCard: React.FunctionComponent<any> = ({ exp, index, active, device, control }) => {

  const deviceContext: any = React.useContext(DeviceContext);
  const [expanded, setExpanded] = React.useState(exp);

  React.useEffect(() => {
    setExpanded(exp);
  }, [exp]);

  let edgeOn = false;
  const runningEvent = control && control[device._id] ? control[device._id][2] : controlEvents.OFF;
  const kind = device.configuration._kind
  const selected = kind === 'edge' ? 'selector-card-active-edge' : 'selector-card-active';

  if (device.configuration.modules) {
    for (const index in device.configuration.modules) {
      const key = device.configuration.modules[index];
      const { deviceId, moduleId } = decodeModuleKey(key);
      if (deviceId === device._id && control[key] && control[key][2] != controlEvents.OFF) {
        edgeOn = true;
        break;
      }
    }
  }

  const childCountModules = device.configuration.modules && device.configuration.modules.length || 0
  const childCountDevices = device.configuration.edgeDevices && device.configuration.edgeDevices.length || 0

  return <div className="selector-card-container">
    <button className='expander' onClick={() => setExpanded(!expanded)}><i className={cx(expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i></button>
    {expanded ?
      <Link to={'/devices/' + device._id}>
        <button className={cx('selector-card', 'selector-card-expanded', active ? selected : '')} title={device.configuration._kind === 'template' ? RESX.selector.card.template_title : RESX.selector.card.device_title}>
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
              <i className={classNames('fa fa-hdd fa-2x fa-fw', edgeOn ? 'control-CONNECTED' : 'control-OFF')}></i>
            </div>
            <div className='module-count'>{childCountModules + childCountDevices} {RESX.selector.card.children_title}</div>
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
        </button>
      </Link>
      :
      <Link to={'/devices/' + device._id}>
        <button className={cx('selector-card', 'selector-card-mini', active ? selected : '')} title={device.configuration._kind === 'template' ? RESX.selector.card.template_title : RESX.selector.card.device_title}>
          <div className='selector-card-mini'>
            {kind === 'template' ? <i className={classNames('fa fa-pencil-alt fa-sm fa-fw')}></i> : null}
            {kind === 'edge' ? <i className={classNames('fa fa-hdd fa-sm fa-fw', edgeOn ? 'control-CONNECTED' : 'control-OFF')}></i> : null}
            {kind != 'edge' && kind != 'template' ? <i className={cx('fas fa-spinner fa-sm fa-fw', { 'fa-pulse': runningEvent != controlEvents.OFF })} ></i> : null}
            <h5>{device.configuration.mockDeviceName || ''}</h5>
          </div>
          {kind != 'edge' && kind != 'template' ? <div><span className={'control control-' + runningEvent}>&#9679;</span></div> : null}
        </button>
      </Link>
    }
  </div>
}