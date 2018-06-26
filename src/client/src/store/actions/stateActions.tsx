import { Data } from "../../data";
import * as Events from "../events"

export function getCurrentState() {
    return ((dispatch: any) => {
        return Data.GetCurrentState()
            .then((devices: any) => {
                dispatch({ type: Events.STATE_EXPORT, payload: devices });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function setNewState(payload: any) {
    return ((dispatch: any) => {
        return Data.SetNewState(payload)
            .then((devices: any) => {
                dispatch({ type: Events.STATE_IMPORT, payload: devices });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}