var classNames = require("classNames");
import * as React from "react";
import { DeviceInstancePropertyMock } from '../components/deviceInstancePropertyMock';
import { DeviceInstancePropertyRunLoop } from '../components/deviceInstancePropertyRunLoop';
import { Combo, RadioBoolean, RadioCollection } from '../framework/controls'
import { FormatJSON } from '../framework/utils'
const cx = classNames.bind(require('./deviceInstanceProperty.scss'));

let References = {
    propTypeD2C: [{ label: "No use default", value: "default" }, { label: "Use a Template", value: "templated" }],
    propTypeC2D: [{ label: "No", value: "default" }, { label: "Yes", value: "templated" }],
    deviceInOutCombo: [{ name: "twin", value: "twin" }, { name: "msg", value: "msg" }],
    propertyObjectCombo: [{ name: "error", value: "error" }, { name: "pending", value: "pending" }, { name: "completed", value: "completed" }]
}

export class DeviceInstanceProperty extends React.Component<any, any> {

    constructor(props: any) {
        super(props)

        this.state = {
            property: this.props.property,
            collapsed: this.props.display.propertyToggle[this.props.property._id]
        }
    }

    isDirty = (property: any) => {
        return this.props.dirty.devicePropertyId === null || this.props.dirty.devicePropertyId === property._id;
    }

    componentWillReceiveProps(nextProps: any) {
        let s: any = this.state;
        s.property = nextProps.property;
        s.collapsed = nextProps.display.propertyToggle[nextProps.property._id]
        this.setState(s);
    }

    handleChange = (e: any) => {
        let s: any = this.state;

        if (this.isDirty(s.property)) {
            s.property[e.target.name] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
            this.setState(s, () => {
                this.props.dirtyHandler(s.property._id);
            });
        } else { alert(this.props.resx.TEXT_DIRTY_PROPERTY); }
    }

    handlePropertyObjectChange = (value: string) => {
        let s: any = this.state;
        if (this.isDirty(s.property)) {
            s.property.propertyObject.type = value;
            this.setState(s, () => {
                this.props.dirtyHandler(s.property._id);
            });
        } else { alert(this.props.resx.TEXT_DIRTY_PROPERTY); }
    }

    handlePropertyObjectValueChange = (e: any) => {
        let s: any = this.state;
        if (this.isDirty(s.property)) {
            s.property.propertyObject[e.target.name] = e.target.value;
            this.setState(s, () => {
                this.props.dirtyHandler(s.property._id);
            });
        } else { alert(this.props.resx.TEXT_DIRTY_PROPERTY); }
    }

    runloopChangeHandler = (e: any) => {
        let s: any = this.state;
        if (this.isDirty(s.property)) {
            s.property.runloop[e.target.name] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
            this.setState(s, () => {
                this.props.dirtyHandler(s.property._id);
            });
        } else { alert(this.props.resx.TEXT_DIRTY_PROPERTY); }
    }

    mockChangeHandler = (mock: any) => {
        let s: any = this.state;
        if (this.isDirty(s.property)) {
            s.property.mock = mock;
            if (mock != null) {
                s.property.propertyObject.type = "default";
            }
            this.setState(s, () => {
                this.props.dirtyHandler(s.property._id);
            });
        } else { alert(this.props.resx.TEXT_DIRTY_PROPERTY); }
    }

    addMockLocalHandler = () => {
        this.props.addMockHandler(this.state.property);
    }

    deleteMockLocalHandler = () => {
        this.props.deleteMockHandler(this.state.property._id);
    }

    updateProperty = () => {
        this.props.updateHandler(this.state.property);
    }

    sendValue = () => {
        this.props.sendValueHandler(this.state.property);
    }

    readValue = () => {
        this.props.readValueHandler(this.state.property);
    }

    toggleMe = () => {
        this.props.toggleHandler(this.state.property);
    }

