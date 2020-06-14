export const RESX = {
    "app": {
        "version": "v5.2"
    },
    "core": {
        "templateNoSupport": "This is not supported for templates. Create a mock device from this template to use this feature",
    },
    "nav": {
        "help": "Find out how to use mock-devices",
        "file": "Create or clone a new mock device or template utilizing DCMs, SDKs, DPS and Connection strings",
        "power": "Power up all devices that are currently off using randomized start times",
        "stop": "Power down all devices that are currently on",
        "sync": "Refresh the UX if out of sync with the device engine",
        "sim": "Reset the current configuration for the simulation (advanced)",
        "reset":"WARNING! Remove all mock devices and templates. Keeps the simulation configuration",
    },
    "selector": {
        "title": "DEVICES",
        "empty": ["Use ", " to add a new mock device, template or load/save/edit the state"],
        "card": {
            "device_title": "Select this mock device",
            "template_title": "Select this template",
        }
    },
    "device": {
        "empty": "Use + to add new capabilities such as sending telemetry or reporting/receiving twin data. Methods can be configured to send back a payload. Plan mode is disabled until capabilities are added",
        "toolbar": {
            "powerOn_label": " Turn on power",
            "powerOn_title": "Connect this mock device to the hub and start sending and receiving events",
            "powerOff_label": " Turn off power",
            "powerOff_title": "Disconnect this mock device from the hub and stop sending data",
            "kindTemplate": "Template for ",
            "kindReal": "Real device using ",
            "sdkLegacy": "current SDK",
            "sdkPnp": "PnP SDK (Digital Twins)",
        },
        "title": {
            "planMode": "Plan mode",
            "planMode_title": "Use plan mode create a series of timed send and receive events. Switching modes stops the device",
        },
        "commands": {
            "restart_label": "Restart plan",
            "restart_title": "Restarting plan will reset the device to the start of th plan",
            "sendData_label": " Send Data",
            "sendData_title": "Add a capability to send telemetry and twin reported values",
            "receiveData_label": " Receive Data",
            "receiveData_title": "Add a capability to receive a specific desired property in the device twin",
            "method_label": " Method",
            "method_title": "Add a direct or C2D method capability to the device. This will stop the device",
            "config_title": "Change this device's configuration (advanced)",
            "delete_title": "Delete this device or template including all its capabilities. Ensure you have saved your state first",
        },
        "card": {
            "save_label": "Save",
            "save_title": "Save changes to this capability",
            "delete_label": "Delete",
            "delete_title": "Delete this capability",
            "read_label": "Read",
            "read_title": "Read the last known twin value for this capability. Device must be on",
            "send_label": "Send",
            "send_title": "Send this value immediately bypassing runloop time and/or mock sensor value",
            "read_param_label": "Read",
            "read_param_title": "Read the last known set of parameters sent for this method capability",
            "waiting_placeholder": "Waiting ...",
            "save_pre_error": "Select or remove a sensor to update this property",
            "toggle": {
                "enabled_label": "Enabled",
                "enabled_title": "Enable this capability in the simulation (always enabled)",
                "complex_label": "Complex value",
                "complex_title": "Enable this to use a JSON value instead of a primitive",
                "interface_label": "Interface",
                "interface_title": "",
                "device_sdk_label": "Device SDK",
                "device_sdk_title": "Specify which API to use for sending data (Twin or Msg)",
                "runloop_label": "Loop",
                "runloop_title": "Send the value, complex or mock value on a timed loop. Send button will override value",
                "mock_label": "Mock",
                "mock_title": "Use a simulated sensor that behaves like a real world thing. Does not support complex value",
            },
            "send": {
                "property_label": "Capability name",
                "property_title": "The property name sent down the wire",
                "value_label": "Enter value",
                "value_title": "This is the value sent down the wire",
                "value_complex_label": "Cannot override complex",
                "value_mock_label": "Override mock",
                "value_complex_placeholder": "Using complex value",
                "value_mock_placeholder": "Using mock value",
                "complex_label": "JSON payload for the value of this capability",
                "complex_title": "See Help for full ist of AUTO macros available",
                "int_name_label": "Name",
                "int_name_title": "The PnP interface instance name. Can be duplicated across capabilities",
                "int_urn_label": "URN",
                "int_urn_title": "The PnP interface unique ID. Can be duplicated across capabilities",
                "api_label": "API",
                "api_title": "",
                "string_label": "Send as value string",
                "string_title": "Set to false for JSON, booleans, arrays",
                "unit_label": "Time unit",
                "unit_title": "Choose between minutes and seconds",
                "duration_label": "Duration",
                "duration_title": "The length of the time duration",
                "sensor_label": "Sensor",
                "sensor_title": "Select a simulated sensor that will be used as the value of this capability",
            },
            "method": {
                "title": "Method / Command",
                "property_label": "Method name",
                "property_title": "The name that",
                "int_name_label": "Name",
                "int_name_title": "The PnP interface instance name. Can be duplicated across capabilities",
                "int_urn_label": "URN",
                "int_urn_title": "The PnP interface unique ID. Can be duplicated across capabilities",
                "c2d_label": "Make C2D Command (off is Direct Method)",
                "c2d_title": "C2D commands are fire and forget from the server side. The mock-device will not send a response",
                "request_label": "Request parameter",
                "request_title": "The last known set of parameters received for this method",
                "response_label": "Response status to send (not for C2D)",
                "response_title": "The response status sent if this method is invoked (not C2D)",
                "response_payload_label": "Response payload to send",
                "response_payload_title": "The response payload returned if this method is invoked. C2D will use this if reporting via property too",
                "twin_rpt_label": "Send additional twin reported property using response payload",
                "twin_rpt_title": "A reported twin will be sent using the same name as the method",
            },
            "receive": {
                "title": "Receive twin (Desired)",
                "property_label": "Capability name",
                "property_title": "The property name received down the wire",
                "int_name_label": "Name",
                "int_name_title": "The PnP interface instance name. Can be duplicated across capabilities",
                "int_urn_label": "URN",
                "int_urn_title": "The PnP interface unique ID. Can be duplicated across capabilities",
                "version_label": "Last known Twin version",
                "version_title": "The $version number of the twin associated with this capability",
                "value_label": "Last known Twin value",
                "value_title": "The actual value of the twin",
            }
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
        "erase_title": "Clear the logging window",
    }
}