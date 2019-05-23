var classNames = require("classnames");
import * as React from "react";
import { connect } from "react-redux";
import * as DeviceActions from "../store/actions/deviceActions"
import * as DisplayActions from "../store/actions/displayActions"
import * as DevicesActions from "../store/actions/devicesActions"
import * as DirtyActions from "../store/actions/dirtyActions"
import * as MethodParamsActions from "../store/actions/methodParamsActions"
import { DeviceInstanceAdvanced } from "../comms/deviceInstanceAdvanced";
import { DeviceInstanceProperty } from "../comms/deviceInstanceProperty";
import { DeviceInstanceCommands } from "../comms/deviceInstanceCommands"
import { DeviceInstanceMethod } from "../comms/deviceInstanceMethod"

class DeviceInstancePanel extends React.Component<any, any> {

    constructor(props: any) {
        super(props)

        this.state = {
            propertyUpdates: {}
        }
    }

    componentWillReceiveProps(nextProps: any) {
        let s: any = this.state;
        s.propertyUpdates = {};
        this.setState(s);
    }

    startDevice = () => {
        this.props.dispatch(DeviceActions.StartDevice(this.props.device.device._id));
    }

    stopDevice = () => {
        this.props.dispatch(DeviceActions.StopDevice(this.props.device.device._id));
    }

    deleteDevice = () => {
        this.props.dispatch(DeviceActions.DeleteDevice(this.props.device.device._id));
    }

    addD2CProperty = () => {
        this.props.dispatch(DeviceActions.AddDeviceProperty(this.props.device.device._id, { type: "d2c" }))
            .then(() => {
                this.props.dispatch(DevicesActions.loadInitialState(-1));
            });
    }

    addC2DProperty = () => {
        this.props.dispatch(DeviceActions.AddDeviceProperty(this.props.device.device._id, { type: "c2d" }))
            .then(() => {
                this.props.dispatch(DevicesActions.loadInitialState(-1));
            });
    }

    addMethod = () => {
        this.props.dispatch(DeviceActions.AddDeviceMethod(this.props.device.device._id))
            .then(() => {
                this.props.dispatch(DevicesActions.loadInitialState(-1));
            });
    }

    addPropertyMock = (property: any) => {
        this.props.dispatch(DeviceActions.UpdateDeviceProperty(this.props.device.device._id, property._id, property))
            .then(() => {
                this.props.dispatch(DeviceActions.AddDevicePropertyMock(this.props.device.device._id, property._id));
                this.props.dispatch(DevicesActions.loadInitialState(-1));
            });
    }

    deleteProperty = (propertyId: string) => {
        this.props.dispatch(DeviceActions.DeleteDeviceProperty(this.props.device.device._id, propertyId))
            .then(() => {
                this.props.dispatch(DevicesActions.loadInitialState(-1));
            });
    }

    deletePropertyMock = (propertyId: string) => {
        this.props.dispatch(DeviceActions.DeleteDevicePropertyMock(this.props.device.device._id, propertyId))
            .then(() => {
                this.props.dispatch(DevicesActions.loadInitialState(-1));
            });
    }

    handleToggle = (propertyId: string) => {
        this.props.dispatch(DisplayActions.ToggleProperty(propertyId));
    }

    toggleAll = () => {
        this.props.dispatch(DisplayActions.ToggleAllProperties(this.props.device.device));
    }

    toggleAdvanced = () => {
        this.props.dispatch(DisplayActions.ToggleAdvanced());
    }

    toggleIotHub = () => {
        this.props.dispatch(DisplayActions.ToggleIoTHubPanel(this.props.device.device.configuration.hubConnectionString || ''));
    }

    updateDevice = (payload: any) => {
        this.props.dispatch(DeviceActions.UpdateDevice(this.props.device.device._id, payload));
    }

    updateProperty = (propertyId: string, property: any) => {
        this.props.dispatch(DeviceActions.UpdateDeviceProperty(this.props.device.device._id, propertyId, property))
            .then(() => {
                this.props.dispatch(DevicesActions.loadInitialState(-1));
            });
    }

    updateMethod = (methodId: string, property: any) => {
        this.props.dispatch(DeviceActions.UpdateDeviceMethod(this.props.device.device._id, methodId, property))
            .then(() => {
                this.props.dispatch(DevicesActions.loadInitialState(-1));
            });
    }

    sendProperty = (propertyId: string, property: any) => {
        this.props.dispatch(DeviceActions.SendDeviceProperty(this.props.device.device._id, propertyId, property))
            .then(() => {
                this.props.dispatch(DevicesActions.loadInitialState(-1));
            });
    }

