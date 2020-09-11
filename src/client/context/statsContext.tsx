import * as React from 'react';
import { Endpoint } from './endpoint';

export const StatsContext = React.createContext({});

export class StatsProvider extends React.PureComponent {

    private eventSource = null;

    constructor() {
        super(null);
        this.init();
    }

    init = () => {
        setInterval(() => {
            if (!this.eventSource) {
                this.eventSource = new EventSource(`${Endpoint.getEndpoint()}api/events/stats`);
                this.eventSource.onmessage = ((e) => {
                    this.setStats(JSON.parse(e.data));
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

    setStats(data: any) {
        this.setState({ stats: data });
    }

    state: any = {
        stats: {},
        killConnection: this.killConnection
    }

    render() {
        return (
            <StatsContext.Provider value={this.state} >
                {this.props.children}
            </StatsContext.Provider >
        )
    }
}