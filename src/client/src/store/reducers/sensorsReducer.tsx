import * as Events from "../events"

export default function reducer(state: any = {
    sensors: []
}, action: any) {

    switch (action.type) {
        case Events.LOAD_SENSORS:
            return Object.assign({}, state, { sensors: action.payload });
        default:
            return Object.assign({}, state);
    }
}
