var classNames = require('classnames');
const cx = classNames.bind(require('./selector.scss'));

import * as React from 'react';
import { SelectorCard } from './selectorCard';
import { DeviceContext } from '../context/deviceContext';
import { RESX } from '../strings';

export const Selector: React.FunctionComponent = () => {

  const deviceContext: any = React.useContext(DeviceContext);
  const [expand, setExpand] = React.useState(true);
  const [deviceControl, setDevices] = React.useState({});

  let eventSource = null;

  React.useEffect(() => {
    eventSource = new EventSource('/api/events/control')
    eventSource.onmessage = ((e) => {
      setDevices(JSON.parse(e.data));
    });
  }, []);

  return <div className='selector-container '>
    <div className='selector-container-header'>
      <div className='section-title'>{RESX.selector.title}</div>
      <div className='selector-toggle'>
        <i onClick={() => setExpand(false)} className="fas fa-sm fa-chevron-up"></i><span> </span><i onClick={() => setExpand(true)} className="fas fs-sm fa-chevron-down"></i>
      </div>
    </div>
    <div className='selector-container-body'>
      {deviceContext.devices.map((item: any, index: number) => {
        const id = item._id;
        return <SelectorCard key={item._id} exp={expand} index={index} active={deviceContext.device._id === item._id} device={item} state={deviceControl[id]} />
      })}
      {deviceContext.devices.length === 0 ? <><span>{RESX.selector.empty[0]} </span><span className='fa fa-plus'></span><span>{RESX.selector.empty[1]}</span></> : ''}
    </div>
  </div>
}