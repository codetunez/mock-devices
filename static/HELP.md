

### Help
mock-devices is a tool that can be used to create simulated devices with different telemetry/property/method and connection configurations. It uses the Azure IoT device SDK for MQTT to provide simulated C2D and D2C device behavior and also implement DTDL conventions

mock-devices can be used to do the following concepts:

- Send/receive data to an Azure IoT Hub platform
- Send/receive data to Azure IoT Central platform
- Send/receive data to Azure IoT Explorer tool
- Send/receive data as a module in an Azure IoT Edge deployment
- Connect using DPS single or group enrollment plus DPS payload
- Connect using SaS token with expiration
- Connect using a device connection string
- Create a mock device configuration based on Components
- Create a mock device configuration from an IoT Central exported DCM (DTDL)
- Demonstrate connecting devices in bulk using device first registration
- UX/client soak, range and stress testing of device values

mock-devices is primarily a test tool for simulating device values interactively. It also works well as a simulation service and can be setup to run forever with random or repeatable values. It was designed for speed of use to quickly diagnose issues and therefore by design, provides an experience over tedious test tasks of setting up SDKs, connections, naming things and conventions. The focus is on values!

### How to add a new mock device
A device can be created with any combination of platform, SDK and connection identity/credentials. To create a device configuration from a DCM follow the "Importing a DCM, Templates and Cloning" section

Use the + button from menu bar on the left of the application to get started

#### Connect using DPS or Device Connection String
Select one of the _ADD A MOCK DEVICE_ menu options and complete the required fields. If using DPS, the _Root key_ toggle switches between single and group enrollment. If using single enrollment, _Device ID_ and _SaS key_ must be created on the target platform first and then used here

Once the device is successfully created, it is added to the _DEVICES & TEMPLATES_ list. Selecting a card from the list will open up the Device Details panel detailing how the device is configured, what capabilities the device has, options to add to the device's capabilities and options to power up/down the device

**Device first registration, group enrollment and bulk devices using DPS**  
If using DPS, enable the _Root key_ switch to do group enrollment and/or perform device first registration on the target platform. By enabling _Root key_, bulk options are now available and you can create 1 to 1000 devices. In bulk scenarios, mock-devices will automatically append a number to the end of the selected _Device ID_ to ensure uniqueness. There is no need to create anything on the target platform and the _Device ID_ used here will be created there per meeting attestation requirements

#### Importing a DCM, Templates and Cloning
Select one of the _ADD A TEMPLATE_ menu options and complete the required fields. Templates allow you to create a device configuration without a connection profile. These can be used as a baseline configuration when creating other devices that have connection details. Devices are disconnected from the template they were created from but a template can be reapplied to any set of devices currently running in the simulation. Doing this will stop the selected device(s), update the configuration but not change it's connection or identity details

Templates are also added to the _DEVICES & TEMPLATES_ list and can be selected like a regular device. None of the power, send and receive interactions are available.

**Import a DTDLv1/v2 DCM as a template**  
A DCM can be used to generate a best guess device configuration. Objects, HashMaps and Arrays are fully supported as well as custom JSON to support DTDL semantic types. If using DTDLv2 and Components, the capabilities will be automatically be set up

To add a template from a DCM, follow the _ADD A TEMPLATE -&gt; Use a DTDLv1 or DTDLv2 DCM_ flow. The template's configuration will be automatically be created with AUTO values (see later) and pre set run loops to quickly configure any device cloned from the template.

If the DCM contains a Setting, two capabilities will be created (the Desired and Reported Twin) that represent both parts of the Setting (see later)

**Cloning**  
When available, cloning allows you to create a device configuration from template or another device in the simulation. Connection details are not cloned

#### Adding and Edge device host for Edge modules
Select the _AZURE IOT EDGE_ menu option and complete the required fields. Edge modules configured in the application will not run on the desktop environment. For the module to run, the state file and mock-devices simulation engine (see github.com/codetunez/mock-devices-de) must be hosted in an Edge deployment. Modules do not appear in the _DEVICES & TEMPLATES_ list as they are nested under the Edge device host

When running in the Edge runtime, the module will match the host Edge runtime's config.yml device configuration. It is important to match the module's identity in mock-devices to how it is configured in the Edge deployments manifest.json (see github.com/codetunez/mock-devices-edge)

### How to start and stop devices
Devices are given the concept of power on and off just like a physical device in the real world. Powering up the device will make it start "running" and it will go through the connection cycle to connect via DPS or to a hub. The indicator on the selector card will cycle through colors indicating the stage of connection

