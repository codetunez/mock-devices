var classNames = require("classnames");
import * as React from "react";
import * as Websocket from 'react-websocket';
const cx = classNames.bind(require('../comms/deviceInstanceProperty.scss'));

export class DeviceInstancePropertyMock extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            sensor: this.props.property.mock,
            liveValue: 'Waiting ...'
        }
    }

    componentWillReceiveProps(nextProps: any) {
        let s: any = this.state;
        s.sensor = nextProps.property.mock;
        this.setState(s);
    }

    onSensorSelected = (sensor: any) => {
        let s: any = this.state;
        s.sensor = sensor;
        this.setState(s, () => {
            this.props.changeHandler(s.sensor);
        });
    }

    onValueChange = (e: any) => {
        let s: any = this.state;
        s.sensor[e.target.name] = e.target.value;
        this.setState(s, () => {
            this.props.changeHandler(s.sensor);
        });
    }

    handleData = (data: any) => {
        let s: any = this.state;
        let liveUpdates = JSON.parse(data);
        s.liveValue = liveUpdates[this.props.property._id];
        this.setState(s);
    }

    render() {

        let fields = [];
        let keyCounter = 0;
        for (var propertyName in this.state.sensor) {
            if (propertyName[0] != "_") {
                fields.push(<div className="field" key={keyCounter}>
                    <label title={propertyName}>{propertyName}</label>
                    <input type="text" className="form-control form-control-sm" onChange={this.onValueChange} name={propertyName} value={this.state.sensor[propertyName]} />
                </div>)
                keyCounter++;
            }
        }

        fields.push(<div className="field" key={999}>
            <label title="Live Value">{this.props.resx.FRM_LBL_LIVE_VALUE}</label>
            <div className="live-value-field">{this.state.liveValue}</div>
        </div>);


        return this.props.property.type.mock === true ? <div className="property-type-form">
            
            <label className="seperator-heading"><b>{this.props.resx.FRM_LBL_MOCK_SEN_CFG}</b></label>
            <div className="btn-group" role="group" >
                {this.props.sensorList.map((item: any, index: number) => {
                    return <button key={index} type="button" className={classNames("btn btn-sm btn-outline-primary", this.state.sensor && this.state.sensor._type === item._type ? "active" : "")} onClick={() => this.onSensorSelected(item)}>{item._type}</button>
                })}
            </div>
            <div className={cx("p2-fields")}>
                {fields}
            </div>
        </div>
            : this.props.property.type.direction === "d2c" ? <div className="property-type-form">
                <label className="seperator-heading"><b>{this.props.resx.FRM_LBL_MOCK_SEN_CFG}</b></label>
                <div className="">
                    <button className="btn btn-sm btn-outline-info" onClick={this.props.addMockHandler}><span className="fa fa-thermometer-full"></span> {this.props.resx.BTN_ADD_MOCK}</button>
                </div>
            </div> : null
    }
}