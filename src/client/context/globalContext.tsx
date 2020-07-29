import * as React from 'react';
import axios from 'axios';

export function getEndpoint() {
    return localStorage.getItem('engEndpoint') || '/';
}

export function setEndpoint(endpoint) {
    localStorage.setItem('engEndpoint', endpoint);
    return endpoint;
}

export const GlobalContext = React.createContext({});

export class GlobalProvider extends React.PureComponent {

    constructor() {
        super(null);
    }

    resetEndpoint() {
        setEndpoint('/');
        window.location.reload();
    }

    setEndpoint = ({ serverEndpoint, serverMode }) => {
        serverEndpoint = serverEndpoint += serverEndpoint.slice(-1) === '/' ? '' : '/'
        const mode = !serverMode || serverMode && serverMode === '' ? 'ux' : serverMode;
        axios.post(`${getEndpoint()}api/setmode/${mode}`, null)
            .then((response: any) => {
                setEndpoint(serverEndpoint);
                window.location.reload();
            })
    }

    state: any = {
        setEndpoint: this.setEndpoint,
        resetEndpoint: this.resetEndpoint,
    }

    render() {
        return (
            <GlobalContext.Provider value={this.state}>
                {this.props.children}
            </GlobalContext.Provider>
        )
    }
}