var classNames = require("classnames");
import * as React from "react";
import { Combo, RadioBoolean } from '../framework/controls'

let References = {
    methodResponseStatus: [{ name: "200", value: 200 }, { name: "404", value: 404 }, { name: "500", value: 500 }],
    returnType: [{ label: "No", value: "Use a JSON payload" }, { label: "Yes", value: "Use a function" }]
}

export class DeviceInstanceMethod extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = this.getModel(this.props);
    }

    componentWillReceiveProps(nextProps: any) {
        this.setState(this.getModel(nextProps));
    }

    getModel = (props) => {
        return {
            property: props.property,
            collapsed: props.display.propertyToggle[props.property._id],
            paramsPayload: props.methodParams.methodParams && props.methodParams.methodParams[props.property._id] ? props.methodParams.methodParams[props.property._id].payload : '',
            paramsDateTime: props.methodParams.methodParams && props.methodParams.methodParams[props.property._id] ? props.methodParams.methodParams[props.property._id].date : ''
        }
    }

    isDirty = (property: any) => {
        return this.props.dirty.devicePropertyId === null || this.props.dirty.devicePropertyId === property._id;
    }

    updateProperty = () => {
        this.props.updateHandler(this.state.property);
    }

    handleChange = (e: any) => {
        let s: any = this.state;

        if (this.isDirty(s.property)) {
            s.property[e.target.name] = e.target.type === "checkbox" ? e.target.checked : e.target.name === "status" ? parseInt(e.target.value) : e.target.value;
            this.setState(s, () => {
                this.props.dirtyHandler(s.property._id);
            });
        } else { alert(this.props.resx.TEXT_DIRTY_PROPERTY); }
    }

    toggleMe = () => {
        this.props.toggleHandler(this.state.property);
    }

    getParams = () => {
        this.props.methodParamsHandler(this.state.property._id);
    }

    render() {

        return <div key={this.props.index} className={classNames("property", "property-method", this.props.dirty.devicePropertyId === this.state.property._id ? "property-dirty" : "", this.state.collapsed ? "property-collapsed" : "")}>

            {/* toolbar */}
            <div className="property-fields property-toolbar">
                <a className="toggle-link" href="javascript:void(0)" onClick={() => this.toggleMe()}>
                    <div className={classNames("text-primary property-header")}>
                        <div className={classNames("fa", this.state.collapsed ? "fa-chevron-down" : "fa-chevron-up")}></div>
                        <div className={classNames("fa", "fa-code")}></div>
                        <div>Device Method ({this.state.property.name})</div>
                    </div>
                </a>
                <div className="btn-bar">
                    <button title={this.props.resx.BTN_LBL_PROPERTY_SAVE} className={classNames("btn btn-sm", this.props.dirty.devicePropertyId === this.state.property._id ? "btn-warning" : "btn-outline-secondary")} onClick={() => this.updateProperty()}><span className="fa fa-floppy-o"></span></button>
                    <button title={this.props.resx.BTN_LBL_PROPERTY_DELETE} className="btn btn-sm btn-outline-danger" onClick={() => this.props.deleteHandler(this.state.property._id)}><span className={classNames("fa fa-trash")}></span></button>
                </div>
            </div>

            <div className="property-body">
                <div className="property-fields property-fields-vertical">
                    <div className="field"><label>{this.props.resx.FRM_LBL_METHOD_NAME}</label><br />
                        <input className="form-control" type="text" name="name" onChange={this.handleChange} value={this.state.property.name} />
                    </div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_RECEIVED_PARAM}</label><br />
                        <div className="method-horizontal-fields">
                            <input className="form-control" type="text" value={this.state.paramsPayload} readOnly={true} />
                            <input className="form-control" type="text" value={this.state.paramsDateTime} readOnly={true} />
                            <button title={this.props.resx.BTN_LBL_METHOD_PARAMS} className="btn btn-sm btn-outline-success" onClick={this.getParams} >
                                <span className={classNames("fa", "fa-refresh")}></span>
                            </button>
                        </div>
                    </div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_RETURN_STATUS}</label><br />
                        <Combo collection={References.methodResponseStatus} name="status" onChange={this.handleChange} value={this.state.property.status} />
                    </div>

                    <div className="field"><label>{this.props.resx.FRM_LBL_AS_PROPERTY}</label><br />
                        <RadioBoolean name="asProperty" onChange={this.handleChange} value={this.state.property.asProperty} />
                    </div>
                    
                    <div className="field"><label>{this.props.resx.FRM_LBL_PAYLOAD}</label><br />
                        <textarea style={{ height: "200px" }} className="form-control" name="payload" onChange={this.handleChange} value={this.state.property.payload} />
                    </div>
                </div>
            </div>

        </div>
    }
}