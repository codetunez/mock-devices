var classNames = require("classnames");
import * as React from "react";

const cx = classNames.bind(require('./deviceInstanceAdvanced.scss'));

export class DeviceInstanceAdvanced extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            updatePayload: this.props.device.configuration || {},
            isDirty: false
        }
    }

    componentWillReceiveProps(nextProps: any) {
        let s: any = this.state;
        s.updatePayload = nextProps.device.configuration;
        s.isDirty = false;
        this.setState(s);
    }

    handleUpdateDevice = (e: any) => {
        let s: any = this.state;
        s.updatePayload[e.target.name] = e.target.name === 'isMasterKey' ? e.target.checked : e.target.value;
        s.isDirty = true;
        this.setState(s);
    }

    render() {
        return <div className="property-advanced">
            <div className="p2-advanced-fields">
                <div className="field">
                    <label>{this.props.resx.FRM_LBL_DEVICE_NAME}</label><br />
                    <input className="form-control form-control-sm" type="text" name="mockDeviceName" onChange={this.handleUpdateDevice} value={this.state.updatePayload.mockDeviceName || ''} />
                </div>
                <div className="field">
                    <label>{this.props.resx.FRM_LBL_DEVICE_DPS_SCOPE}</label><br />
                    <input className="form-control form-control-sm" type="text" name="scopeId" onChange={this.handleUpdateDevice} value={this.state.updatePayload.scopeId || ''} />
                </div>
                <div className="field">
                    <label>{this.props.resx.FRM_LBL_DEVICE_ID}</label><br />
                    <input className="form-control form-control-sm" type="text" name="deviceId" onChange={this.handleUpdateDevice} value={this.state.updatePayload.deviceId || ''} />
                </div>
                <div className="field">
                    <label>{this.props.resx.FRM_LBL_DEVICE_DPS_SAS}</label><br />
                    <input className="form-control" type="text" name="sasKey" onChange={this.handleUpdateDevice} value={this.state.updatePayload.sasKey || ''} />
                </div>

                <div className="field-check">
                    <div>Generate a HMAC-SHA265 SaS Key</div>
                    <label className="custom-checkbox">
                        <input type="checkbox" name="isMasterKey" disabled={this.state.updatePayload.mockCreateCount > 1} onChange={this.handleUpdateDevice} checked={this.state.updatePayload.isMasterKey} />
                        <span className="checkmark"></span>
                    </label>
                </div>

                <div className="field">
                    <label>{this.props.resx.FRM_LBL_DEVICE_DPS_PAYLOAD}</label><br />
                    <textarea rows={6} className="custom-textarea form-control sm" name="dpsPayload" onChange={this.handleUpdateDevice} value={this.state.updatePayload.dpsPayload || ''}></textarea>
                </div>
                <div className="field">
                    <label>{this.props.resx.FRM_LBL_DEVICE_HUB_CONN_STRING}</label><br />
                    <textarea className="custom-textarea form-control md" name="connectionString" onChange={this.handleUpdateDevice} value={this.state.updatePayload.connectionString || ''}></textarea>
                </div>
            </div>
            <button title={this.props.resx.BTN_LBL_UPDATE_NAME} className={classNames("btn btn-sm", this.state.isDirty ? "btn-warning" : "btn-secondary")} name="name" type="button" onClick={() => this.props.updateHandler(this.state.updatePayload)}>{this.props.resx.UPDATE}</button>
        </div>
    }
}