import * as React from 'react';
import axios from 'axios';

export const AppContext = React.createContext({});

export class AppProvider extends React.PureComponent {

    setExpand = (id: any) => {
        const o = this.state.property;
        o[id] = !o[id] ? true : !o[id]
        this.setState(o);
    }

    state: any = {
        property: {},
        setExpand: this.setExpand,
    }

    render() {
        return (
            <AppContext.Provider value={this.state} >
                {this.props.children}
            </AppContext.Provider >
        )
    }
}