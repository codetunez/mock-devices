import * as React from "react";
import { connect } from "react-redux";
import DeviceCard from './deviceCard'

class DeviceCardListPanel extends React.Component<any, any> {

    public constructor(props: any) {
        super(props);
    }

    render() {
        return <div>
            {this.props.devices.devices ?
                this.props.devices.devices.map(function (item: any, index: number) {
                    return <DeviceCard device={item} index={index} key={index} />
                })
                :
                null
            }
        </div>
    }
}

/* this is to avoid the TypeScript issue using @connect */
function mapStateToProps(state: any) {
    return {
        devices: state.devices
    }
}

export default connect<{}, {}, {}>(mapStateToProps)(DeviceCardListPanel)