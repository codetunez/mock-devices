import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Shell } from './shell/shell'
import { DeviceProvider } from './context/deviceContext'

ReactDOM.render(
    <DeviceProvider>
        <Shell />
    </DeviceProvider>
    , document.getElementById('app'));