import * as React from "react";
import * as DisplayActions from "../store/actions/displayActions"
import * as DeviceActions from "../store/actions/deviceActions"
import { Combo } from '../framework/controls'

export class AddDevice extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = this.initModel();
    }

    initModel(model?: any): any {
        let m: any = {};
        m.updatePayload = {
            connectionString: model ? model.connectionString : this.props.connectionString,
            hubConnectionString: model ? model.hubConnectionString: this.props.hubConnectionString
        };
        m.error = '';
        return m;
    }

    componentWillReceiveProps(nextProps: any) {
        this.setState(this.initModel(nextProps));
    }

    handleChange = (e: any) => {
        let s = this.state;
        s.updatePayload[e.target.name] = e.target.value;
        this.setState(s);
    }

    action = () => {
        this.props.dispatch(DeviceActions.CreateDevice(this.state.updatePayload));
        this.props.dispatch(DisplayActions.ToggleNewDevicePanel());
    }

    render() {
        let deviceList = [];
        if (this.props.devices) {
            this.props.devices.map(function (ele, i) {
                deviceList.push({ name: ele.name, value: ele._id });
            })
        }

        return <div>
            <h4>{this.props.resx.FRM_LBL_ADD_DEVICE}</h4>
            <div>
                <div className="form-group">
                    <span><strong>{this.props.resx.FRM_LBL_CONNSTRING_DEVICE_NAME}</strong></span>
                    <input className="form-control" type="text" name="name" onChange={this.handleChange} value={this.state.updatePayload.name || ''} />
                </div>
                <div className="form-group">
                    <span><strong>{this.props.resx.FRM_LBL_DEVICE_HUB_CONN_STRING}</strong></span>
                    <textarea className="form-control sm" name="connectionString" onChange={this.handleChange} value={this.state.updatePayload.connectionString || ''}></textarea>
                </div>
                <div className="form-group">
                    <span><strong>{this.props.resx.FRM_LBL_DEVICE_HUB_CONN_STRING}</strong></span>
                    <input className="form-control" type="text" name="hubConnectionString" readOnly value={this.state.updatePayload.hubConnectionString || ''} placeholder={this.props.resx.PLH_TXT_ADD_HUB_CONN} />
                </div>
            </div>
            <div className="form-group">
                <div><label>{this.props.resx.TEXT_CLONE_MODEL}</label></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Combo collection={deviceList} name="cloneId" onChange={this.handleChange} value={this.state.updatePayload.cloneId || ''} />
                    <button className="btn btn-outline-primary" onClick={() => this.action()}>{this.props.resx.ADD}</button>
                </div>
            </div>
        </div>
    }
}