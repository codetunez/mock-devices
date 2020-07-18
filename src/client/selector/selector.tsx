var classNames = require('classnames');
const cx = classNames.bind(require('./selector.scss'));

import * as React from 'react';
import { SelectorCard } from './selectorCard';
import { DeviceContext } from '../context/deviceContext';
import { AppContext } from '../context/appContext';
import { RESX } from '../strings';

export const Selector: React.FunctionComponent = () => {

  const deviceContext: any = React.useContext(DeviceContext);
  const appContext: any = React.useContext(AppContext);
  const [expand, setExpand] = React.useState(true);

  return <div className='selector-container '>
    <div className='selector-container-header'>
      {deviceContext.devices.length === 0 ? null : <>
        <div className='section-title'>{RESX.selector.title}</div>
        <div className='selector-toggle'>
          {appContext.selectorExpand ? <i onClick={() => appContext.setSelectorExpand(false)} className="fas fa-sm fa-chevron-up"></i> : <i onClick={() => appContext.setSelectorExpand(true)} className="fas fs-sm fa-chevron-down"></i>}
        </div>
      </>
      }
    </div>
    <div className='selector-container-body'>
      {deviceContext.devices.map((item: any, index: number) => {
        return <SelectorCard key={item._id} exp={appContext.selectorExpand} index={index} active={deviceContext.device._id === item._id} device={item} state={appContext.control[item._id]} />
      })}
      {deviceContext.devices.length === 0 ? <><span>{RESX.selector.empty[0]} </span><span className='fa fa-plus'></span><span>{RESX.selector.empty[1]}</span></> : ''}
    </div>
  </div>
}