import * as Events from "../events"

export function ToggleNewDevicePanel(connectionString?: string, hubConnectionString?: string) {
    return { type: Events.TOGGLE_NEW_DEVICE_PANEL, payload: { connectionString: connectionString || null, hubConnectionString: hubConnectionString || null } };
}

export function ToggleIoTHubPanel(hubConnectionString: string) {
    return { type: Events.TOGGLE_IOTHUB_PANEL, payload: { hubConnectionString } };
}

export function ToggleEximportPanel() {
    return { type: Events.TOGGLE_EXIMPORT_PANEL };
}

export function ToggleServerPanel() {
    return { type: Events.TOGGLE_SERVER_PANEL };
}

export function ToggleProperty(id: string) {
    return { type: Events.TOGGLE_PROPERTY_PANEL, payload: id };
}

export function ToggleAllProperties(device: any) {
    return { type: Events.TOGGLE_ALL_PROPERTY_PANEL, payload: device };
}

export function CollapseAllProperties(device: any) {
    return { type: Events.COLLAPSE_ALL_PROPERTY_PANEL, payload: device };
}

export function ToggleConsole() {
    return { type: Events.TOGGLE_CONSOLE };
}

export function ToggleAdvanced() {
    return { type: Events.TOGGLE_ADVANCED_PANEL };
}

