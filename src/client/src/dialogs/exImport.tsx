var classNames = require("classnames");
import * as React from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import * as Local from '../localStorage';
import * as StateActions from "../store/actions/stateActions"

export class ExImport extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = this.initModel();
    }

    initModel(model?: any): any {
        let m: any = {};
        m.exImport = JSON.stringify(model ? model.state : this.props.state, null, 2);
        m.error = '';
        m.local = Local.GetSaveStates();
        m.saveName = '';
        return m;
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
        return <Tabs>
            <TabList>
                <Tab><strong>Load from Local Storage</strong></Tab>                
                <Tab><strong>{this.props.resx.TEXT_TAB_JSON}</strong></Tab>
            </TabList>
            <TabPanel>
                <h4>{this.props.resx.FRM_LBL_EXIMPORT_LCL}</h4>
                <div className="input-group">
                    <input className="form-control" name="saveName" onChange={this.handleChange} value={this.state.saveName} />
                    <span className="input-group-btn">
                        <button onClick={() => this.saveState()} title={this.props.resx.SAVE} className={classNames("btn ", "btn-primary")}>
                            <span className="fa fa-floppy-o"></span>
                        </button>
                    </span>
                </div>
                <div className="panel-dialog-eximport-local">
                    <h5>{this.props.resx.FRM_LBL_EXIMPORT_LCL_LOAD}</h5>
                    {
                        this.state.local.map((item: Local.LocalStoragePayload, index) => {
                            return <div key={index} className="hub-device-item">
                                <div className="hub-device-item-line">
                                    <div className="line-item-link" onClick={() => this.loadState(index)}>
                                        <div>{item.name}</div>
                                        <div>{item.date}</div>
                                    </div>
                                    <div className="btn-bar">
                                        <button title={this.props.resx.DELETE} className="btn btn-danger" onClick={() => this.deleteState(index)}>
                                            <span className="fa fa-trash-o"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        })
                    }
                </div>
            </TabPanel>
            <TabPanel>
                <h4>{this.props.resx.FRM_LBL_EXIMPORT_JSON}</h4>
                <div className="form-group">
                    <textarea className="form-control nowrap-textarea" name="exImport" onChange={this.handleChange} value={this.state.exImport}></textarea>
                </div>
                <span>{this.props.resx.TEXT_CTRLC_EXPORT}</span>
                <div className="form-group pull-right">
                    <button className="btn btn-outline-primary" onClick={() => this.handleImport()}>{this.props.resx.IMPORT}</button>
                </div>
            </TabPanel>
        </Tabs>
    }
}