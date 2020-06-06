import * as React from 'react';
import axios from 'axios';

export const DeviceContext = React.createContext({});

export class DeviceProvider extends React.PureComponent {

    // group control plane
    setDevices = (devices: any) => {
        this.setState({ devices: devices });
    }

    refreshAllDevices = () => {
        this.getDevices();
    }

    startAllDevices = () => {
        axios.get('/api/devices/start')
            .then((response: any) => {
                this.setState({ devices: response.data, device: {} });
            })
    }

    stopAllDevices = () => {
        axios.get('/api/devices/stop')
            .then((response: any) => {
                this.setState({ devices: response.data, device: {} });
            })
    }

    // group data plane
    getDevices = () => {
        const id = this.state.device ? `/${this.state.device._id}` : ''
        axios.get(`/api/devices${id}`).then((response: any) => {
            let p = {};
            if (response.data.device) {
                Object.assign(p, { [response.data.device._id]: response.data.device.running })
            }
            this.setState({ powers: p, devices: response.data.devices });
        })
    }

    // single device control plane
    setDevice = (device: any) => {
        this.setState({ device: device });
    }

    startDevice = () => {
        axios.get('/api/device/' + this.state.device._id + '/start')
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    stopDevice = () => {
        axios.get('/api/device/' + this.state.device._id + '/stop')
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    deleteDevice = () => {
        axios.delete('/api/device/' + this.state.device._id)
            .then((response: any) => {
                this.setState({ devices: response.data, device: {} });
            })
    }

    // single device data control plane 
    updateDeviceConfiguration = (updatePayload: any) => {
        axios.put(`/api/device/${this.state.device._id}/configuration`, { payload: updatePayload })
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    getDevice = (id: string, index: number) => {
        axios.get('/api/device/' + id)
            .then((response: any) => {
                this.setState({ device: response.data, deviceIndex: index });
            })
    }

    updateDeviceProperty = (updatePayload: any, send: boolean) => {
        axios.put('/api/device/' + this.state.device._id + '/property/' + updatePayload._id + (send ? '/value' : ''), updatePayload)
            .then(response => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    updateDeviceMethod = (updatePayload: any, send: boolean) => {
        axios.put('/api/device/' + this.state.device._id + '/method/' + updatePayload._id, updatePayload)
            .then(response => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }


    // this handles creating a method and twin and telemetry. need to always up the list
    createCapability = (type: string, direction: string, pnpSdk: boolean) => {
        axios.post('/api/device/' + this.state.device._id + '/' + type + '/new', { pnpSdk: pnpSdk, type: direction ? direction : undefined })
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    deleteCapability = (id: string, type: string) => {
        axios.delete('/api/device/' + this.state.device._id + '/' + type + '/' + id, null)
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
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

    planRestart = () => {
        axios.get('/api/device/' + this.state.device._id + '/plan/restart')
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    planSave = (updatePayload: any) => {
        axios.put('/api/device/' + this.state.device._id + '/plan', { payload: updatePayload })
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
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
        powers: {},
        startAllDevices: this.startAllDevices,
        stopAllDevices: this.stopAllDevices,
        refreshAllDevices: this.refreshAllDevices,
        getDevice: this.getDevice,
        startDevice: this.startDevice,
        stopDevice: this.stopDevice,
        deleteDevice: this.deleteDevice,
        updateDeviceProperty: this.updateDeviceProperty,
        updateDeviceMethod: this.updateDeviceMethod,
        setDevices: this.setDevices,
        setDevice: this.setDevice,
        getDevices: this.getDevices,
        getCapability: this.getCapability,
        createCapability: this.createCapability,
        deleteCapability: this.deleteCapability,
        getCapabilityMethodRequest: this.getCapabilityMethodRequest,
        setSensors: this.setSensors,
        getSensor: this.getSensor,
        planRestart: this.planRestart,
        planSave: this.planSave,
        updateDeviceConfiguration: this.updateDeviceConfiguration
    }

    render() {
        return (
            <DeviceContext.Provider value={this.state} >
                {this.props.children}
            </DeviceContext.Provider >
        )
    }
}