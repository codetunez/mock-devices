var cx = require("classnames");

import * as React from "react";
import * as DisplayActions from "../store/actions/displayActions"
import * as DeviceActions from "../store/actions/deviceActions"
import { Combo } from '../framework/controls'
import { Data } from '../data';

interface Payload {
    _kind: string;
    deviceId: string;
    mockDeviceName: string;
    mockDeviceCloneId?: string;
    mockDeviceState?: any;
    connectionString?: string;
    hubConnectionString?: string;
    scopeId?: string;
    dpsPayload?: any;
    sasKey?: string;
    capabilityModel?: any;
}

export class AddDevice extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = this.initModel();
    }

    initModel(): any {
        let m: any = {};
        m.updatePayload = {};
        m.panel = 0;
        m.devices = [];
        return m;
    }

    getDeviceList = () => {
        Data.HubGetDevices({ connectionString: this.state.updatePayload.hubConnectionString })
            .then((devices: any) => {
                let s: any = this.state;
                s.devices = devices;
                s.doneSearch = true;
                s.error = '';
                this.setState(s);
            })
            .catch((err: any) => {
                let s: any = this.state;
                s.error = err.response.data;
                this.setState(s);
            })
    }

    componentWillReceiveProps(nextProps: any) {
        this.setState({});
    }

    handleChange = (e: any) => {
        let s = this.state;
        s.updatePayload[e.target.name] = e.target.value;
        this.setState(s);
    }

    import = () => { }

    action = (kind: string) => {

        let updatePayload: Payload = this.state.updatePayload;
        updatePayload._kind = kind;

        if (kind === 'dps') { updatePayload.hubConnectionString = null; }
        if (kind != 'template') { updatePayload.capabilityModel = null; }

        this.props.dispatch(DeviceActions.CreateDevice(updatePayload));
        this.props.dispatch(DisplayActions.ToggleNewDevicePanel());
    }

    addHubDevice = (item: any) => {
        let s: any = this.state;
        s.updatePayload.mockDeviceName = item.deviceId;
        s.updatePayload.connectionString = item.connectionString;
        s.panel = 1;
        this.setState(s);
    }

    render() {
        let deviceList = [];
        if (this.props.devices) {
            this.props.devices.map(function (ele, i) {
                deviceList.push({ name: ele.name, value: ele._id });
            })
        }

        return <div className="add-dialog">
            <div className="add-dialog-nav">
                <div>Add a Mock Device</div>
                <button onClick={() => this.setState({ panel: 0 })} className={cx("btn btn-outline-primary", this.state.panel === 0 ? "active" : "")}>Use DPS</button><br />
                <button onClick={() => this.setState({ panel: 1 })} className={cx("btn btn-outline-primary", this.state.panel === 1 ? "active" : "")}>Use a Connection String</button><br />
                <button onClick={() => this.setState({ panel: 2 })} className={cx("btn btn-outline-primary", this.state.panel === 2 ? "active" : "")}>Use an IoT Hub</button><br />
                <div>Add a Template</div>
                <button onClick={() => this.setState({ panel: 3 })} className={cx("btn btn-outline-primary", this.state.panel === 3 ? "active" : "")}>Use a Capability Model</button><br />
                <div>Manage State</div>
                <button onClick={() => this.setState({ panel: 4 })} className={cx("btn btn-outline-primary", this.state.panel === 4 ? "active" : "")}>Import JSON</button><br />
                <button onClick={() => this.setState({ panel: 5 })} className={cx("btn btn-outline-primary", this.state.panel === 5 ? "active" : "")}>Load Local Storage</button><br />
            </div>

            <div className="add-dialog-content">
                {this.state.panel === 0 ? <h5>Add a Device using DPS configuration</h5> : null}
                {this.state.panel === 1 ? <h5>Add a Device using a Connection String</h5> : null}
                {this.state.panel === 2 ? <h5>Add a Device from an IoT Hub</h5> : null}
                {this.state.panel === 3 ? <h5>Add a Template using a Device Capability Model</h5> : null}
                {this.state.panel === 4 ? <h5>Replace mock-devices current State</h5> : null}
                {this.state.panel === 5 ? <h5>Replace mock-devices current state from Local Storage</h5> : null}

                {/* Panel 0 */}
                {this.state.panel === 0 ? <div>
                    <div className="form-group">
                        <label>{this.props.resx.FRM_LBL_DEVICE_ID}</label>
                        <input className="form-control" type="text" name="deviceId" onChange={this.handleChange} value={this.state.updatePayload.deviceId || ''} />
                    </div>
                    <div className="form-group">
                        <label>{this.props.resx.FRM_LBL_DEVICE_DPS_SCOPE}</label>
                        <input className="form-control" type="text" name="scopeId" onChange={this.handleChange} value={this.state.updatePayload.scopeId || ''} />
                    </div>
                    <div className="form-group">
                        <label>{this.props.resx.FRM_LBL_DEVICE_DPS_SAS}</label>
                        <input className="form-control" type="text" name="sasKey" onChange={this.handleChange} value={this.state.updatePayload.sasKey || ''} />
                    </div>
                    <div className="form-group">
                        <label>{this.props.resx.FRM_LBL_DEVICE_DPS_PAYLOAD}</label>
                        <textarea className="form-control sm" name="dpsPayload" onChange={this.handleChange} value={this.state.updatePayload.dpsPayload || ''}></textarea>
                    </div>
                    <div style={{ display: "flex", alignContent: "stretch" }}>
                        <div className="form-group" style={{ paddingRight: "10px" }} >
                            <label>{this.props.resx.FRM_LBL_DEVICE_NAME}</label>
                            <input className="form-control" type="text" name="mockDeviceName" onChange={this.handleChange} value={this.state.updatePayload.mockDeviceName || ''} />
                        </div>
                        <div className="form-group">
                            <label>{this.props.resx.FRM_LBL_DEVICE_CLONE}</label><br />
                            <Combo collection={deviceList} name="mockDeviceCloneId" onChange={this.handleChange} value={this.state.updatePayload.mockDeviceCloneId || ''} />
                        </div>
                    </div>
                    <button className="btn btn-info" onClick={() => this.action('dps')}>{this.props.resx.ADD}</button>
                </div>
                    : null}

                {/* Panel 1 */}
                {this.state.panel === 1 ? <div>
                    <div className="form-group">
                        <label>{this.props.resx.FRM_LBL_DEVICE_HUB_CONN_STRING}</label>
                        <textarea className="form-control md" name="connectionString" onChange={this.handleChange} value={this.state.updatePayload.connectionString || ''}></textarea>
                    </div>
                    <div style={{ display: "flex", alignContent: "stretch" }}>
                        <div className="form-group" style={{ paddingRight: "10px" }} >
                            <label>{this.props.resx.FRM_LBL_DEVICE_NAME}</label>
                            <input className="form-control" type="text" name="mockDeviceName" onChange={this.handleChange} value={this.state.updatePayload.mockDeviceName || ''} />
                        </div>
                        <div className="form-group">
                            <label>{this.props.resx.FRM_LBL_DEVICE_CLONE}</label><br />
                            <Combo collection={deviceList} name="mockDeviceCloneId" onChange={this.handleChange} value={this.state.updatePayload.mockDeviceCloneId || ''} />
                        </div>
                    </div>
                    <button className="btn btn-info" onClick={() => this.action('hub')}>{this.props.resx.ADD}</button>
                </div>
                    : null}

                {/* Panel 2 */}
                {this.state.panel === 2 ? <div>

                    <div className="form-group">
                        <label>IoT Hub Connection String</label><br />
                        <div className="input-group">
                            <textarea className="form-control sm" name="hubConnectionString" onChange={this.handleChange} value={this.state.updatePayload.hubConnectionString || ''}></textarea>
                            <span className="input-group-btn" style={{ marginLeft: "10px" }}>
                                <button className="btn btn-info" onClick={() => this.getDeviceList()}>
                                    <span className="fa fa-cloud-download"></span>
                                </button>
                            </span>
                        </div>
                    </div>
                    <div>
                        {this.state.devices.length > 0 ? <label>Devices will be added via Connection String option</label> : <span>No devices loaded</span>}
                        <div className="hub-devices">
                            {this.state.devices.map((item: any, index: number) => {
                                var i = this.props.devices.findIndex((device: any) => {
                                    return device._id === item.deviceId;
                                });

                                return <div key={index} className="hub-device-item">
                                    <div className="hub-device-item-line">
                                        <div>
                                            <div>{item.deviceId}</div>
                                            <div className="conn-string">{item.connectionString}</div>
                                        </div>
                                        <div className="btn-bar">
                                            {i > -1 ? <div className="text-success" style={{ width: "38px" }}>
                                                <h2 className="fa fa-check fa-2x"></h2>
                                            </div>
                                                :
                                                <button title={this.props.resx.ADD} className="btn btn-info" onClick={this.addHubDevice.bind(this, item)}>
                                                    <span className="fa fa-plus"></span>
                                                </button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
                    : null}

                {/* Panel 3 */}
                {this.state.panel === 3 ? <div>
                    <div className="form-group">
                        <label>{this.props.resx.FRM_LBL_DEVICE_PASTE_CAP}</label>
                        <textarea className="form-control lg" name="capabilityModel" onChange={this.handleChange} value={this.state.updatePayload.capabilityModel || ''}></textarea>
                    </div>
                    <button className="btn btn-info" onClick={() => this.action('template')}>{this.props.resx.ADD}</button>
                </div>
                    : null}

                {/* Panel 4 */}
                {this.state.panel === 4 ? <div>
                    <div className="form-group">
                        <label>{this.props.resx.FRM_LBL_DEVICE_PASTE_STATE}</label>
                        <textarea className="form-control lg" name="mockDeviceState" onChange={this.handleChange} value={this.state.updatePayload.mockDeviceState || ''}></textarea>
                    </div>
                    <button className="btn btn-info" onClick={() => this.import()}>{this.props.resx.IMPORT}</button>
                </div>
                    : null}

                {/* Panel 5 */}
                {this.state.panel === 5 ? <div>

                </div>
                    : null}

            </div>
        </div>
    }
}