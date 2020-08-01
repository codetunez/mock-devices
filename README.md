# mock-devices v6 Beta (Desktop Edition)
Use mock-devices to create simulated devices and simulated Edge modules that connect to an Azure IoT Hub. The devices/modules support D2C/C2D scenarios using the device SDK

This is the desktop edition of mock-devices which is a cross platform (Windows or OSX) Electron app. To use the Docker version, visit this repo [mock-devices DE](http://github.com/codetunez/mock-devices-de) To see how to use mock-devices for Edge visit this repro [mock-devices-edge](http://github.com/codetunez/mock-devices-edge)

#### First time running the app - One Time Install and Build
From a command prompt navigate to the folder where the repo was sync'd. Perform the following command.

        npm ci && npm run build

Do this everytime the code is sync'd from the repo i.e. getting a new version of the app. If you are experiencing issues with this step see the _Pre-Reqs and build issues_ step below

#### Launching app (everyday use)
From a command prompt navigate to the folder where the repo was sync'd and perform the following command

        npm run app

#### Usage Instructions
Help is available inside the application

---

#### v6 - Beta
- Azure IoT Edge support for modules

#### v5.5 Updates
- Updated [device SDK](https://www.npmjs.com/package/azure-iot-device) to 1.17.0
- Acks for C2D commands and desired properties
- New UX for device connected status

## Features
- Host up to 1,000 mock devices/modules
- DPS single or group enrollment support 
- SaS or Connection String support
- Bulk/Clone/Templated device create operations
- Auto Gen DTDL Complex Types; Objects/Maps/Arrays with random values from a DCM
- Simulated versions of common device operations such as Reboot, Shutdown, Firmware and sensors like battery, heaters, fans
- Support for C2D command using cloud messages
- Plan mode - Create a timed series of events

#### Macro support for value payloads
Use auto generated values to send as device data

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
### Pre-Reqs and build issues
Ensure you have the following configured for your environment

- Node LTS
- git

_If you are experiencing multiple build issues, try the following steps ..._

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
