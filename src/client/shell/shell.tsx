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
import { AppProvider } from '../context/appContext';

import { Console } from '../modals/console';
import { RESX } from '../strings';

import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

export const Shell: React.FunctionComponent = () => {
  const deviceContext: any = React.useContext(DeviceContext);
  const [paused, setPause] = React.useState(false);
  const [lines, updateConsole] = React.useState([]);
  const [consoleModal, setConsole] = React.useState<any>({});

  const propertyUpdate = (data: any) => {
    //console.log(data);
  }

  const liveUpdate = (data: any) => {
    let payload = JSON.parse(data);
    let latest = lines.slice(0);
    latest.unshift(payload.message);
    if (latest.length > 2000) {
      latest.pop();
    }
    !paused && updateConsole(latest);
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

  const openConsole = (lines, index) => {
    setConsole({
      showConsole: true,
      lines: lines,
      index: index
    })
  }

  const closeConsole = () => {
    setConsole({
      showConsole: false
    })
  }

  return <div className='shell'>
    <Websocket url={'ws://127.0.0.1:24377'} onMessage={propertyUpdate} />
    <Websocket url={'ws://127.0.0.1:24387'} onMessage={liveUpdate} />

    <SplitterLayout vertical={true} primaryMinSize={40} secondaryMinSize={46} secondaryInitialSize={660}>
      <div className={cx('shell-console')}>
        <a title={RESX.console.pause_title} className='console-pause' onClick={() => setPause(!paused)}><span className={cx('fas', paused ? 'fa-play' : 'fa-pause')}></span></a>
        <a title={RESX.console.erase_title} className='console-erase' onClick={() => updateConsole([])}><span className={cx('fas', 'fa-times')}></span></a>
        <div>
          {lines.length > 0 && lines.map((element, index) => {
            return <div className={cx('console-line', 'ellipsis')} onClick={() => { openConsole(lines, index) }}>{element}</div>
          })}
        </div>
      </div>
      <div className={cx('shell-content')}>
        <div className={cx('shell-content-nav')}><Nav /></div>
        <div className={cx('shell-content-selector')}><Selector /></div>
        <AppProvider>
          <div className={cx('shell-content')}><Device /></div>
        </AppProvider>
      </div>
    </SplitterLayout>

    {consoleModal.showConsole ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><Console lines={consoleModal.lines} index={consoleModal.index} handler={closeConsole} /></div></Modal> : null}

  </div>
}