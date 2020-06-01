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
                <p>mock-devices is a tool that can be used to quickly create multiple devices with different configurations that act and respond
                    like real devices. It utilizes the <a href="https://github.com/Azure/azure-iot-sdk-node/tree/master/device" target="_blank">node.js</a> Azure
                    IoT Hub device SDK to support real device behavior for C2D and D2C concepts. mock-devices can be used to demonstrate the
                    following concepts ...</p>
                <ul>
                    <li>Connect a device to an Azure IoT Hub</li>
                    <li>Connect a device to IoT Central</li>
                    <li>Connect a device using DPS single and group enrollment including DPS payload and reconnection flows</li>
                    <li>Connect a device using SaS token with expiration</li>
                    <li>Connect a device connection string</li>
                    <li>Connect a device using Digital Twins 'pnp-refresh' SDK (limited features)</li>
                    <li>Create a device from a DCM available the Azure IoT Device Catalog website</li>
                    <li>Create a device from a DCM exported from IoT Central</li>
                    <li>Demonstrate send and receive concepts using Azure IoT Device SDKs</li>
                </ul>
            </div>

            <div className='help-row'>
                <h4>Adding a new mock device</h4>
                <p>A device can be created with any combination of platform, SDK and connection identity.</p>
                <p>Use the <span className='far fa-save'></span> button from menu and follow the "ADD A MOCK DEVICE" menu options. Once the device
                is successfully created, it will be added to the "DEVICES" list. Selecting a card from the list will allow you to see how the device
                is configured and allow the addition of capabilities to send and receive data.</p>
            </div>

            <div className='help-row'>
                <h4>Templates and Cloning</h4>
                <p>Templates allow you to create a device configuration without a connection profile. These can be used as a source to clone
                other devices that use real connection profiles. Devices are disconnected from the template they were created from.
                </p>
                <p>Use the <span className='far fa-save'></span> button from menu and follow the "ADD A TEMPLATE" menu options.</p>

                <h5>Create a template using a DCM</h5>
                <p>A DCM can be used to generate a best guess device configuration. Objects, HashMaps and Arrays are fully supported as well
                as custom JSON to support IoT Central semantic types. To add a DCM (as a Template) use the <span className='far fa-save'></span> button
                from menu  and follow the "ADD A TEMPLATE - &gt; Start with a DCM". The template configuration will be automatically be created with AUTO values
                (see later) and run loops to help quickly configure any device cloned from the template.
                </p>
            </div>

            <div className='help-row'>
                <h4>Plan mode</h4>
                <p>Plan mode allows you to send device data at specific times to create stream of events. You can also have the device
                respond to C2D event and send an ack back. To use plan mode, create a device per usual and select "Plan mode" in the
                device configuration screen. You must have added capabilities to use Plan mode and it will not be enabled until.</p>
                <p>Plans can not be cloned</p>
            </div>

            <div className='help-row'>
                <h4>Starting a device</h4>
                <p>Use the power button to start the device's connection cycle. The device does not need to have any capabilities added to start. This is
                    useful if you are just testing connection success.</p>
                <p>The device needs to be on to send and receive data. Some changes to the device like changes to methods and plans will automatically
                    shut down the device however changes to values and loop times does not require a power off/on cycle.</p>
            </div>

            <div className='help-row'>
                <h4>Sending and receiving data</h4>
                <p>Once a device is created you can add capabilities to send data or respond to C2D events</p>

                <h5>Sending data - Telemetry and Twin reported</h5>
                <p>Use '+ Send Data' to add a capability to send data. Complete the following</p>

                <p>Options</p>
                <ul>
                    <li>Enabled - When the device is on, this allows the capability to send values when running a loop.</li>
                    <li>Looped - Repeatedly send this capability on a timer</li>
                    <li>Complex - Use JSON for the payload of this capability. Can be macro driven with auto/random values (see Macros)</li>
                    <li>Mock - Use a simulated sensor to generate a realistic value and override any static, complex or AUTO values.</li>
                </ul>
                <p>Fields</p>
                <ul>
                    <li>Name - The name of the property</li>
                    <li>API - Msg for Telemetry and Twin for Twin Reported</li>
                    <li>String - Send the value as a string. Select no for numbers and booleans. Use Complex for JSON</li>
                    <li>Enter Value - A user supplied primitive value or an AUTO macro (see below)</li>
                    <li>Unit - Seconds or minutes time period when using a loop</li>
                    <li>Duration - Amount of units when using a loop</li>
                    <li>Complex - A Macro (see later) driven JSON payload. Used to send Objects, Maps and Arrays as payload</li>
                    <li>Sensor - Select a sensor profile to simulate values. Useful for loops</li>
                </ul>

                <p>When updating a device's capability, the capability must be saved to be go into affect. Unsaved changes are indicated by
                     a yellow save icon </p>

                <h5>Receiving data - Twin desired</h5>
                <p>Use '+ Receive Data' to add a capability to receive data. Complete the fields</p>

                <p>Options</p>
                <ul>
                    <li>Enabled - Always ons. Device are always ready to receive C2D events.</li>
                </ul>
                <p>Fields</p>
                <ul>
                    <li>Name - The name of the property</li>
                </ul>

                <h5>Commands - Direct methods or C2D</h5>
                <p>Use '+ Method' to add a capability to simulate a Command request/response. Complete the fields</p>

                <p>Options</p>
                <ul>
                    <li>Enabled - When the device is on, this allows the capability to send values when running a loop.</li>
                    <li>Read - When the device receive a method invoke, this allows the parameters to be viewed.</li>
                </ul>
                <p>Fields</p>
                <ul>
                    <li>Name - The name of the property</li>
                    <li>Execution - When on, the method will use C2D messages instead of direct methods</li>
                    <li>Response Status - The http status sent with the response</li>
                    <li>Response JSON - The JSON or value payload sent back to the calling client</li>
                </ul>

                <h5>mock-devices specific commands</h5>
                <p>mock-devices can simulate common device commands; Firmware, Reboot and Shutdown. This is particularly useful when mock-devices
                is running for a long time and you want to reset any current state when using a mock sensor e.g. the battery mock sensor will reset
                    to 100%. To utilize this feature create a Method and use the following for the method name.</p>
                <ul>
                    <li>reboot - The device will go through a shutdown and reconnect cycle.</li>
                    <li>firmware - The device will go through a shutdown and reconnect cycle but the restart will be delayed by 30 seconds.</li>
                    <li>shutdown - The device will shutdown and further interaction is not possible until the device is manually started again.</li>
                </ul>
                <p>The name for each of the methods (to be used by all the devices) can be changed in the Simulation menu.</p>
            </div>

            <div className='help-row'>
                <h4>Macros and AUTO values</h4>
                <p>AUTO values are macros that are replaced with real (random) values when the device sends its data. They can be used in
                value fields and complex payloads (for sending random data on the leaf nodes) Replace AUTO string with a static
                    value if the feature is not required.</p>
                <p>Complex values must be authored using JSON so use the macro as a string (see examples). When using AUTOs, the property's
                    type will be replaced. See the following.</p>
                <ul>
                    <li>AUTO_STRING - Use a random word from 'random-words' library</li>
                    <li>AUTO_BOOLEAN - Use a random true or false</li>
                    <li>AUTO_INTEGER - Use a random number</li>
                    <li>AUTO_LONG - Use a random number</li>
                    <li>AUTO_DOUBLE - Use a random number with precision</li>
                    <li>AUTO_FLOAT - Use a random number with precision</li>
                    <li>AUTO_DATE - Use now() ISO 8601 format</li>
                    <li>AUTO_DATETIME - Use now() ISO 8601 format</li>
                    <li>AUTO_TIME - Use now() ISO 8601 format</li>
                    <li>AUTO_DURATION - Use now() ISO 8601 format</li>
                    <li>AUTO_GEOPOINT - Use a random lat/long object</li>
                    <li>AUTO_VECTOR - Use a random x,y,z</li>
                    <li>AUTO_MAP - Use empty HashMap</li>
                    <li>AUTO_ENUM/* - Use a random Enum value (See below)</li>
                    <li>AUTO_VALUE - Use the last user supplied or mock sensor value. Honors String setting.</li>
                </ul>
                <p>Enum support is possible by extending the macro to include the list of values. Values
                can only be integers or strings. Enums use the JavaScript style arrays i.e.
                    [1,0] or ['foo','bar'] Append this to the end of an Enum AUTO like ...</p>
                <pre>
                    AUTO_ENUM/['foo','bar']
                    </pre>
                <p>
                    The default range for numbers is 1 to 5000. This can be changed from the Simulation menu
                </p>
                <p>
                    The default geo  location is London, UK. This can be changed from the Simulation menu
                </p>

                <h5>Complex Examples</h5>

                <p>A JSON with AUTO values and statics</p>
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
                <h4>Settings (IoT Central)</h4>
                <p>Settings are a matched pair of desired and reported capabilities where the report has a well defined Complex payload
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
                <p>mock-devices is a state machine and the current running state can replaced with another snapshot of state.</p>
                <p>Use the <span className='far fa-save'></span> button from menu and follow the "STATE MACHINE" menu options</p>
                <ul>
                    <li>Copy/Paste - CTRL+C to capture the current state. CTRL+V to replace the current state.</li>
                    <li>LoadSave from file system - Load or save a JSON file of a previous sate</li>
                </ul>
            </div>

            <div className='help-row'>
                <h3>Changing the Simulation</h3>
                <p>Some some parts of the simulation can be changed like the min/max ranges for number. Change with caution!</p>
            </div>
        </div>
    </div >
}