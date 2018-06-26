import { Data } from "../../data";
import * as Events from "../events"

export function GetMethodParams(deviceId: string, methodId: string) {
    return ((dispatch: any) => {
        return Data.GetMethodParams(deviceId, methodId)
            .then((params: any) => {
                dispatch({ type: Events.DEVICE_METHOD_PARAMS, payload: params });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}