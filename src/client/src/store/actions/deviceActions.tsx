import { Data } from "../../data";
import * as Events from "../events"

export interface NewDevicePayload {
    name: string;
    connectionString: string;
}

export interface UpdatedDevicePayload {
    name: string;
    connectionString: string;
    hubConnectionString: string;
}

export interface AddPropertyPayload {
    type: 'd2c' | 'c2d'
}

export function DisplaySelectedDevice(device: any) {
    return ((dispatch: any) => {
        return Data.GetDevice(device._id)
            .then((device: any) => {
                // this dispath ordering doesn't matter
                dispatch({ type: Events.DISPLAY_DEVICE, payload: device });
                dispatch({ type: Events.UPDATE_DEVICE, payload: device });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
            })
            .catch((error: any) => {
                console.log(error.message);
                throw (error);
            })
    })
}

export function SelectDevice(index: number) {
    return { type: Events.SELECTED_INDEX_DEVICE, payload: index };
}

export function CreateDevice(newDevicePayload: NewDevicePayload) {
    return ((dispatch: any) => {
        return Data.CreateDevice(newDevicePayload)
            .then((devices: any) => {
                dispatch({ type: Events.LOAD_DEVICES, payload: devices });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });                
            })
            .catch((error: any) => {
                console.log(error.message);
                throw (error);
            })
    })
}

export function UpdateDevice(deviceId: string, updatedDevicePayload: UpdatedDevicePayload) {
    return ((dispatch: any) => {
        return Data.UpdateDevice(deviceId, updatedDevicePayload)
            .then((devices: any) => {
                dispatch({ type: Events.LOAD_DEVICES, payload: devices });

                let d = GetDevice(deviceId, devices);
                if (d != null) {
                    dispatch({ type: Events.DISPLAY_DEVICE, payload: d });
                    dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
                }
            })
            .catch((error: any) => {
                console.log(error.message);
                throw (error);
            })
    })
}

export function DeleteDevice(deviceId: string) {
    return ((dispatch: any) => {
        return Data.DeleteDevice(deviceId)
            .then((devices: any) => {
                dispatch({ type: Events.LOAD_DEVICES, payload: devices });
                dispatch({ type: Events.DISPLAY_DEVICE, payload: null });
                dispatch({ type: Events.SELECTED_INDEX_DEVICE, payload: -1 });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
            })
            .catch((error: any) => {
                console.log(error.message);
                throw (error);
            })
    })
}

export function StartDevice(deviceId: string) {

    return ((dispatch: any) => {
        return Data.StartDevice(deviceId)
            .then((devices: any) => {
                dispatch({ type: Events.LOAD_DEVICES, payload: devices });

                let d = GetDevice(deviceId, devices);
                if (d != null) {
                    dispatch({ type: Events.DISPLAY_DEVICE, payload: d });
                    dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
                }
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function StopDevice(deviceId: string) {
    return ((dispatch: any) => {
        return Data.StopDevice(deviceId)
            .then((devices: any) => {
                dispatch({ type: Events.LOAD_DEVICES, payload: devices });

                let d = GetDevice(deviceId, devices);
                if (d != null) {
                    dispatch({ type: Events.DISPLAY_DEVICE, payload: d });
                    dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
                }
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function AddDeviceProperty(deviceId: string, addPropertyPayload: AddPropertyPayload) {
    return ((dispatch: any) => {
        return Data.CreateDeviceProperty(deviceId, addPropertyPayload)
            .then((device: any) => {
                dispatch({ type: Events.DISPLAY_DEVICE, payload: device });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function AddDeviceMethod(deviceId: string) {
    return ((dispatch: any) => {
        return Data.CreateDeviceMethod(deviceId)
            .then((device: any) => {
                dispatch({ type: Events.DISPLAY_DEVICE, payload: device });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function UpdateDeviceProperty(deviceId: string, propertyId: string, payload: any) {
    return ((dispatch: any) => {
        return Data.updateDeviceProperty(deviceId, propertyId, payload)
            .then((device: any) => {
                dispatch({ type: Events.DISPLAY_DEVICE, payload: device });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function UpdateDeviceMethod(deviceId: string, methodId: string, payload: any) {
    return ((dispatch: any) => {
        return Data.updateDeviceMethod(deviceId, methodId, payload)
            .then((device: any) => {
                dispatch({ type: Events.DISPLAY_DEVICE, payload: device });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function DeleteDeviceProperty(deviceId: string, propertyId: string) {
    return ((dispatch: any) => {
        return Data.DeleteDeviceProperty(deviceId, propertyId)
            .then((device: any) => {
                dispatch({ type: Events.DISPLAY_DEVICE, payload: device });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function DeleteDeviceMethod(deviceId: string, methodId: string) {
    return ((dispatch: any) => {
        return Data.DeleteDeviceMethod(deviceId, methodId)
            .then((device: any) => {
                dispatch({ type: Events.DISPLAY_DEVICE, payload: device });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function AddDevicePropertyMock(deviceId: string, propertyId: string) {
    return ((dispatch: any) => {
        return Data.CreateDevicePropertyMock(deviceId, propertyId)
            .then((device: any) => {
                dispatch({ type: Events.DISPLAY_DEVICE, payload: device });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function DeleteDevicePropertyMock(deviceId: string, propertyId: string) {
    return ((dispatch: any) => {
        return Data.DeleteDevicePropertyMock(deviceId, propertyId)
            .then((device: any) => {
                dispatch({ type: Events.DISPLAY_DEVICE, payload: device });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function SendDeviceProperty(deviceId: string, propertyId: string, payload: any) {
    return ((dispatch: any) => {
        return Data.SendDeviceProperty(deviceId, propertyId, payload)
            .then((device: any) => {
                dispatch({ type: Events.DISPLAY_DEVICE, payload: device });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}

export function GetDeviceProperty(deviceId: string, propertyId: string) {
    return ((dispatch: any) => {
        return Data.GetDeviceProperty(deviceId, propertyId)
            .then((device: any) => {
                dispatch({ type: Events.DISPLAY_DEVICE, payload: device });
                dispatch({ type: Events.DEVICE_PROPERTY_DIRTY, payload: null });                
            })
            .catch((error: any) => {
                throw (error);
            })
    })
}


/* need to think this one through */
function GetDevice(deviceId: string, devices: Array<any>) {
    let d = null;
    for (let i = 0; i < devices.length; i++) {
        if (devices[i]._id === deviceId) {
            d = devices[i];
            break;
        }
    }
    return d;
}

