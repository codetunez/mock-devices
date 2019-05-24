var classNames = require("classNames");
import * as React from "react";
import { DeviceInstancePropertyMock } from '../components/deviceInstancePropertyMock';
import { Combo, RadioBoolean, RadioCollection } from '../framework/controls'
import { FormatJSON } from '../framework/utils'
import Toggle from 'react-toggle'
const cx = classNames.bind(require('./deviceInstanceProperty.scss'));

let References = {
    devicePropType: [{ name: "String", value: "true" }, { name: "Num/Bool", value: "false" }],
    propTypeD2C: [{ label: "No use default", value: "default" }, { label: "Use a Template", value: "templated" }],
    propTypeC2D: [{ label: "No", value: "default" }, { label: "Yes", value: "templated" }],
    deviceInOutCombo: [{ name: "Twin", value: "twin" }, { name: "Msg", value: "msg" }],
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

        let frequencyCombo = [{ name: "secs", value: "secs" }, { name: "min", value: "min" }]
        let propertyColor = this.state.property.type.direction === "d2c" ? "" : "property-c2d";
        let sendButtonLabel = this.state.property.type.mock === true ? this.props.resx.TEXT_OVERRIDE_MOCK :
            (this.state.property.type.direction === "d2c" && this.state.property.runloop && this.state.property.runloop.include === true ? this.props.resx.TEXT_SEND_NOW : this.props.resx.TEXT_SEND);


        return <div key={this.props.index} className={cx("property", propertyColor, this.props.dirty.devicePropertyId === this.state.property._id ? "property-dirty" : "", this.state.collapsed ? "property-collapsed" : "")}>

            {/* toolbar */}
            <div className="p2-toolbar">
                <div className="p2-toolbar-left">
                    <div className="chevron">
                        <a className="toggle-link" href="javascript:void(0)" onClick={() => this.toggleMe()}><div className={cx("fa", this.state.collapsed ? "fa-chevron-down" : "fa-chevron-up")}></div></a>
                    </div>
                    <div className="title">
                        <label>
                            {this.state.property.type.direction === "d2c" ? (this.state.property.type.mock === true ? this.props.resx.TEXT_D2C_MOCK : this.props.resx.TEXT_D2C) : this.props.resx.TEXT_C2D}
                            <span> </span>
                            {this.state.property.runloop && this.state.property.runloop.include === true ? <span className="fa fa-clock-o"></span> : null}
                            <span> </span>
                            {this.state.property.runloop && this.state.property.runloop.include === true ? <span>{this.state.property.runloop.value} {this.state.property.runloop.unit}</span> : null}
                        </label>
                        <div>{this.state.property.name}</div>
                    </div>
                </div>
                <div className="p2-toolbar-right">
                    <div className="title">
                        <label>LAST SENT VALUE</label>
                        <div>0000.00000</div>
                    </div>
                </div>
            </div>

            {/* toolbar */}
            {this.state.property.type.direction === "d2c" ? <div>
                <div className="p2-fields">
                    <div className="field"><label>Enabled</label><br /><div><Toggle defaultChecked={true} icons={false} /></div></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_FIELD_NAME}</label><br /><input className="form-control full form-control-sm" type="text" name="name" onChange={this.handleChange} value={this.state.property.name} /></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_DEVICE_SDKOUT}</label><br /><Combo class="form-control-sm" collection={References.deviceInOutCombo} name="sdk" onChange={this.handleChange} value={this.state.property.sdk} /></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_AS_STRING}</label><br /><Combo class="form-control-sm" collection={References.devicePropType} name="string" onChange={this.handleChange} value={this.state.property.string} /></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_VALUE}</label><br /><input type="text" name="value" onChange={this.handleChange} value={this.state.property.value} className="form-control form-control-sm" /></div>
                    <div className="field"><label>Actions</label><br /><div className="btn-bar">
                        <button onClick={() => this.sendValue()} className={cx("btn btn-sm ", !this.state.property.runloop.include ? "btn-primary" : "btn-outline-primary")} title={this.props.resx.BTN_LBL_D2C} >Test</button>
                        <button title={this.props.resx.BTN_LBL_PROPERTY_SAVE} className={cx("btn btn-sm", this.props.dirty.devicePropertyId === this.state.property._id ? "btn-warning" : "btn-outline-secondary")} onClick={() => this.updateProperty()}><span className="fa fa-floppy-o"></span></button>
                        <button title={this.props.resx.BTN_LBL_PROPERTY_DELETE} className="btn btn-sm btn-outline-danger" onClick={() => this.props.deleteHandler(this.state.property._id)}><span className={cx("fa fa-trash")}></span></button>
                    </div>
                    </div>
                </div>

                <div className="p2-fields">
                    <div className="field"><label>Send Data Frequently</label><br /><div><Toggle name="include" defaultChecked={this.state.property.runloop.include} icons={false} onChange={this.runloopChangeHandler} /></div></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_TIME_PERIOD}</label><br /><Combo class="form-control-sm" collection={frequencyCombo} name="unit" onChange={this.props.changeHandler} value={this.props.property.runloop.unit} showSelect={false} /></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_VALUE}</label><br /><input maxLength={2} name="value" className="form-control  form-control-sm" type="text" onChange={this.props.changeHandler} value={this.props.property.runloop.value} /></div>
                </div>

                <div className="p2-fields">
                    <div className="field"><label>Use a Mock Sensor</label><br /><div><Toggle defaultChecked={this.state.property.runloop.include} icons={false} /></div></div>
                    <div className="field">
                        <DeviceInstancePropertyMock
                            property={this.state.property}
                            addMockHandler={this.addMockLocalHandler}
                            deleteMockHandler={this.deleteMockLocalHandler}
                            changeHandler={this.mockChangeHandler}
                            sensorList={this.props.sensorList}
                            resx={this.props.resx} />
                    </div>
                </div>

                <div className="p2-fields">
                    <div className="field"><label>JSON Value Template</label><br /><div><Toggle defaultChecked={this.state.tofuIsReady} icons={false} /></div></div>
                </div>
            </div> : null}
        </div>

        // return <div key={this.props.index} className={cx("property", propertyColor, this.props.dirty.devicePropertyId === this.state.property._id ? "property-dirty" : "", this.state.collapsed ? "property-collapsed" : "")}>

        //     {/* toolbar */}
        //     <div className="property-fields property-toolbar">
        //         <a className="toggle-link" href="javascript:void(0)" onClick={() => this.toggleMe()}>
        //             <div className={cx("text-primary property-header")}>
        //                 <div className={cx("fa", this.state.collapsed ? "fa-chevron-down" : "fa-chevron-up")}></div>
        //                 <div className={propertyButtonIcon}></div>
        //                 <div>{this.state.property.type.direction === "d2c" ? (this.state.property.type.mock === true ? this.props.resx.TEXT_D2C_MOCK : this.props.resx.TEXT_D2C) : this.props.resx.TEXT_C2D}</div>
        //                 <div>({this.state.property.name})</div>
        //                 {this.state.property.runloop && this.state.property.runloop.include === true ? <div className="fa fa-clock-o"></div> : null}
        //                 {this.state.property.runloop && this.state.property.runloop.include === true ? <div>{this.state.property.runloop.value} {this.state.property.runloop.unit}</div> : null}
        //             </div>
        //         </a>
        //     </div>

        //     <div className="property-body">

        //         {/* c2d */}
        //         {this.state.property.type.direction === "c2d" ? <div className="property-fields">
        //             <div className="field"><label>{this.props.resx.FRM_LBL_FIELD_NAME}</label><br /><input className="form-control full form-control-sm" type="text" name="name" onChange={this.handleChange} value={this.state.property.name} /></div>
        //             <div className="field"><label>{this.props.resx.FRM_LBL_DEVICE_SDKIN}</label><br /><Combo collection={References.deviceInOutCombo} name="sdk" onChange={this.handleChange} value={this.state.property.sdk} /></div>
        //             <div className="field"><label>{this.props.resx.FRM_LBL_LAST_READ_VALUE}</label><br /><input type="text" name="value" className="form-control form-control-sm" value={this.state.property.value} readOnly={true} /></div>
        //             <div className="field"><label>{this.props.resx.FRM_LBL_VERSION}</label><br /><input type="text" name="value" className="form-control form-control-sm" value={this.state.property.version} readOnly={true} /></div>
        //             <div className="field"><label>{this.props.resx.FRM_LBL_GET_DATA}</label><br />
        //                 <button onClick={() => this.readValue()} title={this.props.resx.BTN_LBL_C2D} className={cx("btn ", !this.state.isDirty ? "btn-primary" : "btn-outline-primary")} >
        //                     <span className="fa fa-cloud-download"></span> {this.props.resx.READ}
        //                 </button>
        //             </div>
        //         </div> : null}

        //         {/* d2c */}
        //         {this.state.property.type.direction === "d2c" ? <div className="property-fields">
        //             <div className="field"><label>{this.props.resx.FRM_LBL_FIELD_NAME}</label><br /><input className="form-control full form-control-sm" type="text" name="name" onChange={this.handleChange} value={this.state.property.name} /></div>
        //             <div className="field"><label>{this.props.resx.FRM_LBL_DEVICE_SDKOUT}</label><br /><Combo class="form-control-sm" collection={References.deviceInOutCombo} name="sdk" onChange={this.handleChange} value={this.state.property.sdk} /></div>
        //             <div className="field"><label>{this.props.resx.FRM_LBL_AS_STRING}</label><br /><RadioBoolean name="string" onChange={this.handleChange} value={this.state.property.string} /></div>
        //             <div className="field"><label>{this.props.resx.FRM_LBL_VALUE}</label><br />
        //                 <div className="input-group">
        //                     <input type="text" name="value" onChange={this.handleChange} value={this.state.property.value} className="form-control" />
        //                     <span className="input-group-append">
        //                         <button onClick={() => this.sendValue()} className={cx("btn ", !this.state.property.runloop.include ? "btn-primary" : "btn-outline-primary")}
        //                             title={this.props.resx.BTN_LBL_D2C} >
        //                             <span className="fa fa-cloud-upload"></span> {this.props.resx.SEND}
        //                         </button>
        //                     </span>
        //                 </div>
        //             </div>
        //         </div> : null}

        //         <DeviceInstancePropertyRunLoop
        //             property={this.state.property}
        //             changeHandler={this.runloopChangeHandler}
        //             resx={this.props.resx} />

        //         <div className="property-type-form">
        //             <div className="field">
        //                 {this.state.property.type.direction === "d2c" ? <label>{this.props.resx.TEXT_JSON_TEMPLATE}</label> : <label>{this.props.resx.TEXT_DISPLAY_VALUE}</label>}
        //                 <RadioCollection collection={this.state.property.type.direction === "d2c" ? References.propTypeD2C : References.propTypeC2D} onChange={this.handlePropertyObjectChange} value={this.state.property.propertyObject.type} />
        //                 {this.state.property.propertyObject && this.state.property.propertyObject.type === "templated" ?
        //                     this.state.property.type.direction === "d2c" ?
        //                         <textarea name="template" className="form-control" onChange={this.handlePropertyObjectValueChange} value={this.state.property.propertyObject.template}>
        //                             {FormatJSON({ "value": "_VALUE_" })}
        //                         </textarea>
        //                         :
        //                         <textarea name="template" className="form-control" readOnly={true}>
        //                             {this.state.property.propertyObject.template}
        //                         </textarea>
        //                     : null}
        //             </div>
        //         </div>

        //         <DeviceInstancePropertyMock
        //             property={this.state.property}
        //             addMockHandler={this.addMockLocalHandler}
        //             deleteMockHandler={this.deleteMockLocalHandler}
        //             changeHandler={this.mockChangeHandler}
        //             sensorList={this.props.sensorList}
        //             resx={this.props.resx} />

        //     </div>

        //     <div className="btn-bar">
        //         <button title={this.props.resx.BTN_LBL_PROPERTY_SAVE} className={cx("btn btn-sm", this.props.dirty.devicePropertyId === this.state.property._id ? "btn-warning" : "btn-outline-secondary")} onClick={() => this.updateProperty()}><span className="fa fa-floppy-o"></span></button>
        //         <button title={this.props.resx.BTN_LBL_PROPERTY_DELETE} className="btn btn-sm btn-outline-danger" onClick={() => this.props.deleteHandler(this.state.property._id)}><span className={cx("fa fa-trash")}></span></button>
        //     </div>
        // </div >
    }
}