# mock-devices v4 (Desktop Edition)
Use mock-devices to create fake/mock devices that connect to an Azure IoT Hub. The devices can send and receive data like a physical device would.

This is the desktop edition of mock-devices which is a cross platform (Windows or OSX) Electron app. To use the Docker version, visit this repo [mock-devices DE](http://github.com/codetunez/mock-devices-de)

#### First time running the app - One Time Install and Build
From a command prompt navigate to the folder where the repo was sync'd. Perform the following command. Do this everytime the code is sync'd from the repo i.e. getting a new version of the app

        npm install && npm run build

#### Launching app (everyday use)
From a command prompt navigate to the folder where the repo was sync'd and perform the following command

        npm run app

#### Usage Instructions
Help is available inside the application

---

## v4 Features
v4 is a complete re-write of the UX with focus on improving responsive design layout, property management and UI performance.

_New UX_
- **File system support for state persistance and DCM import**
- Code base based on React Hooks
- Scrolling and layout improvements (rewrite of UI)
- Better arrangement of device property cards on small and large screens
- Larger console window with longer history and click through for full data payload inspection
- Start a new device model from a blank template
- Always available help

_Engine tweaks_
- Macro support of random data when sending complex value payloads
- Switch on/off individual properties without stopping device
- Future support for PnP Interfaces
- Auto Gen DTDL Complex Types; Objects/Maps/Arrays with random values from a DCM
- Better random string data
- Native support for Reboot, Shutdown and Firmware device commands

#### Features
- Supports up to 750 mock devices
- Support for DPS or Connection String based devices
- Use DPS group enrollment using root SaS key
- Create devices in bulk (using -_n_ numbering scheme)
- Create a device from a template or another modelled device
- Built-in simulated sensors that behave like real devices i.e. battery drain and heating elements
- Use a function/webhook to provide a value payload
- Devices auto-restart after 55 minutes to provide continuous streams of data
- State can be copied/replaced to allow sharing of simulation state

#### Macro support for Complex value payloads

- AUTO_STRING - Use a random word based of the random-words OSS library
- AUTO_INTEGER - Use a random integer between 1 and 5000
- AUTO_LONG - Use a random integer between 1 and 5000
- AUTO_DOUBLE - Use a random number with precision between 1 and 5000
- AUTO_FLOAT - Use a random number with precision between 1 and 5000
- AUTO_BOOLEAN - Use a random boolean
- AUTO_VALUE - Use the last user supplied or simulated sensor value