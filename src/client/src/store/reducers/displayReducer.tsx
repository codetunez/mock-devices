import * as Events from "../events"

export default function reducer(state: any = {
    showDevicePanel: false,
    showExImportPanel: false,
    showServerPanel: false,
    showIotHubPanel: false,
    deviceSelectedIndex: -1,
    connectionString: null,
    hubConnectionString: null,
    propertyToggle: {},
    propertyToggleAll: true,
    consoleExpanded: false,
    advancedExpanded: false
}, action: any) {

    let s = JSON.parse(JSON.stringify(state));

    switch (action.type) {
        case Events.TOGGLE_NEW_DEVICE_PANEL:
            return Object.assign(s, {
                connectionString: action.payload.connectionString,
                hubConnectionString: action.payload.hubConnectionString,
                showDevicePanel: !state.showDevicePanel,
                showExImportPanel: false,
                showServerPanel: false,
                showIotHubPanel: false
            });
        case Events.TOGGLE_EXIMPORT_PANEL:
            return Object.assign(s, {
                showDevicePanel: false,
                showExImportPanel: !state.showExImportPanel,
                showServerPanel: false,
                showIotHubPanel: false
            });
        case Events.TOGGLE_SERVER_PANEL:
            return Object.assign(s, {
                showDevicePanel: false,
                showExImportPanel: false,
                showServerPanel: !state.showServerPanel,
                showIotHubPanel: false,
            });
        case Events.TOGGLE_IOTHUB_PANEL:
            return Object.assign(s, {
                showDevicePanel: false,
                showExImportPanel: false,
                showServerPanel: false,
                showIotHubPanel: !state.showIotHubPanel,
            });
        case Events.SELECTED_INDEX_DEVICE:
            return Object.assign(s, { deviceSelectedIndex: action.payload });
        case Events.TOGGLE_PROPERTY_PANEL:
            if (!s.propertyToggle[action.payload]) {
                s.propertyToggle[action.payload] = true;
            } else { s.propertyToggle[action.payload] = !s.propertyToggle[action.payload];; }
            return s;
        case Events.TOGGLE_ALL_PROPERTY_PANEL:
            for (let i = 0; i < action.payload.comms.length; i++) {
                s.propertyToggle[action.payload.comms[i]._id] = s.propertyToggleAll;
            }
            s.propertyToggleAll = !s.propertyToggleAll;
            return s;
        case Events.TOGGLE_CONSOLE:
            return Object.assign(s, { consoleExpanded: !s.consoleExpanded });
        case Events.TOGGLE_ADVANCED_PANEL:
            return Object.assign(s, { advancedExpanded: !s.advancedExpanded });
        default:
            return s;
    }
}