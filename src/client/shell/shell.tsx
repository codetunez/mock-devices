var classNames = require('classnames');
const cx = classNames.bind(require('./shell.scss'));

import * as React from 'react';
import axios from 'axios';
import * as Websocket from 'react-websocket';

import { Nav } from '../nav/nav'
import { Modal } from '../modals/modal';
import { Selector } from '../selector/selector';
import { Device } from '../device/device';
import { DeviceContext } from '../context/deviceContext';
import { Console } from '../modals/console';

export const Shell: React.FunctionComponent = () => {
  const deviceContext: any = React.useContext(DeviceContext);
  const [expanded, setExpanded] = React.useState(false);
  const [lines, updateConsole] = React.useState([]);
  const [consoleModal, setConsole] = React.useState<any>({});

  const propertyUpdate = (data: any) => {
    //console.log(data);
  }

  const liveUpdate = (data: any) => {
    let payload = JSON.parse(data);
    let latest = lines.slice(0);
    latest.unshift(payload.message);
    if (latest.length > 500) {
      latest.pop();
    }
    updateConsole(latest);
  }

  React.useEffect(() => {
    axios.get('/api/devices')
      .then((res: any) => {
        deviceContext.setDevices(res.data);
        return axios.get('/api/sensors')
      })
      .then((res: any) => {
        deviceContext.setSensors(res.data);
      })
  }, []);

  const openConsole = (message) => {
    setConsole({
      showConsole: true,
      message: message
    })
  }

  const closeConsole = () => {
    setConsole({
      showConsole: false
    })
  }

  return <div className='shell'>
    <div className={cx('shell-console', expanded ? 'shell-console-expanded' : '')}>
      <div className='console-toggle'>
        <a onClick={() => setExpanded(!expanded)}><span className={cx('fas', !expanded ? 'fa-chevron-up' : 'fa-chevron-down')}></span></a>
      </div>

      <div>
        <Websocket url={'ws://127.0.0.1:24377'} onMessage={propertyUpdate} />
        <Websocket url={'ws://127.0.0.1:24387'} onMessage={liveUpdate} />
        {lines.length > 0 && lines.map((element, index) => {
          return <div className={cx('console-line', 'ellipsis')} onClick={() => { openConsole(element) }}>{element}</div>
        })}
      </div>

    </div>
    <div className={cx('shell-content')}>
      <div className={cx('shell-content-nav')}><Nav /></div>
      <div className={cx('shell-content-selector')}><Selector /></div>
      <div className={cx('shell-content')}><Device /></div>
    </div>

    {consoleModal.showConsole ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><Console message={consoleModal.message} handler={closeConsole} /></div></Modal> : null}

  </div>
}