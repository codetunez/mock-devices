var classNames = require("classnames");
import * as React from "react";

export class DeviceInstanceAdvanced extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            updatePayload: {
                name: this.props.device.name,
                connectionString: this.props.device.connectionString,
                hubConnectionString: this.props.device.hubConnectionString,
                template: this.props.device.template,
            },
            isDirty: false
        }
    }

    componentWillReceiveProps(nextProps: any) {
        let s: any = this.state;
        s.updatePayload = {
            name: nextProps.device.name,
            connectionString: nextProps.device.connectionString,
            hubConnectionString: nextProps.device.hubConnectionString,
            template: nextProps.device.template
        };
        s.isDirty = false;
        this.setState(s);
    }

    handleUpdateDevice = (e: any) => {
        let s: any = this.state;
        s.updatePayload[e.target.name] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        s.isDirty = true;
        this.setState(s);
    }

    render() {
        return <div className="property-type-form">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h5>{this.props.resx.ADVANCED}</h5>
                <button title={this.props.resx.BTN_LBL_UPDATE_NAME} className={classNames("btn", this.state.isDirty ? "btn-warning" : "btn-secondary")} name="name" type="button" onClick={() => this.props.updateHandler(this.state.updatePayload)}>
                    <span className={classNames("fa fa-lg fa-pencil")}></span> {this.props.resx.UPDATE}
                </button>
            </div>
            <div className="property-fields">
                <div className="field"><label>{this.props.resx.FRM_LBL_DEVICE_NAME}</label><br />
                    <input name="name" className="form-control full" type="text" onChange={this.handleUpdateDevice} value={this.state.updatePayload.name} /></div>
                <div className="field"><label>{this.props.resx.FRM_LBL_DEVICE_CONN_STRING}</label><br />
                    <input name="connectionString" className="form-control full" type="text" onChange={this.handleUpdateDevice} value={this.state.updatePayload.connectionString || ''} /></div>
                <div className="field"><label>{this.props.resx.FRM_LBL_DEVICE_HUB_CONN_STRING}</label><br />
                    <input name="hubConnectionString" className="form-control full" type="text" onChange={this.handleUpdateDevice} value={this.state.updatePayload.hubConnectionString || ''} /></div>
                <div className="field"><label>{this.props.resx.FRM_LBL_DEVICE_TEMPLATE}</label><br />
                    <label className="custom-control custom-checkbox" style={{ marginLeft: "3px", marginBottom: "0" }}>
                        <input type="checkbox" className="custom-control-input" name="template" onChange={this.handleUpdateDevice} checked={this.state.updatePayload.template} />
                        <span className="custom-control-indicator"></span>
                        <span className="custom-control-description seperator-heading">{this.props.resx.FRM_LBL_DEVICE_IS_TEMPLATE}</span>
                    </label>
                </div>
            </div>
        </div>
    }
}