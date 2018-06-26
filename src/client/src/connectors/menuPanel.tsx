var classNames = require("classnames");
import * as React from "react";
import { connect } from "react-redux";
import { Server } from '../dialogs/server';
import { AddDevice } from '../dialogs/addDevice';
import { ExImport } from '../dialogs/exImport';
import * as DisplayActions from "../store/actions/displayActions"
import * as DevicesActions from "../store/actions/devicesActions"
import * as StateActions from "../store/actions/stateActions"

class MenuPanel extends React.Component<any, any> {

    // option 1
    toggleNewDevicePanel = () => {
        this.props.dispatch(DisplayActions.ToggleNewDevicePanel());
    }

    // option 2
    toggleExImportPanel = () => {
        this.props.dispatch(StateActions.getCurrentState())
            .then(() => {
                this.props.dispatch(DisplayActions.ToggleEximportPanel());
            });
    }

    // option 3
    startAllDevices = () => {
        this.props.dispatch(DevicesActions.StartAllDevices(this.props.display.deviceSelectedIndex));
    }

    // option 4
    stopAllDevices = () => {
        this.props.dispatch(DevicesActions.StopAllDevices(this.props.display.deviceSelectedIndex));
    }

    // option 5
    reinit = () => {
        this.props.dispatch(DevicesActions.loadInitialState(this.props.display.deviceSelectedIndex));
    }

    // option 6
    toggleServerPanel = () => {
        this.props.dispatch(DisplayActions.ToggleServerPanel());
    }

    render() {
        return <div className="menu">

            <button title={this.props.resx.BTN_LBL_ADDEVICE} className={classNames("btn btn-outline-primary menu-btn", this.props.display.showDevicePanel ? "warning-active" : "")} onClick={() => this.toggleNewDevicePanel()}>
                <span className={classNames("fa fa-lg fa-plus")}></span>
            </button >
            {this.props.display.showDevicePanel ? <div className="panel-dialog panel-dialog-device"><AddDevice devices={this.props.devices.devices} dispatch={this.props.dispatch} connectionString={this.props.display.connectionString} hubConnectionString={this.props.display.hubConnectionString} resx={this.props.resx} /></div> : null}
            < hr />

            <button title={this.props.resx.BTN_LBL_EXIMPORT} className={classNames("btn btn-outline-primary menu-btn", this.props.display.showExImportPanel ? "warning-active" : "")} onClick={() => this.toggleExImportPanel()}>
                <span className={classNames("fa fa-lg fa-floppy-o")}></span>
            </button>
            {this.props.display.showExImportPanel ? <div className="panel-dialog panel-dialog-eximport"><ExImport dispatch={this.props.dispatch} state={this.props.state} resx={this.props.resx} /></div> : null}
            <hr />

            <button title={this.props.resx.BTN_LBL_STARTALL} className="btn btn-outline-primary menu-btn" onClick={this.startAllDevices}>
                <span className={classNames("fa fa-lg fa-play")}></span>
            </button>

            <button title={this.props.resx.BTN_LBL_STOPALL} className="btn btn-outline-primary menu-btn" onClick={this.stopAllDevices}>
                <span className={classNames("fa fa-lg fa-stop")}></span>
            </button>

            <button title={this.props.resx.BTN_LBL_REFRESH} className="btn btn-outline-primary menu-btn" onClick={this.reinit}>
                <span className={classNames("fa fa-lg fa-refresh")}></span>
            </button>
            <hr />

            <button title={this.props.resx.BTN_LBL_SERVER} className={classNames("btn btn-outline-primary menu-btn", this.props.display.showServerPanel ? "warning-active" : "")} onClick={() => this.toggleServerPanel()}>
                <span className={classNames("fa fa-server")} ></span>
            </button>
            {this.props.display.showServerPanel ? <div className="panel-dialog panel-dialog-server"><Server dispatch={this.props.dispatch} devices={this.props.devices.devices} resx={this.props.resx} /></div> : null}

            <div className={classNames(this.props.display.showDevicePanel || this.props.display.showExImportPanel || this.props.display.showServerPanel ? "blast-shield blast-shield-nottoolbar" : "")}></div>
        </div >
    }
}

/* this is to avoid the TypeScript issue using @connect */
function mapStateToProps(state: any) {
    return {
        display: state.display,
        resx: state.resx,
        devices: state.devices,
        state: state.state
    }
}

export default connect<{}, {}, {}>(mapStateToProps)(MenuPanel)