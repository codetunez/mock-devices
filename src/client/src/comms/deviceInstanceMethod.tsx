var classNames = require("classnames");
const cx = classNames.bind(require('./deviceInstanceProperty.scss'));

import * as React from "react";
import { Combo } from '../framework/controls'
import Toggle from 'react-toggle'
import * as Websocket from 'react-websocket';

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
            paramsDateTime: props.methodParams.methodParams && props.methodParams.methodParams[props.property._id] ? props.methodParams.methodParams[props.property._id].date : '',
            liveValue: 'Never'
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

    handleData = (data: any) => {
        let liveUpdates = JSON.parse(data);
        let v = liveUpdates[this.props.property._id];
        if (v != undefined) {
            let s: any = this.state;
            s.liveValue = v;
            this.setState(s);
        }
    }

    render() {

        return <div key={this.props.index} className={classNames("property", "property-method", this.props.dirty.devicePropertyId === this.state.property._id ? "property-dirty" : "", this.state.collapsed ? "property-collapsed" : "")}>
            <Websocket url={'ws://127.0.0.1:24376'} onMessage={this.handleData.bind(this)} />

            {/* method */}
            <div className="p2-toolbar">
                <div className="p2-toolbar-left">
                    <div className="chevron">
                        <a className="toggle-link" href="javascript:void(0)" onClick={() => this.toggleMe()}><div className={cx("fa", this.state.collapsed ? "fa-chevron-down" : "fa-chevron-up")}></div></a>
                    </div>
                    <div className="title">
                        <label>Device Method</label>
                        <div>{this.state.property.name}</div>
                    </div>
                </div>
                <div className="p2-toolbar-right">
                    <div className="title">
                        <label>LAST EXECUTED</label>
                        <div>{this.state.liveValue}</div>
                    </div>
                </div>
            </div>
            <div className="p2-fields">
                <div className="field"><label>{this.props.resx.FRM_LBL_METHOD_NAME}</label><br /><input className="form-control form-control-sm" type="text" name="name" onChange={this.handleChange} value={this.state.property.name} /></div>
                <div className="field"><label>{this.props.resx.FRM_LBL_RETURN_STATUS}</label><br /><Combo class="form-control-sm" collection={References.methodResponseStatus} name="status" onChange={this.handleChange} value={this.state.property.status} /></div>
                <div className="field field-w"><label>Param Payload</label><br /><input className="form-control form-control-sm" type="text" value={this.state.paramsPayload} readOnly={true} /></div>
                <div className="field field-w"><label>Param Date</label><br /><input className="form-control form-control-sm" type="text" value={this.state.paramsDateTime} readOnly={true} /></div>
                <div className="field"><label>Actions</label><br /><div className="btn-bar">
                    <button title={this.props.resx.BTN_LBL_METHOD_PARAMS} className="btn btn-sm btn-outline-success" onClick={this.getParams} ><span className={classNames("fa", "fa-refresh")}></span></button>
                    <button title={this.props.resx.BTN_LBL_PROPERTY_SAVE} className={classNames("btn btn-sm", this.props.dirty.devicePropertyId === this.state.property._id ? "btn-warning" : "btn-outline-secondary")} onClick={() => this.updateProperty()}><span className="fa fa-floppy-o"></span></button>
                    <button title={this.props.resx.BTN_LBL_PROPERTY_DELETE} className="btn btn-sm btn-outline-danger" onClick={() => this.props.deleteHandler(this.state.property._id)}><span className={classNames("fa fa-trash")}></span></button>
                </div>
                </div>
            </div>
            <div className="p2-fields">
                <div className="field field-xw"><label>{this.props.resx.FRM_LBL_PAYLOAD}</label><br />
                    <textarea className="form-control custom-textarea" name="payload" rows={5} onChange={this.handleChange} value={this.state.property.payload} />
                </div>
            </div>
            <div className="p2-fields">
                <div className="field field-xw"><label>{this.props.resx.FRM_LBL_AS_PROPERTY}</label><br />
                    <Toggle name="include" defaultChecked={this.state.property.asProperty} checked={this.state.property.asProperty} icons={true} onChange={this.handleChange} />
                </div>
            </div>
        </div>
    }
}