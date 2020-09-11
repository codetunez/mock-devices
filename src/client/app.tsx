import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Route, BrowserRouter as Router } from 'react-router-dom'

import { Shell } from './shell/shell'
import { DeviceProvider } from './context/deviceContext'
import { AppProvider } from './context/appContext';
import { StatsProvider } from './context/statsContext';
import { ControlProvider } from './context/controlContext';

const routing = (
    <Router>
        <StatsProvider>
            <ControlProvider>
                <DeviceProvider>
                    <AppProvider>
                        <Shell />
                    </AppProvider>
                </DeviceProvider>
            </ControlProvider>
        </StatsProvider>
    </Router>
)
ReactDOM.render(routing, document.getElementById('app'))