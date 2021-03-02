var classNames = require('classnames');
const cx = classNames.bind(require('./shell.scss'));

import * as React from 'react';
import { Route } from 'react-router-dom'
import { Nav } from '../nav/nav'
import { Devices } from '../devices/devices';
import { Dashboard } from '../dashboard/dashboard';
import { Console } from './console';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';
import { AppContext } from '../context/appContext';
import { Endpoint } from '../context/endpoint';
import { Modal } from '../modals/modal';
import { Help } from '../modals/help';
import { AddDevice } from '../modals/addDevice';
import { Simulation } from '../modals/simulation';
import { Ux } from '../modals/ux';
import { ModalConfirm } from '../modals/modalConfirm';
import { Connect } from '../modals/connect';
import { Bulk } from '../modals/bulk';

import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

const minSize = 64;
const height = 28;

export const Shell: React.FunctionComponent = () => {

  const deviceContext: any = React.useContext(DeviceContext);
  const appContext: any = React.useContext(AppContext);
  const ep = Endpoint.getEndpoint() === '/' ? RESX.banner.local : Endpoint.getEndpoint();

  const [showAdd, toggleAdd] = React.useState(false);
  const [showSimulation, toggleSimulation] = React.useState(false);
  const [showHelp, toggleHelp] = React.useState(false);
  const [showUx, toggleUx] = React.useState(false);
  const [showReset, toggleReset] = React.useState(false);
  const [showCentral, toggleCentral] = React.useState(false);
  const [showBulk, toggleBulk] = React.useState(false);

  const menuAdd = () => { toggleAdd(!showAdd); }
  const menuHelp = () => { toggleHelp(!showHelp); }
  const menuSimulation = () => { toggleSimulation(!showSimulation); }
  const menuUx = () => { toggleUx(!showUx); }
  const menuStartAll = () => { deviceContext.startAllDevices(); }
  const menuStopAll = () => { deviceContext.stopAllDevices(); }
  const menuReset = () => { toggleReset(!showReset); }
  const menuCentral = () => { toggleCentral(!showCentral); }
  const menuBulk = () => { toggleBulk(!showBulk); }

  const deleteDialogAction = (result) => {
    if (result === "Yes") {
      //TODO: refactor
      appContext.clearDirty();
      deviceContext.reset();
    }
    toggleReset(false);
  }

  const deleteModalConfig = {
    title: RESX.modal.delete_title,
    message: RESX.modal.delete_all,
    options: {
      buttons: [RESX.modal.YES, RESX.modal.NO],
      handler: deleteDialogAction,
      close: menuReset
    }
  }

  const nav = { menuAdd, menuHelp, menuSimulation, menuUx, menuStartAll, menuStopAll, menuReset, menuCentral, menuBulk }

  return <div className='shell'>
    <SplitterLayout primaryIndex={1} vertical={true} primaryMinSize={height} secondaryMinSize={minSize} secondaryInitialSize={minSize} >
      <Console />
      <div className='shell-content-container'>
        <div className='shell-banner'>
          <div>{`${RESX.banner.connect} ${ep}`}</div>
          {deviceContext.ui && deviceContext.ui.edge && deviceContext.ui.edge.deviceId && deviceContext.ui.edge.moduleId ?
            <div>{`${RESX.banner.edge[0]} ${RESX.banner.edge[1]} '${deviceContext.ui.edge.moduleId}' ${RESX.banner.edge[2]} '${deviceContext.ui.edge.deviceId}'`}</div> : null}
        </div>
        <div className='shell-content'>
          <div className='shell-content-nav'><Nav actions={nav} /></div>
          <Route exact path="/"><div className='shell-content-root'><div>{RESX.shell.title}</div></div></Route>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/devices" component={Devices} />
        </div>
        {showHelp ? <Modal><div className='blast-shield'></div><div className='app-modal context-modal context-modal-wide'><Help handler={menuHelp} /></div></Modal> : null}
        {showAdd ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><AddDevice handler={menuAdd} /></div></Modal> : null}
        {showSimulation ? <Modal><div className='blast-shield'></div><div className='app-modal context-modal'><Simulation handler={menuSimulation} /></div></Modal> : null}
        {showUx ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal min-modal'><Ux handler={menuUx} /></div></Modal> : null}
        {showReset ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal min-modal'><ModalConfirm config={deleteModalConfig} /></div></Modal> : null}
        {showCentral ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><Connect handler={menuCentral} /></div></Modal> : null}
        {showBulk ? <Modal><div className='blast-shield'></div><div className='app-modal center-modal'><Bulk handler={menuBulk} /></div></Modal> : null}
      </div>
    </SplitterLayout >
  </div >
}