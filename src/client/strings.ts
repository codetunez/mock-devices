export const RESX = {
    "app": {
        "version": "v5.2"
    },
    "core": {
        "templateNoSupport": "This is not supported for templates. Create a device from this template to use this feature",
    },
    "nav": {
        "help": "Find out how to use mock-devices",
        "file": "Use a combination of templates, DCMs, SDKs and connectivity to create devices",
        "power": "Power up all devices that are currently off",
        "stop": "Stop any devices that are currently on",
        "sync": "Refresh the device engine and UX if out of sync",
        "sim": "Reset the current configuration for the simulation (advanced)",
    },
    "selector": {
        "title": "DEVICES",
        "empty": ["Use ", " to add a device, template or update the state"],
    },
    "device": {
        "empty": "Use + Reported/Desired/Method to send or receive data. Plan mode is disabled",
        "toolbar": {
            "powerOn_label": " Turn on power",
            "powerOn_tile": "The device will connect to the hub and will start sending and receiving events. If in plan mode, the start up properties will be sent",
            "powerOff_label": " Turn off power",
            "powerOff_title": "The device will disconnect from the hub and stop sending data",
            "kindTemplate": "Template for ",
            "kindReal": "Real device using ",
            "sdkLegacy": "current SDK",
            "sdkPnp": "PnP SDK (Digital Twins)"
        },
        "title": {
            "planMode": "Plan mode",
            "planMode_title": "Use plan mode create a series of timed send and receive events. Switching modes stops the device"
        },
        "commands": {
            "restart_label": "Restart plan",
            "restart_title": "Restarting plan will reset the device to the start of th plan",
            "sendData_label": " Send Data",
            "sendData_title": "Add a capability to send telemetry and twin reported values",
            "receiveData_label": " Receive Data",
            "receiveData_title": "Add a capability to receive a specific desired property in the device twin",
            "method_label": " Method",
            "method_title": "Add a direct or C2D method capability to the device",
            "config_title": "Change this device's configuration (advanced)",
            "delete_title": "Delete this device or template including all its capabilities. Ensure you have save your state first",
        },
        "plan": {
            "empty": {
                "startUp": "Click + to send a property at device startup",
                "timeline": "Click + to send a property at specific time",
                "random": "Click + to send a property at random intervals",
                "receive": "Click + to send a response to a C2D event",
            },
            "core": {
                "plan_label": "Plan",
                "startup_label": "Start up events",
                "timeline_label": "Timeline events",
                "random_label": "Random events",
                "receive_label": "Receive events",
                "loop_label": "Loop plan",
                "loop_title": "Executes the same set of event after the last one has finished",
                "savePlan_label": "Save plan",
                "savePlan_title": "Save the plan. This will stop the device and it will need to be manually restarted",
                "clearPlan_label": "Clear plan",
                "clearPlan_title": "Clear all the events in the plan",
            }
        }
    },
    "console": {
        "pause_title": "Play/Pause the logging window",
        "erase_title": "Clear the logging window"
    }
}