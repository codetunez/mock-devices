# mock-devices v10 (Desktop Edition)
mock-devices is a simulation engine that manages and runs simulated devices that connect to an Azure Iot Hub and modules and leaf devices for Azure Iot Edge. When hosted in the Azure IoT Edge runtime, the engine will simulate Edge modules too. The simulated devices and modules implement D2C/C2D scenarios i.e telemetry, twin and commands as supported by the Azure IoT Device SDK

Each configured device/module acts independently of other devices/modules running within the engine. Each has its own model (capabilities), configuration and connection details. Devices/modules running on the same simulation engine can be a mix of connection strings, DPS, SaS, Edge modules. The engine has additional scenarios like cloning, bulk, templates and acknowledgements. See internal help

This desktop edition of mock-devices is an Electron app for Windows/Linux/OSX and provides a UX + engine single install application experience. It is part of a suite of mock-devices tools

**Other editions**
- The [mock-devices-de](http://github.com/codetunez/mock-devices-de) edition is a Docker container of the running simulation engine. It exposes a REST endpoint for control and data plane operations. Use this edition to run the Edge modules configured in a mock-devices state file (and deploy as an Edge module) It is also useful where a headless simulation experience per state file is required

- The [mock-devices-edge](http://github.com/codetunez/mock-devices-edge) edition is a Docker container configured as an Edge module that can be used to manage basic operations for running instances of mock-devices-de within the same Edge runtime. Clients can interact with the simulation engine using Twin Desired and Direct Commands making it an alternative to doing REST

- The [mdux](https://hub.docker.com/r/codetunez/mdux) edition is a Docker container build of the desktop edition. It is a fully functional UX + simulation engine mock-devices instance and is useful for dynamic module scenarios. It is feature limited to run inside containers with no access to file system. It can also be used as a "terminal" UX experience to see other running mock-devices engines connecting via IP or DNS

## State file
The state file is the current state of the simulation engine including the list of devices/modules, their capabilities and value set ups. Its also used as the load/save file for the mock-devices desktop tool. Both editions of mock-devices can create and/or utilize a state file created in ether edition with matching version numbers. It is recommended to use the desktop edition to create/manage state files

# Getting started

#### First time running the app - One Time Install and Build
From a command prompt navigate to the folder where the repo was sync'd. Perform the following command.

```
npm ci && npm run build
```

Do this every time the code is sync'd from the repo i.e. getting a new version of the app. If you are experiencing issues with this step see the _Pre-Reqs and build issues_ step below

### Launching app (everyday use)
From a command prompt navigate to the folder where the repo was sync'd and perform the following command

```
npm run app
````

### Usage Instructions

Basic help is available inside the application

---

### v10 Update
- Azure IoT Edge Transparent Gateway and Identity Protocol support. The simulation runs on the mock-devices engine and therefore virtual machines or docker are not required to simulate these two Edge scenarios. The following is supported...

  1. Simulate the actual Edge device and have it send and receive telemetry/twin/commands 
  2. Simulate leaf devices that will auto attach to the Edge parent device
  2. Simulate any number of Modules for the Edge device and use Plugins for inter module communication
  4. Simulate multiple Edge devices (and their children) at the same time
  5. Use single or group DPS enrollment credentials for the Edge device and modules

- The simulation engine has been cranked up to support __3,500__ devices simultaneously (the count of all Edges/Leafs/Modules/Devices configured in the engine)

### v9 Updates
- Plugins - Provide app level state machines written in JavaScript that can be used at the device or capability level to provide values (Sample plugin provided)
- Multiple GEOs - Each device can configure it’s own Geo radius
- Override loop values - Use the simulation config to override loop duration for a capability
- Reduced min/max loop times - Default times are now within the seconds and minute ranges
- Connect dialog - Select a template and provision a device in IoT Central using an API token
- Send values on StartUp - Capabilities can now opt in to be sent on Power Up. Assembled into single payload
- Bulk update - Update specific common properties in a capability across a selection of devices

#### Features
- Sample device - Generate a sample mock device based from a pre-defined configuration
- Supports 1,000 mock devices/modules
- Various connection options; DPS single/group enrollment support with SaS. Sas and/or Connection String
- Bulk/Clone/Templated device create operations
- Auto gen DTDL Complex Types; Objects/Maps/Arrays with random values using the DCM
- Simulated versions of common device operations such as Reboot, Shutdown, Firmware
- "Pretend" sensors like battery, heaters, fans, +1 and -1
- Plan mode - Create a timed series of events
- Support for C2D command using cloud messages 
- Support for Azure IoT Edge modules
- Dashboard statistics mode
- Connect to any mock-devices engine using IP or DNS
- Auto gen from DTDLv2 models/interfaces and DTDLv1 models (DCMs)

#### Macro support for value payloads
Use auto generated values to send as a device value when running in loops

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

--- 
## Advanced, troubleshooting, Pre-Reqs and build issues
Ensure you have the following configured for your environment

*Pre-reqs*
- Node LTS
- git

*If you are experiencing multiple build issues, try the following steps*

Clear NPM cache
```
npm cache clean --force
```

Do the install step separately
```
npm ci
```

Rebuild node-sass
```
rebuild node-sass --force
```

Do the build step separately
```
npm run build
```
