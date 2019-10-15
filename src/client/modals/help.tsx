var classNames = require('classnames');
const cx = classNames.bind(require('./help.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import * as React from 'react';

export const Help: React.FunctionComponent<any> = ({ handler }) => {
    return <div className='help'>
        <div className='help-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='help-content'>
            <div className='help-row'>
                <h3>How to use mock-devices</h3>
                <p>mock-devices is a dev tool that can be used to create simulated devices. Devices created in mock-devices
                    connect to an Azure IoT Hub like a real device would by using the Azure IoT Device SDK.
                    </p>
                <p>A device configuration (the things a device does) can be dynamically modelled based on abilities in the
                    SDK; Send <b>Telemetry</b> events, send/receive <b>Twin</b> desired/reported properties and receive <b>Commands</b>.
                    </p>
                <p>A Device needs to be started to connect, send and receive data for a Hub. Devices automatically re-connect after
                    50 minutes to ensure continous running. This does not affect the state of the simulation.
                    </p>
                <p>mock-devices is a dev tool! Most instabilities can be fixed by restarting the app and reloading state.
                    </p>
            </div>

            <div className='help-row'>
                <h4>Adding a new mock device</h4>
                Use the + button from menu. Devices can be added in the following way
                <br /><br />
                <ul>
                    <li>DPS - Use both the individual or root keys to create a new device</li>
                    <li>Device Connection String - Mock and use an already registered device on Azure IoT Hub</li>
                </ul>
                <p>mock-devices is agnostic to Hub or DPS and each device created has it's own connection profile. This is
                    useful for running production and dev devices together.</p>
            </div>

            <div className='help-row'>
                <h4>Templates and Cloning</h4>
                <p>Templates allow you to create device configuration without the need of a connection string or DPS setting. New
                    devices can use a template to bootstrap their configuration. Templates are disconnected from their references.
                </p>
                <p>To create a device from a Template (or another Device configuration) select 'Use Template' during the new device flow.</p>

                <h5>Using a Plug and Play Device Capability Model for device configuration</h5>
                <p>A DCM can be used to generate a best guess device configuration. Complex Types are modelled as JSON with random values
                    used for leaf nodes. Object, Map and Arrays are fully supported as well as custom JSON to support IoT Central semantic
                    types. To add a DCM (as a Template) use the new device flow and select 'Start with a DCM' and then create a new device.
                </p>
            </div>

            <div className='help-row'>
                <h4>Sending and Receving data</h4>
                <p>
                    Select a device and click it's play button. If the connection details supplied when creating the device are correct, this
                    will start the connect cycle of the device. Post connecting, the device can send and receive data. This does not require
                    the device to have a modelled configuration.
                </p>

                <h5>Device capabilities/properties</h5>
                <p>Capabilites have the following options when enabled</p>
                <ul>
                    <li>Enabled - When the device is running, this allows the capability to work</li>
                    <li>Looped - Repeatedly send this capability on a timer</li>
                    <li>Complex - Use JSON for the payload of this capability. Can be macro driven with auto/random values (see Macros)</li>
                    <li>Auto Value - Generate a value based on a set of simulated sensors. Can be used without Complex</li>
                    <li>Convert - Read the Twin desired value sent as a JSON</li>
                    <li>Return - Send this JSON back as the reponse payload for a Command execute</li>
                </ul>

                <p>When updating a device's capability, the capability must be saved to be go into affect. Unsaved changes are indicated by
                     a yellow save icon </p>

                <h5>Telemetry and Twin Reported</h5>
                <p>Use '+ D2C' to add a capability to send data. Complete the fields</p>
                <ul>
                    <li>Name - The name of the property</li>
                    <li>API - Msg for Telemetry and Twin for Twin Reported</li>
                    <li>String - Send the value as a string. Select no for numbers and booleans. Use Complex for JSON</li>
                    <li>Enter Value - A user supplied primative value</li>
                    <li>Interface Name - Used by PnP Device SDK to group capabilty sending. Not supported.</li>
                    <li>Unit - Seconds or minutes time period when using a loop</li>
                    <li>Duration - Amount of units when using a loop</li>
                    <li>Complex - A Macro (see later) driven JSON payload. Used to send Objects, Maps and Arrays as payload</li>
                    <li>Mock Sensor - Select a sensor profile to simluate values. Useful for loops</li>
                </ul>

                <h5>Twin Desired</h5>
                <p>Use '+ Desired' to add a capability to recieve data. Complete the fields</p>
                <p>Full support coming ...</p>

                <h5>Commands</h5>
                <p>Use '+ Method' to add a capability to simulate a Command request/response. Complete the fields</p>
                <p>Full support coming ...</p>
            </div>

            <div className='help-row'>
                <h4>Macros and Auto Values</h4>
                <p>When using Complex payloads, its useful to send random data on the leaf nodes. As well as static data,
                    mock-devices supports several macros that generate random data based on a type. See the following.</p>
                <ul>
                    <li>AUTO_STRING - Use a random word based of the random-words OSS library</li>
                    <li>AUTO_INTEGER - Use a random number between 1 and 5000</li>
                    <li>AUTO_LONG - Use a random number between 1 and 5000</li>
                    <li>AUTO_DOUBLE - Use a random number between 1 and 5000</li>
                    <li>AUTO_FLOAT - Use a random number between 1 and 5000</li>
                    <li>AUTO_BOOLEAN - Use a random boolean</li>
                    <li>AUTO_VALUE - Use the last user suppllied or mock sensor value. Honors String setting.</li>
                </ul>

                <h5>Complex Examples</h5>
                <p>A JSON with Auto Values</p>
                <pre>
                    {JSON.stringify({
                        'complexObject': {
                            'nestedObj': {
                                'nestedObj': {
                                    'param3': 'AUTO_BOOLEAN'
                                },
                                'param1': 'AUTO_INTEGER',
                                'param2': 'Hello World!'
                            },
                            'param1': 'AUTO_VALUE',
                            'param2': 'AUTO_STRING',
                            'param3': true
                        }
                    }, null, 2)}
                </pre>

                <p>An X,Y,Z object</p>
                <pre>
                    {JSON.stringify({ 'x': 'AUTO_INTEGER', 'y': 'AUTO_INTEGER', 'z': 150, }, null, 2)}
                </pre>

                <p>An Array</p>
                <pre>['AUTO_INTEGER', 5, 'AUTO_DOUBLE', 999]</pre>

                <p>A Map - Needs static keys (Beta)</p>
                <pre>
                    {JSON.stringify({
                        'map': {
                            'mapKey1': 'AUTO_STRING',
                            'mapKey2': 'AUTO_STRING',
                            'mapKey3': 'AUTO_STRING'
                        }
                    }, null, 2)}
                </pre>
            </div>

            <div className='help-row'>
                <h4>Settings</h4>
                <p>Settings are a matched pair of desired and reported capabilties where the report has a well defined Complex payload
                    and the desired is required to send an ack back in a given format. See IoT Central documentation for more details.
                </p>

                <p>Required JSON payload for reported Setting</p>
                <pre>
                    {JSON.stringify({
                        'value': 'AUTO_INTEGER',
                        'status': 'completed',
                        'message': 'test message',
                        'statusCode': 200,
                        'desiredVersion': 1
                    }, null, 2)}
                </pre>
            </div>

            <div className='help-row'>
                <h3>Saving and Loading mock-devices devices</h3>
                <p>mock-devices is a state machine and therefore its current running state can replaced with another snapshot of state. This captures 
                    all of the devices created and their cionfiguration. To get or replace the state, use the Save icon in the menu. These are the options.</p>
                <ul>
                    <li>Copy/Paste State - CTRL+C to capture the current state. CTRL+V to replace the current state.</li>
                    <li>Load State - Not supported!</li>
                    <li>Save Current State - Not supported!</li>
                </ul>
            </div>

        </div>
    </div >
}