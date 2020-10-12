var classNames = require('classnames');
const cx = classNames.bind(require('./help.scss'));
const cxM = classNames.bind(require('./modal.scss'));

import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { Endpoint } from '../context/endpoint';

export const Help: React.FunctionComponent<any> = ({ handler }) => {

    const [text, setText] = React.useState('');

    React.useEffect(() => {
        axios.get(`${Endpoint.getEndpoint()}api/help`)
            .then((response: any) => {
                setText(response.data);
            })
    }, []);

    return <div className='help'>
        <div className='help-close' onClick={() => handler(false)}><i className='fas fa-times'></i></div>
        <div className='help-content'>
            <ReactMarkdown source={text} />
        </div>
    </div >
}