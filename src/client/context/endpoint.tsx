import * as React from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const VARS = {
    sessionId: '',
}

export class Endpoint {

    static setSession(id) {
        VARS.sessionId = id;
    }

    static getEndpoint() {
        //REFACTOR: The safest way to re-init all URLs is to reload the UX with the new Endpoint
        //          defined. For the reload to come back to the same UX, we store temporarily the 
        //          session its needs to come back to. This is a high risk approach and only works
        //          because the expectation is not many UXs will launch at the same time.
        if (localStorage.getItem('lastSession')) {
            VARS.sessionId = localStorage.getItem('lastSession');
            localStorage.removeItem('lastSession');
        }
        return localStorage.getItem(`engEndpoint-${VARS.sessionId}`) || '/';
    }

    static setEndpoint = ({ serverEndpoint, serverMode }) => {
        serverEndpoint = serverEndpoint += serverEndpoint.slice(-1) === '/' ? '' : '/'
        const mode = !serverMode || serverMode && serverMode === '' ? 'ux' : serverMode;
        axios.post(`${Endpoint.getEndpoint()}api/setmode/${mode}`, { serverEndpoint, serverMode: mode })
            .then((response: any) => {
                localStorage.setItem('lastSession', VARS.sessionId)
                localStorage.setItem(`engEndpoint-${VARS.sessionId}`, serverEndpoint);
                window.location.reload();
            })
    }

    static resetEndpoint() {
        localStorage.setItem('lastSession', VARS.sessionId)
        localStorage.setItem(`engEndpoint-${VARS.sessionId}`, '/');
        window.location.reload();
    }

}