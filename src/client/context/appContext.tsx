import * as React from 'react';
import axios from 'axios';
import { getEndpoint } from './globalContext';

export const AppContext = React.createContext({});

export class AppProvider extends React.PureComponent {

    constructor() {
        super(null);

        let ui = false;
        let snippets = null;

        axios.get(`${getEndpoint()}api/ui`)
            .then((response: any) => {
                ui = response.data;
                return axios.get(`${getEndpoint()}api/simulation/snippets`)
            })
            .then((response: any) => {
                snippets = response.data;
                return axios.get(`${getEndpoint()}api/simulation/colors`)
            })
            .then((response: any) => {
                this.setState({
                    ui,
                    snippets,
                    colors: response.data
                });
            })
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
        selectorExpand: false,
        snippets: {},
        colors: {},
        ui: { container: false },
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