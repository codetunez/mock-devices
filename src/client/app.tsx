import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Shell } from './shell/shell'
import { DeviceProvider } from './context/deviceContext'
import { AppProvider } from './context/appContext';
import { GlobalProvider } from './context/globalContext';

ReactDOM.render(
    <GlobalProvider>
        <DeviceProvider>
            <AppProvider>
                <Shell />
            </AppProvider>
        </DeviceProvider>
    </GlobalProvider>
    , document.getElementById('app'));