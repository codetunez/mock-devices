# mock-devices v5 Beta (Desktop Edition)
Use mock-devices to create fake/mock devices that connect to an Azure IoT Hub. The devices can send and receive data like a physical device would.

This is the desktop edition of mock-devices which is a cross platform (Windows or OSX) Electron app. To use the Docker version, visit this repo [mock-devices DE](http://github.com/codetunez/mock-devices-de)

#### First time running the app - One Time Install and Build
(See pre-reqs) From a command prompt navigate to the folder where the repo was sync'd. Perform the following command. Do this everytime the code is sync'd from the repo i.e. getting a new version of the app

        npm install && npm run build

_During Beta, most build errors can be ignored. Try the run app step anyway_

#### Launching app (everyday use)
From a command prompt navigate to the folder where the repo was sync'd and perform the following command

        npm run app

#### Usage Instructions
Help is available inside the application

---

## v5 Features
- Plan mode - Create a timed series of events
- Create Azure IoT Digital Twins devices with limited support [see here](https://www.npmjs.com/package/azure-iot-digitaltwins-device/v/1.0.0-pnp-refresh.0)
- Support for current SDK devices
- Support for C2D command using cloud messages
- App Updates - New UX for control. Previous state files not supported

#### Features
- Host up to 750 mock devices
- DPS single or group enrollment support 
- SaS or Connection String support (72 hour SaS expiry)
- Bulk/Clone/Templated device create operations
- Auto Gen DTDL Complex Types; Objects/Maps/Arrays with random values from a DCM
- Simulated versions of common device operations such as Reboot, Shutdown, Firmware and sensors like battery, heaters, fans

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
- AUTO_VALUE - Use the last user suppllied or mock sensor value. Honors String setting.

--- 
### Pre-Reqs
Ensure you have the following configured for your environment

- Node LTS
- git