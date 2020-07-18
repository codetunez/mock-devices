import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Shell } from './shell/shell'
import { DeviceProvider } from './context/deviceContext'
import { AppProvider } from './context/appContext';

ReactDOM.render(
        <DeviceProvider>
            <AppProvider>
                <Shell />
            </AppProvider>
        </DeviceProvider>
    , document.getElementById('app'));