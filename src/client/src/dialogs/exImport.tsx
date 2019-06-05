var cx = require("classnames");

import * as React from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import * as Local from '../localStorage';
import * as StateActions from "../store/actions/stateActions"
import * as DisplayActions from "../store/actions/displayActions"

export class ExImport extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = this.initModel();
        this.escFunction = this.escFunction.bind(this);
        this.close = this.close.bind(this);
    }

    initModel(model?: any): any {
        let m: any = {};
        m.exImport = JSON.stringify(model ? model.state : this.props.state, null, 2);
        m.error = '';
        m.local = Local.GetSaveStates();
        m.saveName = '';
        return m;
    }

    escFunction(event) {
        if (event.keyCode === 27) { this.close(); }
    }

    close() {
        this.props.dispatch(DisplayActions.ToggleEximportPanel());
    }

    componentDidMount() {
        document.addEventListener("keydown", this.escFunction, false);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.escFunction, false);
    }

    componentWillReceiveProps(nextProps: any) {
        this.setState(this.initModel(nextProps));
    }

    handleChange = (e: any) => {
        let s: any = this.state;
        s[e.target.name] = e.target.value;
        this.setState(s);
    }

    saveState = () => {
        Local.SaveState({
            date: new Date().toLocaleString(),
            name: this.state.saveName,
            payload: JSON.parse(JSON.stringify(this.state.exImport))
        })
        let s: any = this.state;
        s.local = Local.GetSaveStates();
        this.setState(s);
    }

    deleteState = (index: number) => {
        Local.DeleteState(index);
        let s: any = this.state;
        s.local = Local.GetSaveStates();
        this.setState(s);
    }

    loadState = (index: number) => {
        let s = Local.GetSaveState(index);
        this.props.dispatch(StateActions.setNewState(JSON.parse(s)))
            .then((devices) => {
                // safest is to reload the tool
                window.location.href = '/';
            })
    }

    handleImport = () => {
        var that = this;
        this.props.dispatch(StateActions.setNewState(JSON.parse(this.state.exImport)))
            .then((devices) => {
                // safest is to reload the tool
                window.location.href = '/';
            })
    }

    render() {
        return <div className="add-dialog">
            <div className="add-dialog-nav">
                <div>Local Storage</div>
                <button onClick={() => this.setState({ panel: 0 })} className={cx("btn btn-outline-primary", this.state.panel === 0 ? "active" : "")}>Load Local Storage</button><br />
                <button onClick={() => this.setState({ panel: 1 })} className={cx("btn btn-outline-primary", this.state.panel === 1 ? "active" : "")}>Save to Local Storage</button><br />
                <div>JSON</div>
                <button onClick={() => this.setState({ panel: 2 })} className={cx("btn btn-outline-primary", this.state.panel === 2 ? "active" : "")}>Import/Export</button><br />
            </div>

            <div className="add-dialog-content">
                {this.state.panel === 0 ? <h5>Load a set of mock devices</h5> : null}
                {this.state.panel === 1 ? <h5>{this.props.resx.FRM_LBL_EXIMPORT_LCL}</h5> : null}
                {this.state.panel === 2 ? <h5>{this.props.resx.FRM_LBL_EXIMPORT_JSON}</h5> : null}

                {/* Panel 0 */}
                {this.state.panel === 0 ? <div>
                    <div className="form-group">
                        {
                            this.state.local.map((item: Local.LocalStoragePayload, index) => {
                                return <div key={index} className="hub-device-item">
                                    <div className="hub-device-item-line">
                                        <div>
                                            <div>{item.name}</div>
                                            <div className="conn-string">{item.date}</div>
                                        </div>
                                        <div className="btn-bar">
                                            <button title={this.props.resx.DELETE} className="btn btn-success" onClick={() => this.loadState(index)}><span className="fa fa-check"></span></button>
                                            <button title={this.props.resx.DELETE} className="btn btn-danger" onClick={() => this.deleteState(index)}><span className="fa fa-trash-o"></span></button>
                                        </div>
                                    </div>
                                </div>
                            })
                        }
                    </div>
                </div>
                    : null}

                {/* Panel 1 */}
                {this.state.panel === 1 ? <div>
                    <div className="form-group">
                        <input className="form-control" name="saveName" onChange={this.handleChange} value={this.state.saveName} />
                    </div>
                    <button onClick={() => this.saveState()} title={this.props.resx.SAVE} className="btn btn-info">{this.props.resx.SAVE}</button>
                </div>
                    : null}

                {/* Panel 2 */}
                {this.state.panel === 2 ? <div>
                    <div className="form-group">
                        <textarea rows={24} className="form-control custom-textarea" name="exImport" onChange={this.handleChange} value={this.state.exImport}></textarea>
                    </div>
                    <div className="form-group">
                        <span>{this.props.resx.TEXT_CTRLC_EXPORT}</span>
                    </div>
                    <button className="btn btn-info" onClick={() => this.handleImport()}>{this.props.resx.IMPORT}</button>
                </div>
                    : null}

            </div>
            <div className="panel-dialog-close" onClick={this.close} title={this.props.resx.CANCEL}><span className="fa fa-times"></span></div>
        </div>
    }
}