- Blue - Device has been switched on 
- Purple - Device is in initialize wait mode
- Cyan - Device is initializing connection cycles
- Orange - Device is trying DPS connection cycle (when applicable)
- Green - Device has successfully connected through DPS (when applicable)
- Lime - Connected to hub. Device is ready to send and receive
- Red - Failed or failing to connect
- Grey - Device is off

All types of device connection configurations will try to reconnect in failed/failing scenarios multiple times before self powering down. Connection metrics can be viewed in the Dashboard feature from the main application menu

A device can be powered up without any send and receive capabilities configured just like a real world device

### How to set up a device to send and receive data
Once a device is created you can add capabilities to send data or receive and respond to C2D events. Capabilities can be add/removed dynamically to a device without the need to power it up and down

#### Interactive and Plan mode
_Interactive_ mode is where Telemetry, Twin Desired/Reported and Direct/C2D Methods capabilities can be added to the device configuration. This mode also configures the names of the capability and the type (msg/twin/method). When the device is running, this mode is can be used to dynamically change and send values

_Plan_ mode allows you to send device data at specific times to create series of events. You can also have the device respond to C2D events and send an ack back from a capability. To use Plan mode, the device must have all the capabilities set up which can only be done in _Interactive_ mode to do this. Plan mode will ignore any existing values set up for the capability an only use the ones specified in the Plan

#### Components
Components are used in DTDL to define a group of capabilities that can be composed into a larger model. In mock-devices, all capability types can be added to a Component just by enabling the _Component_ toggle and completing the name field. When a capability is part of a component, it's title will start with a \[c\]

**mock-devices will wrap and apply the convention when sending data _or_ receiving data**. For messages, this is adding the Component name into the message property. For Reported Twin, this is wrapping the payload in the Component name. For Desired Twin this is unwrapping the desired property from the payload. For Direct Method this is listening for Component*Method

Component names shared within the same device are treated as the same Component

#### Sending data - Telemetry and Twin Reported
Add a capability to send ether telemetry or a Reported Twin, click the _+ Send Data_ button and complete the following fields

- Enabled - Enable this capability when device is running
- Capability name - The JSON property name sent "down the wire"
- Enter value - The value to send now using the _Send_ button
- Can override mock - Same as Enter value
- API - Make this capability a Twin or Msg/Telemetry
- Send value as string - Select the data type for the JSON property value
- Component Name - The name used to send this capability
- Complex value - Use a JSON value instead of the _Enter value_ field
- Add snippet - Paste into the editor a reference blob of JSON
- Loop - When enabled, will repeat sending the value at a random selected time. Persists after first save
- Time unit - Choose between mins and seconds
- Loop duration - Reset the current set loop time
- Mock - Use a simulated sensor to generate a realistic value and override any static, complex or AUTO values.
- Customize UX - Change the color of the capability

#### Receiving data - Twin Desired
Add a capability to receive a Desired Twin, click the _+ Receive Data_ button and complete the following fields

- Enabled - Enable this capability when device is running
- Capability name - The name of the Desired Twin property name expected in the received desired payload
- Component Name - When _Component_ is enabled and set, the name used when parsing any incoming receive payloads
- Customize UX - Change the color of the capability

**Desired Twin section**  
Use the _Read_ button to see the last known value sent to the device for this Desired Twin. On startup, the device will always receive the full twin and subsequent updates. IoT Central will send full twin on startup **but** patches for delta changes to the twin. mock-devices deals with unpacking both full and patch Desired Twins values. The value and version are used as part of the response for Settings (see later)

**Ack Response section**  
See below
 
#### Methods - Direct Methods or C2D commands
Add a capability to receive a request to execute a Direct Method or C2D command, click the _+ Method_ button and complete the following fields

- Enabled - Enable this capability when device is running
- Method name - The name of the Direct Method or C2D command 
- Component Name - When _Component_ is enabled and set, the name used when registering method handlers
- Make C2D Command - Switch the execution mode from Direct Method to C2D command
- Customize UX - Change the color of the capability

C2D commands not available for Edge modules

**Method Response section**  
When configured as a Direct Method, the status code and payload are sent back to the calling client automatically. The is a direct response from the method invoke call and **not** an ack through a different channel. When enabling C2D, this section will disappear

**Ack Response section**  
See below

**Method Params section**  
Use the _Read_ button to see the last known parameter values sent by the last invoke call. These are ignored by the mock-devices simulation engine and are here for readonly validation purposes

