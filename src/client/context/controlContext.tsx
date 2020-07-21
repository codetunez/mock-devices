import * as React from 'react';

export const ControlContext = React.createContext({});

export class ControlProvider extends React.PureComponent {

    constructor() {
        super(null);

        let eventSource = new EventSource('/api/events/control');
        eventSource.onmessage = ((e) => {
            this.setControlMessages(JSON.parse(e.data));
        });
    }

    setControlMessages(data: any) {
        this.setState({ ...this.state, control: data });
    }

    state: any = {
        control: {},
    }

    render() {
        return (
            <ControlContext.Provider value={this.state} >
                {this.props.children}
            </ControlContext.Provider >
        )
    }
}