    render() {

        let propertyButtonIcon = cx("fa", this.state.property.type.direction === "d2c" ? "fa-cloud-upload" : "fa-cloud-download");
        let propertyColor = this.state.property.type.direction === "d2c" ? "" : "property-c2d";
        let sendButtonLabel = this.state.property.type.mock === true ? this.props.resx.TEXT_OVERRIDE_MOCK :
            (this.state.property.type.direction === "d2c" && this.state.property.runloop && this.state.property.runloop.include === true ? this.props.resx.TEXT_SEND_NOW : this.props.resx.TEXT_SEND);

        return <div key={this.props.index} className={cx("property", propertyColor, this.props.dirty.devicePropertyId === this.state.property._id ? "property-dirty" : "", this.state.collapsed ? "property-collapsed" : "")}>

            {/* toolbar */}
            <div className="property-fields property-toolbar">
                <a className="toggle-link" href="javascript:void(0)" onClick={() => this.toggleMe()}>
                    <div className={cx("text-primary property-header")}>
                        <div className={cx("fa", this.state.collapsed ? "fa-chevron-down" : "fa-chevron-up")}></div>
                        <div className={propertyButtonIcon}></div>
                        <div>{this.state.property.type.direction === "d2c" ? (this.state.property.type.mock === true ? this.props.resx.TEXT_D2C_MOCK : this.props.resx.TEXT_D2C) : this.props.resx.TEXT_C2D}</div>
                        <div>({this.state.property.name})</div>
                        {this.state.property.runloop && this.state.property.runloop.include === true ? <div className="fa fa-clock-o"></div> : null}
                        {this.state.property.runloop && this.state.property.runloop.include === true ? <div>{this.state.property.runloop.value} {this.state.property.runloop.unit}</div> : null}
                    </div>
                </a>
                <div className="btn-bar">
                    <button title={this.props.resx.BTN_LBL_PROPERTY_SAVE} className={cx("btn btn-sm", this.props.dirty.devicePropertyId === this.state.property._id ? "btn-warning" : "btn-outline-secondary")} onClick={() => this.updateProperty()}><span className="fa fa-floppy-o"></span></button>
                    <button title={this.props.resx.BTN_LBL_PROPERTY_DELETE} className="btn btn-sm btn-outline-danger" onClick={() => this.props.deleteHandler(this.state.property._id)}><span className={cx("fa fa-trash")}></span></button>
                </div>
            </div>

            <div className="property-body">

                {/* c2d */}
                {this.state.property.type.direction === "c2d" ? <div className="property-fields">
                    <div className="field"><label>{this.props.resx.FRM_LBL_FIELD_NAME}</label><br /><input className="form-control full form-control-sm" type="text" name="name" onChange={this.handleChange} value={this.state.property.name} /></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_DEVICE_SDKIN}</label><br /><Combo collection={References.deviceInOutCombo} name="sdk" onChange={this.handleChange} value={this.state.property.sdk} /></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_LAST_READ_VALUE}</label><br /><input type="text" name="value" className="form-control form-control-sm" value={this.state.property.value} readOnly={true} /></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_VERSION}</label><br /><input type="text" name="value" className="form-control form-control-sm" value={this.state.property.version} readOnly={true} /></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_GET_DATA}</label><br />
                        <button onClick={() => this.readValue()} title={this.props.resx.BTN_LBL_C2D} className={cx("btn ", !this.state.isDirty ? "btn-primary" : "btn-outline-primary")} >
                            <span className="fa fa-cloud-download"></span> {this.props.resx.READ}
                        </button>
                    </div>
                </div> : null}

                {/* d2c */}
                {this.state.property.type.direction === "d2c" ? <div className="property-fields">
                    <div className="field"><label>{this.props.resx.FRM_LBL_FIELD_NAME}</label><br /><input className="form-control full form-control-sm" type="text" name="name" onChange={this.handleChange} value={this.state.property.name} /></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_DEVICE_SDKOUT}</label><br /><Combo class="form-control-sm" collection={References.deviceInOutCombo} name="sdk" onChange={this.handleChange} value={this.state.property.sdk} /></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_AS_STRING}</label><br /><RadioBoolean name="string" onChange={this.handleChange} value={this.state.property.string} /></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_VALUE}</label><br />
                        <div className="input-group">
                            <input type="text" name="value" onChange={this.handleChange} value={this.state.property.value} className="form-control" />
                            <span className="input-group-append">
                                <button onClick={() => this.sendValue()} className={cx("btn ", !this.state.property.runloop.include ? "btn-primary" : "btn-outline-primary")}
                                    title={this.props.resx.BTN_LBL_D2C} >
                                    <span className="fa fa-cloud-upload"></span> {this.props.resx.SEND}
                                </button>
                            </span>
                        </div>
                    </div>
                </div> : null}

                <DeviceInstancePropertyRunLoop
                    property={this.state.property}
                    changeHandler={this.runloopChangeHandler}
                    resx={this.props.resx} />

                <div className="property-type-form">
                    <div className="field">
                        {this.state.property.type.direction === "d2c" ? <label>{this.props.resx.TEXT_JSON_TEMPLATE}</label> : <label>{this.props.resx.TEXT_DISPLAY_VALUE}</label>}
                        <RadioCollection collection={this.state.property.type.direction === "d2c" ? References.propTypeD2C : References.propTypeC2D} onChange={this.handlePropertyObjectChange} value={this.state.property.propertyObject.type} />
                        {this.state.property.propertyObject && this.state.property.propertyObject.type === "templated" ?
                            this.state.property.type.direction === "d2c" ?
                                <textarea name="template" className="form-control" onChange={this.handlePropertyObjectValueChange} value={this.state.property.propertyObject.template}>
                                    {FormatJSON({ "value": "_VALUE_" })}
                                </textarea>
                                :
                                <textarea name="template" className="form-control" readOnly={true}>
                                    {this.state.property.propertyObject.template}
                                </textarea>
                            : null}
                    </div>
                </div>

                <DeviceInstancePropertyMock
                    property={this.state.property}
                    addMockHandler={this.addMockLocalHandler}
                    deleteMockHandler={this.deleteMockLocalHandler}
                    changeHandler={this.mockChangeHandler}
                    sensorList={this.props.sensorList}
                    resx={this.props.resx} />

            </div>
        </div >
    }
}