var classNames = require('classnames');
const cx = classNames.bind(require('./shell.scss'));

import * as React from 'react';

import { Nav } from '../nav/nav'
import { Selector } from '../selector/selector';
import { Device } from '../device/device';
import { Console } from './console';
import { ControlProvider } from '../context/controlContext';

import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

const minSize = 40;
const minHeight = 46;
const height = window.innerHeight - minSize;

export const Shell: React.FunctionComponent = () => {

  return <div className='shell'>
    <SplitterLayout vertical={true} primaryMinSize={minSize} secondaryMinSize={minHeight} secondaryInitialSize={height}>
      <Console />
      <div className={cx('shell-content')}>
        <div className={cx('shell-content-nav')}><Nav /></div>
        <div className={cx('shell-content-selector')}><ControlProvider><Selector /></ControlProvider></div>
        <div className={cx('shell-content')}><Device /></div>
      </div>
    </SplitterLayout>

  </div>
}