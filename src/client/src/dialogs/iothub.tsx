var classNames = require("classnames");
import * as React from "react";
import { Data } from '../data';
import * as DisplayActions from "../store/actions/displayActions"

export class IoTHub extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = this.initModel();

        setInterval(() => {
            let s: any = this.state;
            s.message = '';
            this.setState(s);
        }, 5000)
    }

    initModel(model?: any): any {
        let m: any = {};
        m.message = '';
        m.twinRead = model ? model.twinRead : this.props.twinRead;
        m.twinWrite = model ? model.twinWrite : this.props.twinWrite || JSON.stringify({
            "d2cProperty1": {
                "value": "property 1 value",
                "status": "completed",
                "message": "optional message",
                "statusCode": 200,
                "desiredVersion": 1
            },
            "d2cProperty2": {
                "value": "property 2 value",
                "status": "completed",
                "message": "optional message",
                "statusCode": 200,
                "desiredVersion": 1
            },
        }, null, 2);
        return m;
    }

    componentWillReceiveProps(nextProps: any) {
        this.setState(this.initModel(nextProps));
    }

    getTwin = () => {

        let payload = {
            connectionString: this.props.hubConnectionString
        };

        Data.GetTwin(payload, this.props.deviceId)
            .then((twin: any) => {
                let s: any = this.state;
                s.twinRead = twin;
                let t = JSON.parse(twin);
                if (t && t != null) {
                    delete t.properties.desired["$metadata"];
                    delete t.properties.desired["$version"];
                    s.twinWrite = JSON.stringify(t.properties.desired, null, 2);
                }
                s.message = this.props.resx.FETCHED + ": " + new Date().toString();
                this.setState(s);
            })
            .catch((err: any) => {
                let s: any = this.state;
                s.message = err.response.data;
                this.setState(s);
            })
    }

    writeTwin = () => {

        let payload = {
            connectionString: this.props.hubConnectionString,
            properties: JSON.parse(this.state.twinWrite)
        };

        Data.WriteTwin(payload, this.props.deviceId)
            .then((twin: any) => {
                let s: any = this.state;
                s.twinRead = twin;
                s.message = this.props.resx.WROTE + ": " + new Date().toString();
                this.setState(s);
            })
            .catch((err: any) => {
                let s: any = this.state;
                s.message = err.response.data;
                this.setState(s);
            })
    }

    close = () => {
        this.props.dispatch(DisplayActions.ToggleIoTHubPanel(''));
    }

    handleChange = (e: any) => {
        let s: any = this.state;
        s[e.target.name] = e.target.value;
        this.setState(s);
    }

    render() {
        return <div className="hub-service-client">
            <div className="header">
                <h4>{this.props.resx.FRM_HRD_INSPECT_HUB}</h4>
                <button className={classNames("btn btn-outline-danger")} onClick={this.close}>
                    <span className={classNames("fa fa-lg fa-close")}></span> {this.props.resx.CLOSE}
                </button>
            </div>

            <div className="body">
                <div className="item">
                    <b>{this.props.resx.TEXT_FULLTWIN}</b>
                    <textarea value={this.state.twinRead} readOnly />
                    <button className={classNames("btn btn-primary")} onClick={this.getTwin}>
                        <span className={classNames("fa fa-lg fa-cloud-download")}></span> {this.props.resx.READ} Twin on Server (D2C)
                    </button>
                </div>
                <div className="item">
                <b>{this.props.resx.TEXT_DESIRED}</b>
                    <textarea name="twinWrite" value={this.state.twinWrite} onChange={this.handleChange} />
                    <button className={classNames("btn btn-primary")} onClick={this.writeTwin}>
                        <span className={classNames("fa fa-lg fa-cloud-upload")}></span> {this.props.resx.WRITE} Twin on Server (C2D)
                    </button>
                </div>
            </div>

            <div className="footer">
                {this.state.message}
            </div>

        </div>
    }
}