# mock-devices v6 Beta (Desktop Edition)
mock-devices is a simulation engine that manages and runs simulated devices or Azure IoT Edge modules that connect to an Azure Iot Hub. The devices/modules support D2C/C2D scenarios i.e telemetry, twin and commands as supported by the Azure IoT Device SDK

The simulation engine does not share device configurations and is platform agnostic. Each configured device/module acts independently of other devices/modules running within the engine. Each has its own model (capabilities), configuration and connection details. Devices/modules running on the same simulation engine can be a mix of connection strings, DPS, SaS, Edge modules. The engine has additional scenarios like cloning, bulk, templates and acknowledgements. See internal help

This desktop edition of mock-devices is an Electron app for Windows/Linux/OSX and provides a UX + engine single install application experience. It is part of a suite of mock-devices tools

**Other editions**
- The [mock-devices-de](http://github.com/codetunez/mock-devices-de) edition of the tool is the simulation engine built as a Docker container without the UX. Its useful in scenarios where simulation is required with minimal interaction

- The [mock-devices-edge](http://github.com/codetunez/mock-devices-edge) edition of the tool is used to manage mock-devices for use in Azure IoT Edge deployments

- The [mdux](https://hub.docker.com/r/codetunez/mdux) edition is a Docker container build of the desktop edition. It is designed to run inside containers with no access to file systems. It is a fully functional UX + engine mock-devices instance and is useful for localhost scenarios. It can also be used to connect to any mock-devices engine using IP or DNS

## State file
The state file is the current state of the simulation engine including the list of devices/modules, their capabilities and value set ups. Its also used as the load/save file for the mock-devices desktop tool. Both editions of mock-devices can create and/or utilize a state file created in ether edition with matching version numbers. It is recommended to use the desktop edition to create/manage state files

# Getting started

#### First time running the app - One Time Install and Build
From a command prompt navigate to the folder where the repo was sync'd. Perform the following command.

```
npm ci && npm run build
```

Do this everytime the code is sync'd from the repo i.e. getting a new version of the app. If you are experiencing issues with this step see the _Pre-Reqs and build issues_ step below

#### Launching app (everyday use)
From a command prompt navigate to the folder where the repo was sync'd and perform the following command

```
npm run app
````

#### Usage Instructions
Help is available inside the application

---

#### v6 - Beta
- Support for Azure IoT Edge modules
- Connect to any mock-devices engine using IP or DNS
- [Azure IoT Device SDK 1.17.0](https://www.npmjs.com/package/azure-iot-device)

#### Features
- Supports 1,000 mock devices/modules
- Various connection options; DPS single/group enrollment support with SaS. Sas and/or Connection String
- Bulk/Clone/Templated device create operations
- DTDLv1 DCM to simulated mock devices
  - Auto Gen DTDL Complex Types; Objects/Maps/Arrays with random values using the DCM
- Simulated versions of common device operations such as Reboot, Shutdown, Firmware
- "Pretend" sensors like battery, heaters, fans
- Support for C2D command using cloud messages
- Plan mode - Create a timed series of events
- Send ack's from Twin desired and Commands

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
