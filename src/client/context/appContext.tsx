import * as React from 'react';
import axios from 'axios';

export const AppContext = React.createContext({});

export class AppProvider extends React.PureComponent {

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