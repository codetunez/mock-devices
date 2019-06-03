var classNames = require("classNames");
import * as React from "react";
import { DeviceInstancePropertyMock } from '../components/deviceInstancePropertyMock';
import { Combo, RadioBoolean, RadioCollection } from '../framework/controls'
import { FormatJSON } from '../framework/utils'
const cx = classNames.bind(require('./deviceInstanceProperty.scss'));
import Toggle from 'react-toggle'
import * as Websocket from 'react-websocket';


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
            collapsed: this.props.display.propertyToggle[this.props.property._id],
            liveValue: 0
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

    handlePropertyObjectChange = (e: any) => {

        let value = e.target.checked ? "templated" : "default";

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

    mockChangedHandler = () => {
        if (this.state.property.type.mock) {
            this.props.deleteMockHandler(this.state.property._id);
        } else {
            this.props.addMockHandler(this.state.property);
        }
    }

    // addMockLocalHandler = () => {
    //     this.props.addMockHandler(this.state.property);
    // }

    // deleteMockLocalHandler = () => {
    //     this.props.deleteMockHandler(this.state.property._id);
    // }

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

    /* mock sensor */
    onSensorSelected = (sensor: any) => {
        this.mockChangeHandler(sensor);
    }

    onMockValueChange = (e: any) => {
        // let s: any = this.state;
        // s.sensor[e.target.name] = e.target.value;
        // this.setState(s, () => {
        //    this.mockChangeHandler(s.sensor);
        // });
    }

    handleData = (data: any) => {
        let s: any = this.state;
        let liveUpdates = JSON.parse(data);
        s.liveValue = liveUpdates[this.props.property.name];
        this.setState(s);
    }

    render() {

        let frequencyCombo = [{ name: "secs", value: "secs" }, { name: "min", value: "min" }]
        let propertyColor = this.state.property.type.direction === "d2c" ? "" : "property-c2d";
        let sendButtonLabel = this.state.property.type.mock === true ? this.props.resx.TEXT_OVERRIDE_MOCK :
            (this.state.property.type.direction === "d2c" && this.state.property.runloop && this.state.property.runloop.include === true ? this.props.resx.TEXT_SEND_NOW : this.props.resx.TEXT_SEND);

        let fields = [];
        if (this.props.property.mock) {
            let keyCounter = 0;
            for (var propertyName in this.props.property.mock) {
                if (propertyName[0] != "_") {
                    fields.push(<div className="field" key={keyCounter}>
                        <label title={propertyName}>{this.props.property.mock._resx[propertyName]}</label>
                        <input type="text" className="form-control form-control-sm" onChange={this.onMockValueChange} name={propertyName} value={this.props.property.mock[propertyName]} />
                    </div>)
                    keyCounter++;
                }
            }

            fields.push(<div className="field" key={999}>
                <label title="Live Value">{this.props.resx.FRM_LBL_LIVE_VALUE}</label>
                <div className="live-value-field">{this.state.liveValue}</div>
            </div>);
        }


        return <div key={this.props.index} className={cx("property", propertyColor, this.props.dirty.devicePropertyId === this.state.property._id ? "property-dirty" : "", this.state.collapsed ? "property-collapsed" : "")}>
            <Websocket url={'ws://127.0.0.1:24376'} onMessage={this.handleData.bind(this)} />

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
                {this.state.property.type.direction === "d2c" ? <div className="p2-toolbar-right">
                    <div className="title">
                        <label>LAST SENT VALUE</label>
                        <div>{this.state.liveValue}</div>
                    </div>
                </div> : null}
            </div>

            {/* c2d */}
            {this.state.property.type.direction === "c2d" ?
                <div>
                    <div className="p2-fields">
                        <div className="field"><label>{this.props.resx.FRM_LBL_FIELD_NAME}</label><br /><input className="form-control full form-control-sm" type="text" name="name" onChange={this.handleChange} value={this.state.property.name} /></div>
                        <div className="field"><label>{this.props.resx.FRM_LBL_DEVICE_SDKIN}</label><br /><Combo class="form-control-sm" collection={References.deviceInOutCombo} name="sdk" onChange={this.handleChange} value={this.state.property.sdk} /></div>
                        <div className="field"><label>{this.props.resx.FRM_LBL_LAST_READ_VALUE}</label><br /><input type="text" name="value" className="form-control form-control-sm" value={this.state.property.value} readOnly={true} /></div>
                        <div className="field"><label>{this.props.resx.FRM_LBL_VERSION}</label><br /><input type="text" name="value" className="form-control form-control-sm" value={this.state.property.version} readOnly={true} /></div>

                        <div className="field"><label>{this.props.resx.FRM_LBL_GET_DATA}</label><br /><div className="btn-bar">
                            <button onClick={() => this.readValue()} title={this.props.resx.BTN_LBL_C2D} className={cx("btn btn-sm", !this.state.isDirty ? "btn-primary" : "btn-outline-primary")} >
                                <span className="fa fa-cloud-download"></span> {this.props.resx.READ}
                            </button>
                            <button title={this.props.resx.BTN_LBL_PROPERTY_SAVE} className={cx("btn btn-sm", this.props.dirty.devicePropertyId === this.state.property._id ? "btn-warning" : "btn-outline-secondary")} onClick={() => this.updateProperty()}><span className="fa fa-floppy-o"></span></button>
                            <button title={this.props.resx.BTN_LBL_PROPERTY_DELETE} className="btn btn-sm btn-outline-danger" onClick={() => this.props.deleteHandler(this.state.property._id)}><span className={cx("fa fa-trash")}></span></button>
                        </div>
                        </div>
                    </div>
                </div>
                : null}

            {/* d2c */}
            {this.state.property.type.direction === "d2c" ?
                <div>
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
                        {this.state.property.runloop.include ? <div className="field"><label>{this.props.resx.FRM_LBL_TIME_PERIOD}</label><br /><Combo class="form-control-sm" collection={frequencyCombo} name="unit" onChange={this.props.changeHandler} value={this.props.property.runloop.unit} showSelect={false} /></div> : null}
                        {this.state.property.runloop.include ? <div className="field"><label>{this.props.resx.FRM_LBL_VALUE}</label><br /><input maxLength={2} name="value" className="form-control  form-control-sm" type="text" onChange={this.props.changeHandler} value={this.props.property.runloop.value} /></div> : null}
                    </div>


                    <div className="p2-fields">
                        <div className="field"><label>Use a Mock Sensor</label><br /><div><Toggle defaultChecked={this.props.property.type.mock} onChange={this.mockChangedHandler} icons={false} /></div></div>
                        {this.state.property.type.mock ?
                            <div className="field">
                                <label className="seperator-heading"><b>{this.props.resx.FRM_LBL_MOCK_SEN_CFG}</b></label>
                                <div className="btn-group" role="group" >
                                    {this.props.sensorList.map((item: any, index: number) => {
                                        return <button key={
                                            index} type="button" className={classNames("btn btn-sm btn-outline-primary", this.props.property.mock && this.props.property.mock._type === item._type ? "active" : "")} onClick={() => this.onSensorSelected(item)}>{item._type}</button>
                                    })}
                                </div>
                            </div>
                            : null}
                    </div>

                    {this.state.property.type.mock ?
                        <div className="p2-fields" style={{ marginTop: "-20px" }}>
                            <div className="field"></div>
                            {fields}
                        </div>
                        : null}

                    <div className="p2-fields">
                        <div className="field"><label>JSON Value Template</label><br /><div><Toggle defaultChecked={this.state.property.propertyObject.type === 'templated' ? true : false} icons={false} onChange={this.handlePropertyObjectChange} /></div></div>
                        <div className="field field-xw">
                            <label className="seperator-heading"><b>Template</b></label>
                            {this.state.property.propertyObject.type === "templated" ?
                                <textarea name="template" rows={5} className="form-control custom-textarea" onChange={this.handlePropertyObjectValueChange} value={this.state.property.propertyObject.template}>
                                    {FormatJSON({ "value": "_VALUE_" })}
                                </textarea>
                                : null}
                        </div>
                    </div>
                </div>
                : null}
        </div>

    }
}