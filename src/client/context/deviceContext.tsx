import * as React from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Endpoint } from './endpoint';

export const DeviceContext = React.createContext({});

export class DeviceProvider extends React.PureComponent {

    private sessionId: any = null;
    private eventSource = null;

    constructor() {
        super(null);
        this.sessionId = uuidv4();
        Endpoint.setSession(this.sessionId);
        this.init();
    }

    init() {

        let ui = false;
        let snippets = null;
        let colors = null;
        let devices = null;

        axios.get(`${Endpoint.getEndpoint()}api/ui`)
            .then((response: any) => {
                ui = response.data;
                return axios.get(`${Endpoint.getEndpoint()}api/simulation/snippets`)
            })
            .then((response: any) => {
                snippets = response.data;
                return axios.get(`${Endpoint.getEndpoint()}api/simulation/colors`)
            })
            .then((response: any) => {
                colors = response.data;
                return axios.get(`${Endpoint.getEndpoint()}api/devices`)
            })
            .then((response: any) => {
                devices = response.data;
                return axios.get(`${Endpoint.getEndpoint()}api/sensors`)
            })
            .then((response: any) => {
                this.setState({
                    ui,
                    snippets,
                    colors,
                    devices,
                    sensors: response.data,
                    device: {}
                });

            })

        setInterval(() => {
            if (!this.eventSource) {
                this.eventSource = new EventSource(`${Endpoint.getEndpoint()}api/events/state`);
                this.eventSource.onmessage = ((e) => {
                    const message = JSON.parse(e.data);
                    if (message && message['devices']) {
                        this.refreshAllDevices();
                    }
                });
            }
        }, 250);
    }

    // group control plane
    setDevices = (devices: any) => {
        this.setState({ devices: devices });
    }

    refreshAllDevices = () => {
        axios.get(`${Endpoint.getEndpoint()}api/devices`)
            .then((response: any) => {
                this.setState({ devices: response.data });
            })
    }

    startAllDevices = () => {
        axios.get(`${Endpoint.getEndpoint()}api/devices/start`)
            .then((response: any) => {
                this.setState({ devices: response.data });
            })
    }

    stopAllDevices = () => {
        axios.get(`${Endpoint.getEndpoint()}api/devices/stop`)
            .then((response: any) => {
                this.setState({ devices: response.data });
            })
    }

    reset = () => {
        axios.get(`${Endpoint.getEndpoint()}api/devices/reset`)
            .then((response: any) => {
                this.setState({ devices: response.data, device: {} });
            })
    }

    // single device control plane
    setDevice = (device: any) => {
        this.setState({ device: device });
    }

    startDevice = () => {
        axios.get(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/start`)
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    stopDevice = () => {
        axios.get(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/stop`)
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    revertDevice = () => {
        axios.get(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}`)
            .then((response: any) => {
                this.setState({ device: response.data });
            })
    }

    deleteDevice = () => {
        axios.delete(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}`)
            .then((response: any) => {
                this.setState({ devices: response.data, device: {} });
            })
    }

    deleteModule = (id: string) => {
        axios.delete(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/module/${id}`)
            .then((response: any) => {
                this.setState({ devices: response.data.devices, device: response.data.device });
            })
    }

    // single device data control plane 
    updateDeviceConfiguration = (updatePayload: any) => {
        axios.put(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/configuration`, { payload: updatePayload })
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
            .catch((err) => { console.log(err.response.data); })
    }

    updateDeviceModules = (updatePayload: any) => {
        axios.put(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/module`, { payload: updatePayload })
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
            .catch((err) => { console.log(err.response.data); })
    }

    getDevice = (id: string, index: number) => {
        axios.get(`${Endpoint.getEndpoint()}api/device/${id}`)
            .then((response: any) => {
                this.setState({ device: response.data, deviceIndex: index });
            })
    }

    updateDeviceProperty = (updatePayload: any, send: boolean) => {
        axios.put(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/property/${updatePayload._id}` + (send ? '/value' : ''), updatePayload)
            .then(response => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    updateDeviceMethod = (updatePayload: any) => {
        axios.put(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/method/${updatePayload._id}`, updatePayload)
            .then(response => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    reorderDevicePosition = (updatePayload: any) => {
        axios.post(`${Endpoint.getEndpoint()}api/device/reorder`, updatePayload)
            .then((response) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    // this handles creating a method and twin and telemetry. need to always up the list
    createCapability = (type: string, direction: string, pnpSdk: boolean) => {
        axios.post(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/${type}/new`, { pnpSdk: pnpSdk, type: direction ? direction : undefined })
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    deleteCapability = (id: string, type: string) => {
        axios.delete(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/${type}/${id}`, null)
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    getCapability = (id: string) => {
        axios.get(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/property/${id}/value`)
            .then((response: any) => {
                this.setState({ device: response.data });
            })
    }

    getCapabilityMethodRequest = (id: string) => {
        axios.get(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/method/${id}/params`)
            .then((response: any) => {
                this.setState({ requests: Object.assign({}, this.state.requests, response.data) });
            })
    }

    planRestart = () => {
        axios.get(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/plan/restart`)
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    planSave = (updatePayload: any) => {
        axios.put(`${Endpoint.getEndpoint()}api/device/${this.state.device._id}/plan`, { payload: updatePayload })
            .then((response: any) => {
                this.setState({ device: response.data.device, devices: response.data.devices });
            })
    }

    // --- refactor

    setSensors = (sensors: any) => {
        this.setState({ sensors: sensors });
    }

    getSensor = (type: string) => {
        axios.get(`${Endpoint.getEndpoint()}api/sensors` + type)
            .then((response: any) => {
                this.setState({ sensorSelcted: response.data })
            })
    }

    // --- refactor
    reapplyTemplate = (updatePayload: any) => {
        axios.post(`${Endpoint.getEndpoint()}api/template/reapply`, { payload: updatePayload })
            .then((response: any) => {
                this.setState({ devices: response.data.devices });
            })
    }

    state: any = {
        snippets: {},
        colors: {},
        ui: { container: false, latest: false },
        sensors: {},
        sensorSelcted: {},
        device: {},
        devices: [],
        requests: {},
        startAllDevices: this.startAllDevices,
        stopAllDevices: this.stopAllDevices,
        refreshAllDevices: this.refreshAllDevices,
        reset: this.reset,
        getDevice: this.getDevice,
        startDevice: this.startDevice,
        stopDevice: this.stopDevice,
        revertDevice: this.revertDevice,
        deleteDevice: this.deleteDevice,
        deleteModule: this.deleteModule,
        updateDeviceProperty: this.updateDeviceProperty,
        updateDeviceMethod: this.updateDeviceMethod,
        reorderDevicePosition: this.reorderDevicePosition,
        setDevices: this.setDevices,
        setDevice: this.setDevice,
        getCapability: this.getCapability,
        createCapability: this.createCapability,
        deleteCapability: this.deleteCapability,
        getCapabilityMethodRequest: this.getCapabilityMethodRequest,
        setSensors: this.setSensors,
        getSensor: this.getSensor,
        planRestart: this.planRestart,
        planSave: this.planSave,
        updateDeviceConfiguration: this.updateDeviceConfiguration,
        updateDeviceModules: this.updateDeviceModules,
        reapplyTemplate: this.reapplyTemplate
    }

    render() {
        return (
            <DeviceContext.Provider value={this.state} >
                {this.props.children}
            </DeviceContext.Provider >
        )
    }
}