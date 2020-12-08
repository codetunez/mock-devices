import * as React from 'react';
import axios from 'axios';
import { Endpoint } from './endpoint';

export const AppContext = React.createContext({});

export class AppProvider extends React.PureComponent {

    private dirty: string = '';

    setExpand = (id: any) => {
        const newProp = this.state.property;
        newProp[id] = !newProp[id] ? true : !newProp[id]
        this.setState({ ...this.state, property: newProp });
    }

    setSelectorExpand = (flag: boolean) => {
        this.setState({ ...this.state, selectorExpand: flag });
    }

    setDirty = (id: string) => {
        if (this.dirty !== id) {
            this.dirty = id;
            localStorage.setItem('dirty', this.dirty);
        }
    }

    getDirty = () => {
        return localStorage.getItem('dirty');
    }

    clearDirty = () => {
        this.dirty = '';
        localStorage.setItem('dirty', this.dirty);
    }

    state: any = {
        property: {},
        dirtyProperty: '',
        selectorExpand: true,
        setExpand: this.setExpand,
        setSelectorExpand: this.setSelectorExpand,
        setDirty: this.setDirty,
        getDirty: this.getDirty,
        clearDirty: this.clearDirty
    }

    render() {
        return (
            <AppContext.Provider value={this.state} >
                {this.props.children}
            </AppContext.Provider >
        )
    }
}