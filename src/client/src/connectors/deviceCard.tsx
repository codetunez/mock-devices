var classNames = require("classnames");
import * as React from "react";
import { connect } from "react-redux";
import * as DeviceActions from "../store/actions/deviceActions"

class DeviceCard extends React.Component<any, any> {

    displaySelectedDevice = () => {
        this.props.dispatch(DeviceActions.SelectDevice(this.props.index));
        this.props.dispatch(DeviceActions.DisplaySelectedDevice(this.props.device));
    }

    render() {
        return <div className={classNames("card", { "active": this.props.index === this.props.display.deviceSelectedIndex })} onClick={() => this.displaySelectedDevice()} >
            <div className="card-block" title={this.props.resx.BTN_LBL_SELECT_DEVICE}>
                <h4 className="card-title">{this.props.device.name}</h4>
                <p className="card-text">{this.props.device._id}</p>
                <div>
                    {this.props.device.template ?
                        <span className={classNames("fa fa-ban fa-2x fa-fw")}></span> :
                        <div className={classNames("fa fa-spinner fa-2x fa-fw", { "fa-pulse": this.props.device.running })}></div>
                    }
                </div>
            </div>
        </div>
    }
}

/* this is to avoid the TypeScript issue using @connect */
function mapStateToProps(state: any) {
    return {
        display: state.display,
        resx: state.resx
    }
}

export default connect<{}, {}, any>(mapStateToProps)(DeviceCard)