export const RESX = {
    "app": {
        "version": "v10"
    },
    "core": {
        "templateNoSupport": "This is not supported for templates. Create a mock device from this template to use this feature",
        "edgeNoSupport": "For Edge devices, the modules support this mode but only when running within the Edge runtime",
        "deviceL": "device",
        "deviceU": "Device",
    },
    "banner": {
        "connect": "CONNECTED TO: ",
        "local": "(local)",
        "edge": ['EDGE RUNTIME DETECTED: ', 'MODULE', 'RUNNING ON DEVICE'],
    },
    "shell": {
        "title": "Select Devices, Stats, Add/Save or Connect from the menu on the left"
    },
    "nav": {
        "stats": ["STATS", "See the current send/recieve/power usage statistics for each device"],
        "devices": ["DEVICES", "See the list of devices, modules and templates"],
        "file": ["ADD/SAVE", "Create a new mock devices, templates or modules. Load/Save the current state of mock-devices"],
        "connect": ["CONNECT", "Connect to a Central application or IoT Hub, use a template and create a mock-device"],
        "power": ["PWR ALL", "Power up all devices and modules (use config for start timings)"],
        "stop": ["STOP ALL", "Power down all devices that are currently on"],
        "bulk": ["BULK", "Bulk edit and apply common properties across a set of devices"],
        "sim": ["SIM", "Update the current simulation configuration (advanced)"],
        "reset": ["RESET", "WARNING! Remove all mock devices, modules and templates (keeps the simulation configuration)"],
        "help": ["HELP", "Find out how to use mock-devices"],
        "ux": ["UX", "Change the mock-devices engine that this UX is viewing"],

    },
    "selector": {
        "title": "DEVICES & TEMPLATES",
        "empty": ["Use ", " to add a new mock device, template or load/save/edit the state"],
        "card": {
            "device_title": "Select this mock device",
            "template_title": "Select this template",
            "children_title": " children"
        },
    },
    "modal": {
        "OK": "OK",
        "YES": "Yes",
        "NO": "No",
        "CANCEL": "Cancel",
        "error_json": "JSON has errors",
        "save_error_title": "Update or save error",
        "save_first": "Please save or revert the capability currently being edited",
        "save_sensor_first": "Please select a sensor before saving this capability",
        "delete_title": "Delete",
        "delete_capability": "Do you want to delete this capability?",
        "delete_all": "Do you want to remove all devices, modules and templates (this does not reset the simulation configuration changes)?",
        "delete_edge": "Do you want to delete this Edge device?",
        "delete_template": "Do you want to delete this template?",
        "delete_device": "Do you want to delete this device?",
        "delete_module": "Do you want to delete this Edge module?",
        "plugin": "Plugin",
        "add": {
            "option1": {
                "title": "Add a mock device",
                "buttons": {
                    "button1_label": "Use DPS",
                    "button1_title": "Create the device using the DPS configuration",
                    "button2_label": "Use Connection string",
                    "button2_title": "Create the device using the a IoT device connection",
                    "button3_label": "Sample device",
                    "button3_title": "Create the device using a sample device configuration and provision using DPS",
                    "button4_label": "QR Code",
                    "button4_title": "Use an QR code image to create and provision a device (see Help for format)",
                },
                "select": "--Do not fork. Create with empty capabilities",
                "label": {
                    "clone": "Fork another mock device or template",
                    "deviceId": "Device ID (-# appended in bulk create)",
                    "dps": "Scope ID",
                    "sas": "SaS key",
                    "root": "Root key",
                    "dps_blob": "DPS blob payload",
                    "bulk_from": "Bulk from # (need Root Key)",
                    "bulk_to": "Bulk to # (need Root Key)",
                    "friendly": "mock-devices friendly name (-# appended in bulk create)",
                    "connstr": "Device connection string",
                    "friendly_sm": "mock-devices friendly name",
                    "quick": "Create a sample mock device with some pre-configured capabilities and connect to a hub using DPS. The DTDL JSON for the device's config/model can be downloaded at",
                    "quick_url": "https://raw.githubusercontent.com/codetunez/mock-devices/master/deviceModel.json",
                    "deviceQuick": "Device ID",
                    "deviceQuick_placeholder": "Leave blank to auto-generate if using root key",
                },
                "cta_title": "Create this device",
                "cta_label": "Create this mock device",
            },
            "option2": {
                "title": "Add a template",
                "buttons": {
                    "button1_label": "Use a DTDLv1 or DTDLv2 DCM",
                    "button1_title": "Create a new template from a DTDLv1 or DTDLv2 model (DCM)",
                    "button2_label": "Start new Template",
                    "button2_title": "Create a new empty (or cloned) template",
                },
                "label": {
                    "name": "mock-devices template Name",
                    "name_placeholder": "Leave blank to use the file's DCM displayName",
                    "browse": "Browse disk for a DCM",
                    "catalog": "Select a DCM",
                    "catalog_sample": "Sample device DCM"
                },
                "cta_title": "Create this template",
                "cta_label": "Create template",
            },
            "option3": {
                "title": "State",
                "buttons": {
                    "button1_label": "Load/Save from file system",
                    "button1_title": "Load or save a state file",
                    "button2_label": "Editor",
                    "button2_title": "Create a new empty (or cloned) template",
                },
                "label": {
                    "state": "Load a state file",
                    "merge": "Merge Devices (keeps current Simulation config)",
                    "browse": "Browse for file",
                    "state_save": "Save a state file",
                    "browse_folder": "Browse folder",
                    "copy": "Copy/Paste the State's JSON",
                },
                "cta_title": "Replace the current and state and reset the simulator",
                "cta_label": "Update current State",
            },
            "option4": {
                "title": "Azure IoT Edge",
                "buttons": {
                    "button1_label": "Create Edge leaf devices and modules",
                    "button1_title": "Create an Edge host device to add Edge modules. To use modules, deploy mock-devices-de with the state file in a real Edge deployment",
                },
                "select": "--Do not fork. Create with empty capabilities",
                "label": {
                    "deviceId": "Edge Device ID (same as config.yaml)",
                    "friendly": "mock-devices friendly name",
                },
                "cta_title": "The Edge device is a host for modules and is not a real device. The Device Id and Module Id need to be the same as the ones in the manifest file",
                "cta_label": "Create this Edge device",
            },
            "option8": {
                "title": "Load a QR Code from an image file",
                "label": {
                    "display_name": "Display Name",
                    "scope_id": "Scope ID",
                    "device_id": "Device ID",
                    "sas_key": "Sas Key",
                    "template_id": "IoT Central Template ID",
                },
                "cta_text": "Load image...",
            },
            "error_generic_add": "Check configuration, max devices reached or possible duplicate device",
            "error_state": "State cannot be updated. Format is not valid",
            "error_file": "State file did not save",
        },
        "console": {
            "text1": ["From", "of"]
        },
        "edit": {
            "title1": "Update configuration",
            "text1": "Update the connection details of this mock device",
            "update1_label": "Update configuration",
            "update1_title": "Stops the device. Requires a restart for new setting to take effect",
            "title2": "Update this mock device's position",
            "update2_label": "Change position",
            "update2_title": "Move the position of the device or template in the list",
        },
        "simulation": {
            "title": "Simulation",
            "text1": "These are the default values used when a new mock device, module, template or capability is created. Settings to the engine such as start times can be adjusted here",
            "error_load": "Simulation data cannot be loaded",
            "error_save": "Simulation data cannot be saved",
            "configuration_label": "Configuration",
            "reset_label": "Reset simulation",
            "reset_title": "Stops all devices, resets the engine and applies the new simulation changes",
        },
        "module": {
            "title": "Add a new module",
            "select": "--Do not clone. Create module with no capabilities",
            "label": {
                "clone": "Clone another mock device or use a template",
                "moduleId": "Module ID",
            },
            "cta_title": "Create this module",
            "cta_label": "Add this module to the Edge device",
        },
        "ux": {
            "title": "Change the mock-devices engine",
            "warning": "This action will refresh the application",
            "label": {
                "server": "The server + port of the engine",
                "mode": "Reporting mode of bound engine [ux|server|mixed]",
                "mode_placeholder": "Leave empty for default",
            },
            "cta_title": "Change the UX to use a different mock-devices engine. This is useful if you run the mock-devices-de",
            "cta_label": "Change",
            "cta2_title": "Reset the UX to use the default mock-devices engine",
            "cta2_label": "Reset to default",
        },
        "reapply": {
            "title1": "Reapply this template to devices and modules",
            "title2": "Select the specific devices or modules. Use the SHIFT and CTRL keys to select multiple items. WARNING: Selected device(s)/module(s) will be reconfigured with this template's capability setup. Connection configuration will remain untouched",
            "selectAll": "Select all the devices and modules",
            "apply_label": "Apply",
            "apply_title": "Update the selected devices with this template. Any changed device will be stopped and will need to be manually restarted",
        },
        "connect": {
            "title": "Connect",
            "central": {
                "subtitle": "Using an IoT Central API token, select a template from an IoT Central application and create/register a new mock device for the application",
                "label": {
                    "appUrl": "App Name + DNS",
                    "token": "API Token",
                    "deviceId": "Device ID",
                    "deviceId_placeholder": "New or existing ID",
                    "deviceId_block": "Block if exists",
                    "templates": "Published device templates",
                    "loading": "Loading published device templates",
                },
                "cta_title": "Get the list of templates from this IoT Central application",
                "cta_label": "Get Templates",
                "cta2_title": "Use this template to create a mock device nd register in IoT Central",
                "cta2_label": "Create and add to application",
                "cta3_title": "Use this device to create Device Template in IoT Central and create a new device in the application",
                "cta3_label": "Publish template and add the device to the application",
            },
            "hub": {
                "subtitle": 'IoT Hub integration not supported yet',
            },
        },
        "device": {
            "add_capability_title": "Add capability error"
        },
        "bulk": {
            "title": "Bulk update",
            "select_all_devices": "Select all devices",
            "select_all_caps": "Select all capabilities",
            "cta_label": "Apply all changes",
            "cta_title": "Items need to be checked to be included in the update. Blanks will be treated as empty string/object or zero. Toggles will update any true/false setting regardless of current state",
        }
    },
    "edge": {
        "title": "Azure IoT Edge simulated configuration",
        "empty": [
            "Use + to add a new module or a leaf device. They are configured in the same way as regular mock-devices items",
            "Modules can be for desktop use or be hosted as part of a Docker deployment. Modules within mock-devices are best suited to Protocol translation scenarios.",
            "For desktop, modules will connect with the host Edge device credentials propergating the MODULE_ID through the connection string. All desktop configured modules will run as part of the simulation. For Docker versions, the module id and host Edge device id must be identicle to manifest JSON file and only that module will execute for the given container. Run multiple mock-devices modules/containers to execute all modules.",
            "Leaf devices require their own (DPS) credentials and will propergate the host Edge's device id as a GATEWAY_ID throught the connection string. All leaf devices execute as part of the simulation can run independently of the host Edge device. Leaf devices are best suited for Transparent Gateway scenarios."
        ],
        "buttons": {
            "module_title": "Select this module",
            "delete_label": "Delete",
            "delete_title": "Delete this module from the Edge device",
            "delete_confirm": "Are you OK to delete this module?"
        },
        "card": {
            "title_module": "Module",
            "title_device": "Device"
        },
    },
    "device": {
        "empty": "Use + to add new capabilities such as sending telemetry or reporting/receiving twin data. Methods can be configured to send back a payload. Plan mode is disabled until capabilities are added",
        "toolbar": {
            "powerOn_label": " Turn on power",
            "powerOn_title": "Connect this mock device to the hub and start sending and receiving events",
            "powerOff_label": " Turn off power",
            "powerOff_title": "Disconnect this mock device from the hub and stop sending data",
            "reapply_label": "Reapply template",
            "reapply_title": "Select devices to update with this template's configuration",
            "kindTemplate": "Template",
            "kindReal": "Hub device",
            "kindEdge": "Edge/Gateway device",
            "kindModule": "Edge module",
            "kindEdgeDevice": "Edge leaf device",
        },
        "title": {
            "planMode": "PLAN",
            "planMode_title": "Use plan mode create a series of timed send and receive events for all of the device capabilities. Switching modes stops the device and only the active mode runs",
            "interactiveMode": "INTERACTIVE",
            "interactiveMode_title": "Use interactive mode to setup each of the device's capabilities and/or send specific values. Switching modes stops the device and only the active mode runs",
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
            "module_label": " Module",
            "module_title": "Add a module to the Edge device",
            "config_title": "Change this device's configuration (advanced)",
            "delete_title": "Delete this device or template including all its capabilities. Ensure you have saved your state first",
            "delete_confirm": "Are you OK to delete this device or template?",
            "edge_device_label": "Go to Edge/Gateway",
            "edge_device_title": "Manage the other modules in this Edge device",

        },
        "card": {
            "save_label": "Save",
            "save_title": "Save changes to this capability",
            "delete_label": "Delete",
            "delete_title": "Delete this capability",
            "revert_label": "Revert",
            "revert_title": "Revert the current changes to this capability",
            "delete_confirm": "Are you OK to delete this capability?",
            "read_label": "Read",
            "read_title": "Read the last known twin value for this capability. Device must be on",
            "send_label": "Send",
            "send_title": "Send this value immediately bypassing runloop time and/or mock sensor value",
            "read_param_label": "Read",
            "read_param_title": "Read the last known set of parameters sent for this method capability",
            "waiting_placeholder": "Waiting ...",
            "color_title": "Pick a color for this capability in mock-devices",
            "color_label": "Color",
            "add_snippet_title": "Add snippet:",
            "select": "--Select",
            "noselect": "--No send capability",
            "toggle": {
                "enabled_label": "Enabled",
                "enabled_title": "Enable this capability in the simulation (always enabled)",
                "complex_label": "Complex value",
                "complex_title": "Enable this to use a JSON value instead of a primitive",
                "device_sdk_label": "Device SDK",
                "device_sdk_title": "Specify which API to use for sending data (Twin or Msg)",
                "runloop_label": "Loop",
                "runloop_title": "Send the value, complex or mock value on a timed loop without the need to press Send. Send button + value field can be used to override the current automated value",
                "mock_label": "Mock",
                "mock_title": "Use a simulated sensor that behaves like a real world thing. Ignores current value field but can be overridden. Does not support complex values",
                "component_label": "Component",
                "component_title": "Use a component name for this capability",
                "initial_label": "Initial",
                "initial_title": "Enable this to send the value when the device powers on",
                "override_label": "Use Earliest and Latest from simulation configuration",
                "override_title": "Enable this to use the value to define the loop duration from the simulation config. If a duration is already set you will need to reset to clear the current duration",
            },
            "title": {
                "ux_label": "Customize UX",
                "desired_label": "Desired Twin",
                "ack_label": "Ack Response",
                "method_ack_label": "Method Response",
                "method_ack_params_label": "Method Params",
                "execution_label": "Execution",
            },
            "send": {
                "title_telemetry": "Telemetry",
                "title_report": "Twin Reported",
                "property_label": "Capability name",
                "property_title": "This is the name of the capability sent to the hub",
                "value_label": "Enter value",
                "value_plugin_label": "Send value to the plugin",
                "value_title": "Use this field to define a value to use with the Send button. Mock sensors will use their own value but can be overridden using Send. A plugin will receive this value but can decide to ignore and keep this value to send",
                "value_placeholder": "Enter a value",
                "value_mock_label": "Override mock value",
                "value_mock_placeholder": "Using mock value",
                "complex_label": "JSON payload for the value of this capability",
                "complex_plugin_label": "Send this JSON payload to the plugin",
                "complex_title": "See Help for full ist of AUTO macros available",
                "complex_plugin_title": "The plugin will receive this payload and decide what it wants to send back. If it decides not too, this payload will be sent",
                "api_label": "API",
                "api_title": "Choose between the Msg/Event API or the Twin API of the device SDK",
                "string_label": "Send value as string",
                "string_title": "Set to false for JSON, booleans, arrays",
                "unit_label": "Time unit",
                "unit_title": "Choose between minutes and seconds",
                "duration_label": "Earliest",
                "duration_title": "The engine will use this as the earliest possibly time the value will be sent. Make Earliest and Latest the same to send at a specific time. Recalculates on save",
                "reset_duration_label": "Reset",
                "reset_duration_title": "Clears the loop duration so it can be recalculated",
                "duration_max_label": "Latest",
                "duration_max_title": "The engine will use this as the latest possibly time the value will be sent. Make Earliest and Latest the same to send at a specific time. Recalculates on save",
                "sensor_label": "Sensor",
                "sensor_title": "Select a simulated sensor that will be used as the value of this capability",
                "sensor_generic_title": "Click to configure the sensor",
                "component_label": "Component Name",
                "component_title": "Send this capability as part of a component",
                "initial_label": "Send value when device powers on",
                "initial_title": "The current value will be send when the device is powered on",
                "initial_plugin_label": "Send value to the plugin when device powers on",
            },
            "method": {
                "title_direct": "Direct Method",
                "title_c2d": "C2D Command",
                "property_label": "Method name",
                "property_restart_label": "Method name (change will power down device)",
                "property_title": "The name that is used to invoke the method remotely. Changing the name of a direct method will require a device restart",
                "c2d_label": "Make C2D Command (off is Direct Method)",
                "c2d_title": "C2D commands are fire and forget from the server side. The mock-device will not send a response",
                "request_label": "Last known request parameter",
                "request_title": "The last known set of parameters received for this method",
                "response_label": "Status code to send",
                "response_title": "The response status sent if this method is invoked (not C2D)",
                "response_payload_label": "Payload to send",
                "response_payload_title": "The response payload returned if this method is invoked. C2D will use this if reporting via property too",
                "twin_rpt_label": "Use a capability to send an additional response",
                "twin_rpt_title": "The capability will be sent after the method request has been processed",
                "property_report_label": "Select capability",
                "property_report_title": "Use an existing capability as the property to send an ack back. Telemetry and Twin Reported can be used for the ack",
                "component_label": "Component Name (change will power down device)",
                "component_title": "This capability is part of a component. Changing the component of a direct method will require a device restart",
            },
            "receive": {
                "title": "Twin Desired",
                "property_label": "Capability name",
                "property_title": "The property name received down the wire",
                "version_label": "Last known desired version",
                "version_title": "The properties/desired/$version of the twin associated with this device",
                "value_label": "Last known desired value",
                "value_title": "The value at the properties/desired/<name> of the twin associated with this device",
                "twin_rpt_label": "Use a capability to send a response",
                "twin_rpt_title": "The capability will be sent after the desired is received (Read is not required)",
                "property_report_label": "Select capability",
                "property_report_title": "Use an existing capability as the property to send an ack back. Telemetry and Twin Reported can be used for the ack",
                "property_version_label": "Override capability's current value",
                "property_version_title": "Ignore the current capability's configuration and use a custom value",
                "property_convention_label": "Do not apply value wrapping on Ack Response",
                "property_convention_title": "Turning this off will wrap the sent value in a value JSON property/object",
                "property_version_payload_label": "Value (can be literal/JSON/Array)",
                "property_version_payload_title": "See Help for full ist of AUTO macros available",
                "component_label": "Component Name",
                "component_title": "This capability is part of a component"
            }
        },
        "plan": {
            "empty": {
                "plan_label": "A plan allows you to configure a timeline of send events with values to create repeatable device behavior. Values, loops and mocks from interactive mode are not applicable in plan mode",
                "startup_label": "Start up events are capability values that are sent to the hub when the device first powers up",
                "timeline_label": "Timeline events are capability values that are sent to the hub at a specific duration after the device powers up",
                "random_label": "Random events are capability values that are sent to the hub at some time between the first and last timeline event. Repeated if range is small",
                "receive_label": "Receive events create responses to capabilities that can be called or set remotely",
            },
            "core": {
                "plan_label": "Plan",
                "value_placeholder": "Enter Value/JSON/AUTO",
                "remove_label": "Remove",
                "remove_title": "Remove this event",
                "startup_label": "Start up events",
                "startup_title": "Click to add a telemetry or twin reported start up event",
                "timeline_label": "Timeline events",
                "timeline_title": "Click to add a telemetry or twin reported timed event",
                "random_label": "Random events",
                "random_title": "Click to add a telemetry or twin random timed event",
                "receive_label": "Receive events",
                "receive_title": "Click to add a desired twin or method receive event",
                "loop_label": "Loop plan",
                "loop_title": "Execute the same set of events after the final event has completed",
                "savePlan_label": "Save plan",
                "savePlan_title": "Save the plan. This will stop the device and it will need to be manually restarted",
                "clearPlan_label": "Clear plan",
                "clearPlan_title": "Clear all the events in the plan",
            },
            "headers": {
                "property_label": "Capability",
                "property_title": "The capability to send using the API/SDK setup from interactive mode",
                "value_label": "Value to send",
                "value_title": "A custom value ignoring values from interactive mode. Supports AUTO macros and can be JSON",
                "time_start_label": "Start time",
                "time_start_title": "The time in seconds to send the event time after the device has powered on",
                "from_label": "Between (from)",
                "from_title": "The earliest time in seconds to send the random event",
                "to_label": "Between (to)",
                "to_title": "The latest time in seconds to send the random event",
                "property_in_label": "Capability receive",
                "property_in_title": "The capability to respond to. Could be desired twin, direct method or C2D command",
                "property_out_label": "Capability send",
            }
        }
    },
    "console": {
        "pause_title": "Play/Pause the logging window",
        "erase_title": "Clear the logging window",
    },
    "dashboard": {
        "title": "STATISTICS",
        "waiting": "Waiting for data fetch ...",
        "nodata": "No Data"
    },
    "UI": {
        "STATS": {
            "ON": "Power On",
            "OFF": "Power Off",
            "MSG_FIRST": "First msg sent",
            "MSG_LAST": "Latest msg sent",
            "MSG_COUNT": "# of msgs sent",
            "MSG_RATE": "Msgs sent p/min",
            "TWIN_FIRST": "First Twin sent",
            "TWIN_LAST": "Latest Twin sent",
            "TWIN_COUNT": "# of Twins sent",
            "TWIN_RATE": "Twins sent p/min",
            "CONNECTS": "Connect success",
            "COMMANDS": "Direct method received",
            "C2D": "Cloud-to-device received",
            "RESTART": "Sim restarted",
            "ERRORS": "Connect/SDK errors",
            "RECONFIGURES": "Number of edits",
            "DPS": "DPS success",
            "DESIRED": "Twin received"
        }
    }
}