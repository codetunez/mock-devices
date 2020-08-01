import * as React from 'react';
import { Endpoint } from './endpoint';

export const ControlContext = React.createContext({});

export class ControlProvider extends React.PureComponent {

    private eventSource = null;

    constructor() {
        super(null);
        this.init();
    }

    init = () => {
        this.eventSource = new EventSource(`${Endpoint.getEndpoint()}api/events/control`);
        this.eventSource.onmessage = ((e) => {
            this.setControlMessages(JSON.parse(e.data));
        });
    }

    killConnection = () => {
        this.eventSource.close()
        this.eventSource = null;
    }

    setControlMessages(data: any) {
        this.setState({ ...this.state, control: data });
    }

    state: any = {
        control: {},
        init: this.init,
        killConnection: this.killConnection
    }

    render() {
        return (
            <ControlContext.Provider value={this.state} >
                {this.props.children}
            </ControlContext.Provider >
        )
    }
}