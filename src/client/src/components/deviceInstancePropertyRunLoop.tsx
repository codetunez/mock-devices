import * as React from "react";
import { Combo } from '../framework/controls'

export class DeviceInstancePropertyRunLoop extends React.Component<any, any> {

    render() {
        let frequencyCombo = [{ name: "secs", value: "secs" }, { name: "min", value: "min" }]
        return this.props.property.type.direction === "d2c" ? <div className="property-type-form">

            <label className="custom-control custom-checkbox" style={{ marginLeft: "3px", marginBottom: "0" }}>
                <input type="checkbox" className="custom-control-input" name="include" onChange={this.props.changeHandler} checked={this.props.property.runloop.include} />
                <span className="custom-control-indicator"></span>
                <span className="custom-control-description seperator-heading"><b>{this.props.resx.FRM_LBL_RUN_LOOP}</b></span>
            </label>

            {this.props.property.runloop.include === true ?
                <div className="property-fields property-fields-no-bottom ">
                    <div className="field"><label>{this.props.resx.FRM_LBL_TIME_PERIOD}</label><br /><Combo collection={frequencyCombo} name="unit" onChange={this.props.changeHandler} value={this.props.property.runloop.unit} showSelect={false} /></div>
                    <div className="field"><label>{this.props.resx.FRM_LBL_VALUE}</label><br /><input maxLength={2} name="value" className="form-control full" type="text" onChange={this.props.changeHandler} value={this.props.property.runloop.value} /></div>
                </div>
            : null}
        </div>
            : null
    }
}