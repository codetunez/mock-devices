import * as Events from "../events"

export default function reducer(state: any = {
    devices: []
}, action: any) {

    switch (action.type) {
        case Events.LOAD_DEVICES:
            return Object.assign({}, state, { devices: action.payload });
        case Events.UPDATE_DEVICE:
            // this keeps the list up to date
            var newDevices = state.devices.map((item) => {
                return action.payload._id === item._id ? action.payload : item;
            })
            return Object.assign({}, state, { devices: newDevices });
        default:
            return Object.assign({}, state);
    }
}
