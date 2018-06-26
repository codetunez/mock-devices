import * as Events from "../events"

export default function reducer(state: any = {
    methodParams: {}
}, action: any) {

    switch (action.type) {
        case Events.DEVICE_METHOD_PARAMS:
            return Object.assign({}, state, { methodParams: action.payload });
        default:
            return Object.assign({}, state);
    }
}