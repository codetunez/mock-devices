import * as React from 'react';
import * as JS from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

export const Combo: React.FunctionComponent<any> = ({ name, value, items, cls, onChange }) => {
    return <select className={'custom-select ' + cls} name={name} onChange={onChange} value={value}>
        {items.map(function (item: any, index: number) {
            return <option key={index + 1} value={item.value}>{item.name}</option>
        })}
    </select>
}

export const Json: React.FunctionComponent<any> = ({ json, cb }) => {

    let editor = null;
    const [payload, setPayload] = React.useState(json || {})

    const callback = () => {
        cb(this.editor.get());
    }

    const options = {
        mode: 'code',
        mainMenuBar: false,
        navigationBar: false,
        statusBar: false,
        onChange: callback
    }

    React.useEffect(() => {
        const container = document.getElementById("jsoneditor")
        this.editor = new JS(container, options)
        this.editor.set(payload)
    }, [])

    React.useEffect(() => {
        this.editor.set(json || {})
    }, [json])

    return <div id="jsoneditor" style={{ height: "100%" }}></div>
}