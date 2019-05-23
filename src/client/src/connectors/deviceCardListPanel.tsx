import * as React from "react";
import { connect } from "react-redux";
import DeviceCard from './deviceCard'

class DeviceCardListPanel extends React.Component<any, any> {

    public constructor(props: any) {
        super(props);
    }

    render() {
        return <div className="device-cardlist-scroller">
            <div className="device-cardlist-scroller-header">
                <div className="section-title">{this.props.resx.TEXT_MOCK_DEVICES}</div>
            </div>
            <div className="device-cardlist-scroller-body">
                {this.props.devices.devices && this.props.devices.devices.length > 0 ?
                    this.props.devices.devices.map(function (item: any, index: number) {
                        return <DeviceCard device={item} index={index} key={index} />
                    })
                    :
                    <div>Click + to add a device</div>
                }
            </div>
        </div>
    }
}

/* this is to avoid the TypeScript issue using @connect */
function mapStateToProps(state: any) {
    return {
        devices: state.devices,
        resx: state.resx
    }
}

export default connect<{}, {}, {}>(mapStateToProps)(DeviceCardListPanel)