var classNames = require("classnames");

import * as React from "react";
import * as ReactDOM from "react-dom";
import { FormatJSON } from './framework/utils'

export class Help extends React.Component<any, any> {

    render() {
        return <div className="help">
            <div className="help-row">
                <h2>How to use mock-devices</h2>
                <p>
                    mock-devices is a dev tool that allows you to create fake devices that
                can send and receive data like real devices.
                </p>
            </div>
            <div className="help-row">
                <h4>Adding a new mock device</h4>
                To add a new mock device, use the + button from menu. Use a ...
                        <ul>
                    <li>Hub Connection String - a new device will be created on the Azure IoT Hub</li>
                    <li>Device Connection String - mock an existing device that exists in Azure IoT Hub</li>
                </ul>
                <p>A device can only be added once. Multiple Hubs can be used.</p>
                <h5>Add a new mock using a clone of an existing device</h5>
                <p>
                    Any running mock-device device can be cloned for it's model and current state. Follow the
                    add device flow and select the device from the 'Clone the model of this device' drop down
                </p>
                <h5>Add a new mock using an existing device on an IoT Hub</h5>
                <p>
                    Use the server icon to select an existing device on an IoT Hub by providing a hub connection string.
                    Follow the add new device flow
                </p>
            </div>
            <div className="help-row">
                <h4>Adding a new mock device as a Template</h4>
                <p>
                    Any device can be changed to a template under the Advanced tab. This will stop the device from being
                    started but will allow it's model to be cloned. This is useful in Start All. To reuse the device
                    id "templated", change the connection string to anything conforming
                </p>
            </div>
            <div className="help-row">
                <h4>Save current set of devices</h4>
                <p>
                    Use the save icon to get a JSON dump of all the mock devices and their configurations. To load, use
                a previously exported JSON dump. State is not exported. You can also save to local storage on the
                machine you are currently using
                </p>
            </div>
            <div className="help-row">
                <h4>Debug the server side twin for a mock-device</h4>
                <p>
                    Use the Advanced view of a device to provide the hub connection string. A debug icon will appear for
                    in the device's toolbar
                </p>
            </div>
            <div className="help-row">
                <h4>Adding a Property</h4>
                <p>
                    Add a device and the property tool bar will appear on the right. The toolbar allows you to add
                properties to the device and start/stop/delete
                the device. Starting the device will make the device enter it's run loop. The device must be running
                to send and receive values. When the device is running the tool bar will be green.</p>
                <p>Both C2D and D2C Properties have common fields.</p>
                <p>
                    <em>Field Name</em> is the name of the property used in the SDK payload. A field name is auto generated on pressing add<br />
                    <em>Device SDK Out/In</em> selects between using the SDK telemetry/message channel or the SDK Twin API. Docs can be found here
                    <br /><span className="docs-link">https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-sdks</span>
                </p>
                <p>
                    Adding, removing and changing any of the fields in a property does not require the device to be stopped. Some changes will be applied
                    immediately, whilst others will highlight the save button. Saving will update the property. If in a run loop it will happen on the next
                    cycle.
                    </p>
            </div>

            <div className="help-row">
                <h4>Adding a C2D Property</h4>
                <p>
                    A Cloud to Device property is used to receive a value from the connected IoT Hub i.e. a Desired value
                </p>
                <p>When the device is running, use the Read button to get the latest value sent. This is not a deep read and is simply
                    the latest value sent to the device. Sending a new value to the device will not update this field until Read is
                    pressed again. <em>Version</em> is the version number of the full twin as stored in the hub/cloud.
                </p>
            </div>

            <div className="help-row">
                <h4>Adding a D2C Property</h4>
                <p>
                    A Device to Cloud property is used to send a value from the device to the connected IoT Hub. Use this to send
                    both messages or twin updates.
                </p>
                <p>When the device is running, use the send button to send a new value. Set <em>As String</em> to "No" to send
                booleans and numerics.
                </p>
                <h5>Include in run loop</h5>
                <p>
                    Check <em>Include in run loop</em> to have the property value automatically send on the selected duration. The
                    Send button can still be used and will modify the value sent and report the new value immediately.
                </p>
                <h5>Template the Value payload</h5>
                <p>
                    Use this option to format the value into a JSON object. You can use the _VALUE_ macro to inject the
                    mock devices current value (ensure you set the type) This is an example template
                </p>
                <pre>
                    {FormatJSON({ "value": "_VALUE_", "status": "completed", "message": "test message", "statusCode": 200, "desiredVersion": 1 })}
                </pre>
                <p>not using this option will create a simple name/value pair JSON object.</p>
                <pre>
                    {FormatJSON({ "d2cProperty-88cf": "_VALUE_" })}
                </pre>
                <br />
                <h5>Mock Sensor Configuration</h5>
                <p>The mock-device tool includes 3 fake sensors to simulate useful telemetry trends. You can also provide a web hook like
                    Azure Functions to process a simulated value. An update to the parameters of the simulated property will cause sensor to restart. A mock
                    sensor will override the value field of the property. The Send button can still be used with a supplied value causing a spiking effect on the sensor.
                </p>
                <p>
                    To configure the selected D2C property click the <em>Add a Mock Sensor</em> button and another panel will appear
                </p>
                <p>The simulated values can be changed to give more range to test your application. Use the fields in the following way</p>
                <p>
                    <em>init</em> is the value of the sensor when it is first started<br />
                    <em>running</em> is the value of the sensor should reach when time to running has elapsed<br />
                    <em>variance Code</em> applies a multiplier to the value to give it some randomness<br />
                    <em>timeToRunning</em> is the number of ms to reach running<br />
                    <em>Reported "Live" Value</em> show the current value of the simulated sensor<br />
                </p>
                <h5><em>Web Hook/Azure Function</em></h5>
                <p>To use a web hook to calculate a sensor value click the Function button.</p>
                <p>Provide the parameters ...</p>
                <p>
                    <em>init</em> is the value of the sensor when it is first started<br />
                    <em>function</em> a public url for the web hook. a POST request is made<br />
                </p>
                <p>The web hook call frequency is govern'd by the run loop. As this is an offbox call you should use a higher runloop value i.e. 60 - 120 seconds.
                </p>
                <b>Request/Response Payload</b>
                <p>This is the expected payload for both read and writes</p>
                <pre>
                    {FormatJSON({ "value": 3754 })}
                </pre>
                <p>mock-devices expects an numeric coming back from the Function call. Anything else will not be processedd and the run loop will continue.</p>
            </div>
            <div className="help-row">
                <h4>Adding a Method</h4>
                <p>
                    A method payload can be mocked so that whenever a method is called on your device a payload and status code will be returned to the caller. This is useful
                    to test a flow between a client and the mock-device device. Parameters sent by the caller to a method are ignored (but can be viewed). Too add a method use
                    the Add Method button in the top most toolbar. Complete the method name, status and return payload (must be JSON)
                </p>
                <h5><em>Return Method Name Property</em></h5>
                <p>
                    If you select <em>Return Method Name Property</em>, a twin D2C property will also be sent using the method name as the property name and the
                    Return Payload as the value. Use a string value as the payload. The method will also return the value in a JSON payload
                    </p>
            </div>
        </div >
    }
}