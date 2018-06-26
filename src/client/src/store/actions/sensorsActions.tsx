import { Data } from "../../data";
import * as Events from "../events"

export function RefreshSensorLoad(sensors: any) {
    return { type: Events.LOAD_SENSORS, payload: sensors };
}

export function LoadSensors() {
    return ((dispatch: any) => {
        return Data.GetSensors()
            .then((sensors: any) => {
                dispatch(RefreshSensorLoad(sensors));
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}