##### mock-devices built-in commands
mock-devices has 3 built-in commands; Firmware, Reboot and Shutdown that simulate this typical device behavior. This is particularly useful when mock-devices is running for a long time and you want to reset any current state when using a mock sensor. To utilize this feature create a Direct Method and use the following for the method name (case sensitive)
                
- reboot - The device will go through a power down and up cycle
- firmware - The device will go through a power down and up cycle but the restart will be delayed by 30 seconds
- shutdown - The device will shutdown and further interaction is not possible until the device is powered up again

The name for each of the methods (to be used by all the devices) can be changed in the Simulation menu

#### Ack Response sections
_Ack Response_ is a mock-devices concept and a way for a device to send an arbitrary response when it receives a method invoke call or desired setting request. _Ack Response_ is the way to do the DTDL convention for Settings and C2D responses. For Direct Methods _Ack Response_ is an additional mechanism to normal method response

This is how to setup the fields

- Use a capability to send a response - When enabled, the remaining UX is exposed to set up the ack
- Select capability - Only capabilities defined can be used to send an ack. Both Telemetry and Reported Twins can be used to send back an ack. For Settings, the capability name selected must match the currently capability
- Override capability's current value - When enabled, will allow a custom value to be provided
- Value (can be literal/JSON/Array) - The value/payload sent as the Ack.
- Add snippet - Paste into the editor a reference blob of JSON
- Do not apply value wrapping on Ack Response - This is a legacy option and should always be enabled. If not, the return payload will be wrapped in a value property

For the ack, the response capability's _API_ and _Component name_ setting are honored. The value is only honored when not overridden

### Settings - Twin convention for IoT Central and DTDLv2
Settings are a convention that specifies how a device can receive data and ack a response using device Twins. To do Setting, create a Desired and Reported Twin property using the same name. The reported part of the pair is required to send a value/payload in the following format

    'value': 'DESIRED_VALUE',
    'ac': 200,
    'ad': 'completed',
    'av': 'DESIRED_VERSION'

In the _Ack Response_ section of the Twin Desired, ensure the _Use a capability to send a response_, ensure the matched Twin Reported is selected and set up any value override.

### Macro support for value payloads
Use a random value in a _Value_ field

- AUTO_STRING - Use a random word from 'random-words' library
- AUTO_BOOLEAN - Use a random true or false
- AUTO_INTEGER - Use a random number
- AUTO_LONG - Use a random number
- AUTO_DOUBLE - Use a random number with precision
- AUTO_FLOAT - Use a random number with precision
- AUTO_DATE - Use now() ISO 8601 format
- AUTO_DATETIME - Use now() ISO 8601 format
- AUTO_TIME - Use now() ISO 8601 format
- AUTO_DURATION - Use now() ISO 8601 format
- AUTO_GEOPOINT - Use a random lat/long object
- AUTO_VECTOR - Use a random x,y,z
- AUTO_MAP - Use empty HashMap
- AUTO_ENUM/* - Use a random Enum value (See below)
- AUTO_VALUE - Use the last user supplied or mock sensor value. Honors String setting.

The following are only available for value fields in Twin Desired capabilities

- DESIRED_VALUE - The desired value sent to the device
- DESIRED_VERSION - The version of the Desired Twin sent to the device

Enum support is possible by extending the macro to include the list of values. Values can only be integers or strings. Enums use the JavaScript style arrays i.e. \[1,0\] or \['foo','bar'\] Append this to the end of an Enum AUTO like ...

    AUTO_ENUM/['foo','bar']

The default range for AUTO_INTEGER, AUTO_DOUBLE, AUTO_FLOAT can be changed from the Simulation menu

The default geo location is London, UK. This can be changed from the Simulation menu

### Complex Examples
A JSON with AUTO values and statics

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

An X,Y,Z object
                
    {
        'x': 'AUTO_INTEGER',
        'y': 'AUTO_INTEGER',
        'z': 150
    }
    
A Map - Needs static keys (Beta)

    {
        'mapKey1': 'AUTO_STRING',
        'mapKey2': 'AUTO_STRING',
        'mapKey3': 'AUTO_STRING'
    }

An Array

    ['AUTO_INTEGER', 5, 'AUTO_DOUBLE', 999]

### Saving and Loading mock-devices devices (State file)
mock-devices is a state machine and the current running state can replaced with another snapshot of state. Use the + button from menu and follow the _STATE_ menu options

- Load/Save from file system - Load or save a JSON file of a previous state
- Editor - Manually edit the state file JSON

### Changing the Simulation parameters
Some some parts of the simulation can be changed like the min/max ranges for number. Change with caution!
