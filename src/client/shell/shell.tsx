var classNames = require('classnames');
const cx = classNames.bind(require('./shell.scss'));

import * as React from 'react';

import { Nav } from '../nav/nav'
import { Selector } from '../selector/selector';
import { Device } from '../device/device';
import { Console } from './console';
import { ControlProvider } from '../context/controlContext';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';
import { Endpoint } from '../context/endpoint';

import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

const minSize = 40;
const minHeight = 46;
const height = window.innerHeight - minSize;


export const Shell: React.FunctionComponent = () => {
  const deviceContext: any = React.useContext(DeviceContext);
  const ep = Endpoint.getEndpoint() === '/' ? RESX.banner.local : Endpoint.getEndpoint();

  return <div className='shell'>
    <SplitterLayout vertical={true} primaryMinSize={minSize} secondaryMinSize={minHeight} secondaryInitialSize={height}>
      <Console />

      <div className='shell-content-container'>
        <div className='shell-banner'>
          <div>{`${RESX.banner.connect} ${ep}`}</div>
          {deviceContext.ui && deviceContext.ui.edge && deviceContext.ui.edge.deviceId && deviceContext.ui.edge.moduleId ?
            <div>{`${RESX.banner.edge[0]} ${RESX.banner.edge[1]} '${deviceContext.ui.edge.moduleId}' ${RESX.banner.edge[2]} '${deviceContext.ui.edge.deviceId}'`}</div> : null}
        </div>
        <div className={cx('shell-content')}>
          <div className={cx('shell-content-nav')}><Nav /></div>
          <ControlProvider>
            <div className={cx('shell-content-selector')}><Selector /></div>
            <div className={cx('shell-content')}><Device /></div>
          </ControlProvider>
        </div>
      </div>
    </SplitterLayout>

  </div>
}