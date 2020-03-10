var classNames = require('classnames');
const cx = classNames.bind(require('./selectorCard.scss'));

import * as React from 'react';

export const SelectorCard: React.FunctionComponent<any> = ({ configuration, handler, id, active, running, exp }) => {

  const [expanded, setExpanded] = React.useState(exp);

  React.useEffect(() => {
    setExpanded(exp);
  }, [exp]);

  return <>
    <div className='expander' onClick={() => setExpanded(!expanded)}><i className={cx(expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up')}></i></div>
    <div className={cx('selector-card', active ? 'selector-card-active' : '')} onClick={() => handler(id)}>
      {expanded ?
        <div className='selector-card-expanded'>
          <h4>{configuration.mockDeviceName || ''}</h4>
          <strong>{configuration.deviceId || ''}</strong>
          <div className='selector-card-spinner'>
            {configuration._kind === 'template' ?
              <i className={classNames('fa fa-ban fa-2x fa-fw')}></i> :
              <i className={cx('fas fa-spinner fa-2x fa-fw', { 'fa-pulse': running })} ></i>
            }
          </div>
          <strong>{configuration._kind || ''}</strong>
        </div>
        :
        <div className='selector-card-mini'>
          {configuration._kind === 'template' ?
            <i className={classNames('fa fa-ban fa-sm fa-fw')}></i> :
            <i className={cx('fas fa-spinner fa-sm fa-fw', { 'fa-pulse': running })} ></i>}
          <h5>{configuration.mockDeviceName || ''}</h5>
        </div>
      }
    </div>
  </>
}