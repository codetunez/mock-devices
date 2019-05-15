import * as React from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
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
            hubConnectionString: model ? model.hubConnectionString : this.props.hubConnectionString
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

        return <div style={{ width: "480px", height: "480px" }}>
            <Tabs>
                <TabList>
                    <Tab><b>{this.props.resx.FRM_LBL_ADD_DEVICE}</b></Tab>
                    <Tab><b>Add a DCM as a Template</b></Tab>
                </TabList>
                <TabPanel>
                    <div>
                        <p>If you are using DPS, you can generate a Device Connection string<br />using <em>npm i dps-keygen -g</em></p>
                        <div>
                            <div className="form-group">
                                <label>{this.props.resx.FRM_LBL_DEVICE_HUB_CONN_STRING}</label>
                                <textarea className="form-control sm" name="connectionString" onChange={this.handleChange} value={this.state.updatePayload.connectionString || ''}></textarea>
                            </div>
                            <div className="form-group">
                                <label>{this.props.resx.FRM_LBL_CONNSTRING_DEVICE_NAME}</label>
                                <input className="form-control" type="text" name="name" onChange={this.handleChange} value={this.state.updatePayload.name || ''} />
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
                </TabPanel>
                <TabPanel>
                    <div>
                        <p>Add a IoT Plug and Play Device Capability Model as a template. Use<br />this to create a mock-devices device models</p>
                        <div>
                            <div className="form-group">
                                <label>DCM JSON</label>
                                <textarea className="form-control sm" name="connectionString" onChange={this.handleChange} value={this.state.updatePayload.dcmJson || ''}></textarea>
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button className="btn btn-outline-primary" onClick={() => this.action()}>{this.props.resx.ADD}</button>
                        </div>
                    </div>
                </TabPanel>
            </Tabs>
        </div>
    }
}