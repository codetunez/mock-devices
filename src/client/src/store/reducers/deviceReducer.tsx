import * as Events from "../events"

export default function reducer(state: any = {
    device: null
}, action: any) {

    switch (action.type) {
        case Events.DISPLAY_DEVICE:
            return Object.assign({}, state, { device: action.payload });
        case Events.LOAD_DEVICE:
            return Object.assign({}, state, { device: action.payload });
        default:
            return Object.assign({}, state);;
    }
}