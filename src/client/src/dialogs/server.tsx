import * as React from "react";
import { Data } from '../data';
import * as DisplayActions from "../store/actions/displayActions"

export class Server extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = this.initModel();
    }

    initModel(model?: any): any {
        let m: any = {};
        m.doneSearch = false;
        m.hubConnectionString = '';
        m.devices = [];
        m.error = '';
        return m;
    }

    componentWillReceiveProps(nextProps: any) {
        this.setState(this.initModel(nextProps));
    }

    handleChange = (e: any) => {
        let s: any = this.state;
        s[e.target.name] = e.target.value;
        this.setState(s);
    }

    getDeviceList = () => {
        Data.HubGetDevices({ connectionString: this.state.hubConnectionString })
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

    deleteDevice = (deviceId: string) => {
        Data.HubDeleteDevice({ connectionString: this.state.hubConnectionString }, deviceId)
            .then((devices: any) => {
                let s: any = this.state;
                s.devices = devices;
                s.error = '';
                this.setState(s);
            })
            .catch((err: any) => {
                let s: any = this.state;
                s.error = err.response.data;
                this.setState(s);
            })
    }

    addDevice = (connectionString: string) => {
        this.props.dispatch(DisplayActions.ToggleNewDevicePanel(connectionString, this.state.hubConnectionString));
    }

    render() {

        let alertText = this.state.error;
        if (this.state.doneSearch && this.state.devices.length === 0) { alertText = this.props.resx.TEXT_NO_DEVICES }

        return <div className="hub-devices">
            <h4>{this.props.resx.FRM_LBL_IOT_HUB}</h4>

            <div className="input-group">
                <input className="form-control full" type="text" name="hubConnectionString" onChange={this.handleChange} value={this.state.hubConnectionString} />
                <span className="input-group-btn">
                    <button className="btn btn-primary" onClick={() => this.getDeviceList()}>
                        <span className="fa fa-cloud-download"></span> {this.props.resx.TEXT_DEVICE_LIST}
                    </button>
                </span>
            </div>

            <div style={{ marginTop: "20px" }}>
                {alertText != '' ? <div className="alert alert-danger">{alertText}</div> : null}
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
                                    <button title={this.props.resx.ADD}  className="btn btn-info" onClick={() => this.addDevice(item.connectionString)}>
                                        <span className="fa fa-plus"></span>
                                    </button>
                                }
                                <button title={this.props.resx.DELETE} className="btn btn-danger" onClick={() => this.deleteDevice(item.deviceId)}>
                                    <span className="fa fa-trash-o"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                })}
            </div>
        </div>
    }
}