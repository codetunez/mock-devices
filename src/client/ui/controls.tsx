import * as React from 'react';

export const Combo: React.FunctionComponent<any> = ({ name, value, items, cls, onChange }) => {
    return <select className={'custom-select ' + cls} name={name} onChange={onChange} value={value}>
        {items.map(function (item: any, index: number) {
            return <option key={index + 1} value={item.value}>{item.name}</option>
        })}
    </select>
}