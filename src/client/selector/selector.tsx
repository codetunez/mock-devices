var classNames = require('classnames');
const cx = classNames.bind(require('./selector.scss'));
import axios from 'axios';

import * as React from 'react';
import { SelectorCard } from './selectorCard';
import { DeviceContext } from '../context/deviceContext';

export const Selector: React.FunctionComponent = () => {

  const deviceContext: any = React.useContext(DeviceContext);

  const select = (id: string) => {
    deviceContext.getDevice(id);
  }

  return <DeviceContext.Consumer>
    {(sharedState: any) => (
      <div className='selector-container '>
        <div className='selector-container-header'>
          <div className='section-title'>DEVICES</div>
        </div>
        <div className='selector-container-body'>
          {sharedState && sharedState.devices && sharedState.devices.map((device: any) => {
            return <SelectorCard configuration={device.configuration || {}} handler={select} id={device._id} active={deviceContext.device._id === device._id} running={device.running} />
          })}
          {sharedState && sharedState.devices && sharedState.devices.length === 0 ? 'Use + to Add a Device or Template' : ''}
        </div>
      </div>
    )}
  </DeviceContext.Consumer>
}