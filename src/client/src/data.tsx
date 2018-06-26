import axios from 'axios';

export class Data {

    public static GetSensors = () => {
        return Data.Http('/api/sensors', 'GET');
    }

    public static GetDevices = () => {
        return Data.Http('/api/devices', 'GET');
    }

    public static StartAllDevices = () => {
        return Data.Http('/api/devices/start', 'GET');
    }

    public static StopAllDevices = () => {
        return Data.Http('/api/devices/stop/', 'GET');
    }

    // payload : { connectionString: "", name: "" }
    public static CreateDevice = (payload: any) => {
        return Data.Http('/api/device/new', 'POST', payload);
    }

    public static GetDevice = (deviceId: any) => {
        return Data.Http('/api/device/' + deviceId, 'GET');
    }

    public static StartDevice = (deviceId: any) => {
        return Data.Http('/api/device/' + deviceId + '/start', 'GET');
    }

    public static StopDevice = (deviceId: any) => {
        return Data.Http('/api/device/' + deviceId + '/stop', 'GET');
    }

    public static DeleteDevice = (deviceId: any) => {
        return Data.Http('/api/device/' + deviceId + '/delete', 'POST', null);
    }

    // payload : { name: "" }
    public static RenameDevice = (deviceId: string, payload: any) => {
        return Data.Http('/api/device/' + deviceId + '/rename', 'POST', payload);
    }

    // payload : { type : "d2c" | "c2d" }
    public static CreateDeviceProperty = (deviceId: string, payload: any) => {
        return Data.Http('/api/device/' + deviceId + '/property/new', 'POST', payload);
    }

    // payload : 
    public static CreateDeviceMethod = (deviceId: string) => {
        return Data.Http('/api/device/' + deviceId + '/method/new', 'POST', null);
    }

    // payload : { name: "", connectionString: "", hubConnectionString: "" }
    public static UpdateDevice = (deviceId: string, payload: any) => {
        return Data.Http('/api/device/' + deviceId, 'PUT', payload);
    }

    // payload : 
    public static DeleteDeviceProperty = (deviceId: string, propertyId: string) => {
        return Data.Http('/api/device/' + deviceId + '/property/' + propertyId, 'DELETE', null);
    }

    // payload : 
    public static DeleteDeviceMethod = (deviceId: string, methodId: string) => {
        return Data.Http('/api/device/' + deviceId + '/method/' + methodId, 'DELETE', null);
    }

    public static CreateDevicePropertyMock = (deviceId: string, propertyId: string) => {
        return Data.Http('/api/device/' + deviceId + '/property/' + propertyId + '/mock/new', 'POST', null);
    }
    // payload : 
    public static DeleteDevicePropertyMock = (deviceId: string, propertyId: string) => {
        return Data.Http('/api/device/' + deviceId + '/property/' + propertyId + '/mock', 'DELETE', null);
    }

    // payload : {}
    public static updateDeviceProperty = (deviceId: string, propertyId: string, payload: any) => {
        return Data.Http('/api/device/' + deviceId + '/property/' + propertyId, 'PUT', payload);
    }

    // payload : {}
    public static updateDeviceMethod = (deviceId: string, methodId: string, payload: any) => {
        return Data.Http('/api/device/' + deviceId + '/method/' + methodId, 'PUT', payload);
    }

    // payload : {}
    public static updateDevicePropertyMock = (deviceId: string, propertyId: string, payload: any) => {
        return Data.Http('/api/device/' + deviceId + '/property/' + propertyId + '/mock', 'PUT', payload);
    }

    // payload : {}
    public static SendDeviceProperty = (deviceId: string, propertyId: string, payload: any) => {
        return Data.Http('/api/device/' + deviceId + '/property/' + propertyId + '/value', 'POST', payload);
    }

    public static GetDeviceProperty = (deviceId: string, propertyId: string) => {
        return Data.Http('/api/device/' + deviceId + '/property/' + propertyId + '/value', 'GET', null);
    }

    public static GetCurrentState = () => {
        return Data.Http('/api/state', 'GET');
    }

    public static GetMethodParams = (deviceId: string, methodId: string) => {
        return Data.Http('/api/device/' + deviceId + '/method/' + methodId + '/params', 'GET');
    }

    // payload : { state : {} }
    public static SetNewState = (payload: any) => {
        return Data.Http('/api/state', 'POST', payload);
    }

    // payload : { connectionString : "" }
    public static HubGetDevices = (payload: any) => {
        return Data.Http('/api/server/list', 'POST', payload);
    }

    public static HubDeleteDevice = (payload: any, deviceId: string) => {
        return Data.Http('/api/server/' + deviceId + '/delete', 'POST', payload);
    }

    // payload : { connectionString : "" }
    public static GetTwin = (payload: any, deviceId: string) => {
        return Data.Http('/api/server/' + deviceId + '/twinRead', 'POST', payload);
    }

    // payload : { connectionString : "", properties: {} }
    public static WriteTwin = (payload: any, deviceId: string) => {
        return Data.Http('/api/server/' + deviceId + '/twinWrite', 'POST', payload);
    }

    // handler
    public static Http = (url: string, method: string, data?: any) => {
        if (method.toLowerCase() === 'post') {
            return axios.post(url, data)
                .then((res: any) => {
                    return res.data;
                })
                .catch((error: any) => {
                    console.log(error.response.data.message);
                    throw error;
                })
        }
        else if (method.toLowerCase() === 'put') {
            return axios.put(url, data)
                .then((res: any) => {
                    return res.data;
                })
                .catch((error: any) => {
                    console.log(error.response.data.message);
                    throw error;
                })
        }
        else if (method.toLowerCase() === 'delete') {
            return axios.delete(url, data)
                .then((res: any) => {
                    return res.data;
                })
                .catch((error: any) => {
                    console.log(error.response.data.message);
                    throw error;
                })
        }
        else {
            return axios.get(url)
                .then((res: any) => {
                    // returns all
                    return res.data;
                })
                .catch((error: any) => {
                    console.log(error.response.data.message);
                    throw error;
                })
        }
    }
}