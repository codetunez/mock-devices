import * as Events from "../events"

export default function reducer(state: any = {
    state: null
}, action: any) {

    switch (action.type) {
        case Events.STATE_EXPORT:
            return Object.assign({}, state, { state: action.payload });
        default:
            return Object.assign({}, state);;
    }
}


