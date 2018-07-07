import * as React from "react";

export interface NameValuePair {
    _id: string;
    name: string;
    value: string;
}

export class Combo extends React.Component<any, any> {
    render() {
        let s: any = this.props.style && this.props.style === "small" ? "custom-select sm" : "custom-select";
        return <select className={s} name={this.props.name} onChange={this.props.onChange} value={this.props.value}>
            {this.props.showSelect === false ? null : <option key={0} value="">--Select</option>}
            {this.props.collection.map(function (item: NameValuePair, index: number) {
                return <option key={index + 1} value={!item.value ? item._id : item.value}>{item.name}</option>
            })}
        </select>
    }
}

export class RadioCollection extends React.Component<any, any> {
    constructor(props: any) {
        super(props)

        this.state = {
            collection: this.props.collection,
            value: this.props.value
        }
    }

    componentWillReceiveProps(nextProps: any) {
        let s: any = this.state;
        s.value = nextProps.value;
        this.setState(s);
    }

    changed = (val: string, e: any) => {
        let s: any = this.state;
        s.value = val;
        this.setState(s, (() => {
            this.props.onChange(s.value);
        }));
    }

    render() {
        return <div style={{ display: "flex", alignItems: "center" }}>
            {this.state.collection.map((item, index) => {
                return <div className="form-check" key={index}>
                    <label className="form-check-label">
                        <input type="radio" className="form-check-input" onChange={this.changed.bind(this, item.value)} checked={item.value === this.state.value} />{item.label}
                    </label>
                </div>
            })}
        </div>
    }
}


export class RadioBoolean extends React.Component<any, any> {

    constructor(props: any) {
        super(props)

        this.state = {
            value: (this.props.value === true || this.props.value === "true" ? true : false)
        }
    }

    componentWillReceiveProps(nextProps: any) {
        let s: any = this.state;
        s.value = (nextProps.value === true || nextProps.value === "true" ? true : false)
        this.setState(s);
    }

    // not a great implementation but does create the properties for synthetic event
    changed = (val: boolean, e: any) => {
        let s: any = this.state;
        s.value = val;
        this.setState(s, (() => {
            this.props.onChange({
                target: {
                    name: this.props.name,
                    value: s.value
                }
            });
        }));
    }

    render() {
        return <div style={{ display: "flex", alignItems: "center" }}>
            <div className="form-check">
                <label className="form-check-label">
                    <input type="radio" className="form-check-input" onChange={this.changed.bind(this, true)} checked={this.state.value} />Yes
                </label>
            </div>
            <div className="form-check">
                <label className="form-check-label">
                    <input type="radio" className="form-check-input" onChange={this.changed.bind(this, false)} checked={!this.state.value} />No
                </label>
            </div>
        </div>
    }
}
