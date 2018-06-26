import * as Events from "../events"

export default function reducer(state: any = {
    devicePropertyId: null
}, action: any) {

    switch (action.type) {
        case Events.DEVICE_PROPERTY_DIRTY:
            return Object.assign({}, state, { devicePropertyId: action.payload });
        default:
            return Object.assign({}, state);
    }
}
