var classNames = require('classnames');
const cx = classNames.bind(require('./selectorCard.scss'));

import * as React from 'react';

export const SelectorCard: React.FunctionComponent<any> = ({ configuration, handler, id, active, running }) => {

  const [expanded, setExpanded] = React.useState(true);

  return <>
    <div className='expander' onClick={() => setExpanded(!expanded)}><i className={cx(expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i></div>
    <div className={cx('selector-card', active ? 'selector-card-active' : '')} onClick={() => handler(id)}>
      <h4>{configuration.mockDeviceName || ''}</h4>
      {expanded ? <>
        <h5>{configuration.deviceId || ''}</h5>
        {configuration._kind === 'template' ?
          <i className={classNames('fa fa-ban fa-2x fa-fw')}></i> :
          <i className={cx('fas fa-spinner fa-2x fa-fw', { 'fa-pulse': running })} ></i>
        }
        <h4>{configuration._kind || ''}</h4>
      </> : null}
    </div>
  </>
}