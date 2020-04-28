var classNames = require('classnames');
const cx = classNames.bind(require('./deviceToolbar.scss'));

import axios from 'axios';
import * as React from 'react';
import { Combo } from '../ui/controls';
import { DeviceContext } from '../context/deviceContext';
import { Toggle, ReactToggleThemeProvider } from 'react-toggle-component';
import { toggleStyles } from '../ui/codeStyles';

export const DeviceToolbar: React.FunctionComponent<any> = ({ devices, index, handler }) => {
    const deviceContext: any = React.useContext(DeviceContext);
    const [order, setOrder] = React.useState(index + 1);
    const [toggle, setToggle] = React.useState(false);

    const deviceIndexes = () => {
        const items = [];
        for (let i = 0; i < devices.length; i++) {
            items.push({ name: i + 1, value: i + 1 })
        }
        return items
    }

    React.useEffect(() => {
        setOrder(index + 1);
    }, [index])

    const updateField = e => {
        const value = e.target.value;
        axios.post('/api/state/reorder', { devices: devices, current: order - 1, next: parseInt(e.target.value) - 1 })
            .then((res) => {
                deviceContext.setDevices(res.data);
                setOrder(value); // dangerous if BE doesn't succeeed
            })
    }

    const updateToggle = e => {
        setToggle(e.target.checked);
        handler(e.target.checked);
    }

    return <div className='device-toolbar-container'>
        <div className='order'>
            <div>Position</div>
            <div><Combo items={deviceIndexes()} cls='custom-textarea-sm' name='order' onChange={updateField} value={order} /></div>
        </div>
        <div className='selector-toggle'>
            <label>Keep cards expanded </label> <ReactToggleThemeProvider theme={toggleStyles}><Toggle name='exp' controlled={true} checked={toggle} onToggle={updateToggle} /></ReactToggleThemeProvider>
        </div>
    </div >
}