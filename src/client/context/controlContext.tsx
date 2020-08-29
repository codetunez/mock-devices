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
        setInterval(() => {
            if (!this.eventSource) {
                this.eventSource = new EventSource(`${Endpoint.getEndpoint()}api/events/control`);
                this.eventSource.onmessage = ((e) => {
                    this.setControlMessages(JSON.parse(e.data));
                });
            }
        }, 250);
    }

    killConnection = () => {
        if (this.eventSource != null) {
            this.eventSource.close()
            this.eventSource = null;
        }
    }

    setControlMessages(data: any) {
        this.setState({ control: data });
    }

    state: any = {
        control: {},
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