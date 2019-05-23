var classNames = require("classnames");
import * as React from "react";
import { connect } from "react-redux";
import { IoTHub } from '../dialogs/iotHub';
import * as Websocket from 'react-websocket';
import DeviceCardListPanel from './deviceCardListPanel'
import DeviceInstancePanel from './deviceInstancePanel'
import MenuPanel from './menuPanel'
import * as DevicesActions from '../store/actions/devicesActions'
import * as DisplayActions from '../store/actions/displayActions'
import * as SensorsActions from '../store/actions/sensorsActions'
import { AddDevice } from '../dialogs/addDevice';

const cx = classNames.bind(require('./layout.scss'));

class Layout extends React.Component<any, any> {

    public constructor(props: any) {
        super(props);

        // the timing doesn't really matter because it's local
        this.props.dispatch(SensorsActions.LoadSensors())
            .then(() => {
                this.props.dispatch(DevicesActions.loadInitialState(-1));
            })

        this.state = {
            messages: []
        }
    }

    handleData = (data: any) => {
        let s: any = this.state;
        let liveUpdates = JSON.parse(data);
        s.messages.unshift(liveUpdates.message);
        if (s.messages.length > 10) {
            s.messages.pop();
        }
        this.setState(s);
    }

    toggleConsole = () => {
        this.props.dispatch(DisplayActions.ToggleConsole());
    }

    render() {
        let m = [];
        this.state.messages.forEach((element, index) => {
            m.push(<div key={index} className="ellipsis">{element}</div>);
        });

        return <div className={cx("layout")}>

            <div className={classNames(this.props.display.showDevicePanel || this.props.display.showExImportPanel || this.props.display.showIotHubPanel ? "blast-shield blast-shield-nottoolbar" : "")}></div>
            {this.props.display.showDevicePanel ? <div className="panel-dialog panel-dialog-device"><AddDevice devices={this.props.devices.devices} dispatch={this.props.dispatch} resx={this.props.resx} /></div> : null}
            {this.props.display.showIotHubPanel ? <div className="panel-dialog panel-dialog-full panel-dialog-iothub"><IoTHub resx={this.props.resx} dispatch={this.props.dispatch} hubConnectionString={this.props.device.device.configuration.hubConnectionString || ''} deviceId={this.props.device.device._id} /></div> : null}

            <Websocket url={'ws://127.0.0.1:24386'} onMessage={this.handleData.bind(this)} />

            <div className={cx("console-window", this.props.display.consoleExpanded ? "console-window-tall" : "")} title={this.state.message}>
                <div className="console-toggle">
                    <a onClick={this.toggleConsole}><span className={classNames("fa", !this.props.display.consoleExpanded ? "fa-chevron-up" : "fa-chevron-down")}></span></a>
                </div>
                <div className="console-messages">{m.length > 0 ? m : 'CONSOLE OUTPUT'}</div>
            </div>

            <div className="content-window">
                <div className="menu-panel"><MenuPanel /></div>
                <div className="inner-content-window">
                    <div className="device-cardlist-panel"><DeviceCardListPanel /></div>
                    <div className="device-instance-panel"><DeviceInstancePanel /></div>
                </div>
            </div>
        </div>
    }
}

/* this is to avoid the TypeScript issue using @connect */
function mapStateToProps(state: any) {
    return {
        devices: state.devices,
        display: state.display,
        resx: state.resx
    }
}

export default connect<{}, {}, {}>(mapStateToProps)(Layout)