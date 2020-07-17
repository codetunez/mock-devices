import * as React from 'react';
import axios from 'axios';

export const AppContext = React.createContext({});

export class AppProvider extends React.PureComponent {

    constructor() {
        super(null);

        let data = null;
        axios.get('/api/simulation/snippets')
            .then((response: any) => {
                data = response.data;
                return axios.get('/api/simulation/colors')
            })
            .then((response: any) => {
                this.setState({
                    snippets: data,
                    colors: response.data
                });
            })

        let eventSource = new EventSource('/api/events/control');
        eventSource.onmessage = ((e) => {
            this.setControlMessages(JSON.parse(e.data));
        });
    }

    setControlMessages(data: any) {
        this.setState({ ...this.state, control: data });
    }

    setExpand = (id: any) => {
        const newProp = this.state.property;
        newProp[id] = !newProp[id] ? true : !newProp[id]
        this.setState({ ...this.state, property: newProp });
    }

    setSelectorExpand = (flag: boolean) => {
        this.setState({ ...this.state, selectorExpand: flag });
    }

    state: any = {
        property: {},
        control: {},
        selectorExpand: false,
        snippets: {},
        colors: {},
        setExpand: this.setExpand,
        setSelectorExpand: this.setSelectorExpand
    }

    render() {
        return (
            <AppContext.Provider value={this.state} >
                {this.props.children}
            </AppContext.Provider >
        )
    }
}