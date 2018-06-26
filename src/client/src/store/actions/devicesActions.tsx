import { Data } from "../../data";
import * as Events from "../events"

export function RefreshDeviceLoad(devices: any) {
    return { type: Events.LOAD_DEVICES, payload: devices };
}

export function loadInitialState(currentSelected: number) {
    return ((dispatch: any) => {
        return Data.GetDevices()
            .then((devices: any) => {
                if (currentSelected > -1) {
                    dispatch({ type: Events.DISPLAY_DEVICE, payload: devices[currentSelected] });
                }
                dispatch({ type: Events.LOAD_DEVICES, payload: devices });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function StartAllDevices(currentSelected: number) {
    return ((dispatch: any) => {
        return Data.StartAllDevices()
            .then((devices: any) => {
                if (currentSelected > -1) {
                    dispatch({ type: Events.DISPLAY_DEVICE, payload: devices[currentSelected] });
                }
                dispatch({ type: Events.LOAD_DEVICES, payload: devices });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function StopAllDevices(currentSelected: number) {
    return ((dispatch: any) => {
        return Data.StopAllDevices()
            .then((devices: any) => {
                if (currentSelected > -1) {
                    dispatch({ type: Events.DISPLAY_DEVICE, payload: devices[currentSelected] });
                }
                dispatch({ type: Events.LOAD_DEVICES, payload: devices });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}