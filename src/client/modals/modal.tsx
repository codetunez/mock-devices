
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export class Modal extends React.Component<any, any> {
    render() {
        return ReactDOM.createPortal(
            this.props.children,
            document.querySelector("#modal-root")
        );
    }
}