    readProperty = (propertyId: string) => {
        this.props.dispatch(DeviceActions.GetDeviceProperty(this.props.device.device._id, propertyId))
            .then(() => {
                this.props.dispatch(DevicesActions.loadInitialState(-1));
            });
    }

    methodParamsHandler = (propertyId: string) => {
        this.props.dispatch(MethodParamsActions.GetMethodParams(this.props.device.device._id, propertyId))
            .then(() => {
                this.props.dispatch(DevicesActions.loadInitialState(-1));
            });
    }

    handleDirty = (propertyId: string) => {
        this.props.dispatch(DirtyActions.PutInDirtyState(propertyId))
    }

    render() {
        {/* <div className="device-instance-properties-toggler">
        <a onClick={this.toggleAdvanced}>{this.props.display.advancedExpanded ? "hide advanced" : "show advanced"}</a>
        <a onClick={this.toggleAll}>{this.props.display.propertyToggleAll ? "collapse all" : "expand all"}</a>
        </div> */}

        let d = this.props.device.device;

        return <div className="device-instance-scroller">
            <div className="device-instance-scroller-header">
                <div className={classNames("section-title section-title-header", d.running ? "section-title-header-active" : "")}><span>{d.configuration.mockDeviceName || ''} </span>{(!d.running ? 'Device is not running' : '')}</div>
                <div className="device-instance-commands">
                    <DeviceInstanceCommands
                        device={this.props.device.device}
                        startHandler={this.startDevice}
                        stopHandler={this.stopDevice}
                        deleteHandler={this.deleteDevice}
                        addD2CHandler={this.addD2CProperty}
                        addC2DHandler={this.addC2DProperty}
                        addMethodHandler={this.addMethod}
                        toggleIotHubHandler={this.toggleIotHub}
                        hasHubString={d && d.configuration._kind != 'template' && d.hubConnectionString && d.configuration.hubConnectionString.length > 0}
                        isTemplate={d && d.configuration._kind != 'template'}
                        resx={this.props.resx}
                    />
                </div>
            </div>
            <div className="device-instance-scroller-body">
                {this.props.display.advancedExpanded ? <div className="device-instance-advanced">
                    <DeviceInstanceAdvanced
                        resx={this.props.resx}
                        device={this.props.device.device}
                        updateHandler={this.updateDevice} />
                </div> : null}

                <div className={classNames("device-instance-properties", this.props.display.advancedExpanded ? "device-instance-properties-advanced" : "")}>
                    {d.comms ?
                        d.comms.map((item: any, index: number) => {
                            if (item._type === "method") {
                                return <div key={index} className="device-instance-property-container">
                                    <DeviceInstanceMethod
                                        index={index}
                                        property={item}
                                        methodParams={this.props.methodParams}
                                        resx={this.props.resx}
                                        display={this.props.display}
                                        deleteHandler={this.deleteProperty}
                                        updateHandler={this.updateMethod.bind(this, item._id)}
                                        toggleHandler={this.handleToggle.bind(this, item._id)}
                                        dirtyHandler={this.handleDirty}
                                        methodParamsHandler={this.methodParamsHandler.bind(this, item._id)}
                                        dirty={this.props.dirty} />
                                </div>
                            }
                            if (item._type === "property") {
                                return <div key={index} className="device-instance-property-container">
                                    <DeviceInstanceProperty
                                        index={index}
                                        property={item}
                                        deleteHandler={this.deleteProperty}
                                        addMockHandler={this.addPropertyMock}
                                        deleteMockHandler={this.deletePropertyMock}
                                        updateHandler={this.updateProperty.bind(this, item._id)}
                                        sendValueHandler={this.sendProperty.bind(this, item._id)}
                                        readValueHandler={this.readProperty.bind(this, item._id)}
                                        sensorList={this.props.sensors.sensors}
                                        resx={this.props.resx}
                                        display={this.props.display}
                                        toggleHandler={this.handleToggle.bind(this, item._id)}
                                        dirtyHandler={this.handleDirty}
                                        dirty={this.props.dirty} />
                                </div>
                            }

                        })
                        : null}
                </div>
            </div >
        </div >
    }
}

/* this is to avoid the TypeScript issue using @connect */
function mapStateToProps(state: any) {
    return {
        device: state.device,
        sensors: state.sensors,
        resx: state.resx,
        display: state.display,
        dirty: state.dirty,
        methodParams: state.methodParams
    }
}

export default connect<{}, {}, {}>(mapStateToProps)(DeviceInstancePanel)