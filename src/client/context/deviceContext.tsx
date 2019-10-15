import * as React from 'react';
import axios from 'axios';

export interface DeviceContextState {
    device?: any,
    devices?: Array<any>,
    requests?: any;
    startAllDevices?: any,
    stopAllDevices?: any,
    refreshAllDevices?: any,
    startDevice?: any,
    stopDevice?: any,
    setDevice?: any,
    getDevice?: any,
    deleteDevice?: any,
    updateDevice?: any,
    getDevices?: any,
    getCapability?: any;
    createCapabilty?: any,
    deleteCapability?: any,
    getCapabilityMethodRequest?: any;
    sensors?: Array<any>,
    sensorSelected?: any
}

export const DeviceContext = React.createContext({});

export class DeviceProvider extends React.PureComponent<DeviceContextState> {

    startAllDevices = () => {
        axios.get('/api/devices/start')
            .then((response: any) => {
                this.setState({ devices: response.data });
            })
    }

    stopAllDevices = () => {
        axios.get('/api/devices/stop')
            .then((response: any) => {
                this.setState({ devices: response.data });
            })
    }

    refreshAllDevices = () => {
        this.getDevices();
    }

    setDevices = (devices: any) => {
        this.setState({ devices: devices });
    }

    getDevices = () => {
        axios.get('/api/devices').then((response: any) => {
            this.setState({ devices: response.data });
        })
    }

    startDevice = () => {
        axios.get('/api/device/' + this.state.device._id + '/start')
            .then((response: any) => {
                this.setState({ devices: response.data });
            })
    }

    stopDevice = () => {
        axios.get('/api/device/' + this.state.device._id + '/stop')
            .then((response: any) => {
                this.setState({ devices: response.data });
            })
    }

    updateDevice = (updatePayload: any, send: boolean) => {
        axios[send ? 'post' : 'put']('/api/device/' + this.state.device._id + '/property/' + updatePayload._id + (send ? '/value' : ''), updatePayload)
            .then(response => {
                this.setState({ device: response.data });
            })
    }

    deleteDevice = () => {
        axios.post('/api/device/' + this.state.device._id + '/delete', null)
            .then((response: any) => {
                this.setState({ devices: response.data });
            })
    }

    getDevice = (id: string) => {
        axios.get('/api/device/' + id)
            .then((response: any) => {
                this.setState({ device: response.data });
            })
    }

    createCapability = (type: string, direction?: string) => {
        axios.post('/api/device/' + this.state.device._id + '/' + type + '/new', direction ? { type: direction } : null)
            .then((response: any) => {
                this.setState({ device: response.data });
            })
    }

    deleteCapability = (id: string, type: string) => {
        axios.delete('/api/device/' + this.state.device._id + '/' + type + '/' + id, null)
            .then((response: any) => {
                this.setState({ device: response.data });
            })
    }

    getCapability = (id: string) => {
        axios.get('/api/device/' + this.state.device._id + '/property/' + id + '/value')
            .then((response: any) => {
                this.setState({ device: response.data });
            })
    }

    getCapabilityMethodRequest = (id: string) => {
        axios.get('/api/device/' + this.state.device._id + '/method/' + id + '/params')
            .then((response: any) => {
                this.setState({ requests: Object.assign({}, this.state.requests, response.data) });
            })
    }

    // --- refactor

    setSensors = (sensors: any) => {
        this.setState({ sensors: sensors });
    }

    getSensor = (type: string) => {
        axios.get('/api/sensors/' + type)
            .then((response: any) => {
                this.setState({ sensorSelcted: response.data })
            })
    }

    state: any = {
        device: {},
        devices: [],
        requests: {},
        startAllDevices: this.startAllDevices,
        stopAllDevices: this.stopAllDevices,
        refreshAllDevices: this.refreshAllDevices,
        getDevice: this.getDevice,
        startDevice: this.startDevice,
        stopDevice: this.stopDevice,
        deleteDevice: this.deleteDevice,
        updateDevice: this.updateDevice,
        setDevices: this.setDevices,
        getDevices: this.getDevices,
        getCapability: this.getCapability,
        createCapability: this.createCapability,
        deleteCapability: this.deleteCapability,
        getCapabilityMethodRequest: this.getCapabilityMethodRequest,
        setSensors: this.setSensors,
        getSensor: this.getSensor
    }

    render() {
        return (
            <DeviceContext.Provider value={this.state}>
                {this.props.children}
            </DeviceContext.Provider>
        )
    }
}