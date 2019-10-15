import { Config } from '../config';
import * as WebSocket from 'ws';

export class LiveUpdatesService {

    private propertyUpdatesWebSocket = null;
    private consoleUpdatesWebSocket = null;

    private propertyUpdatePayload = {};

    constructor() {
        var that = this;
        
        this.propertyUpdatesWebSocket = new WebSocket.Server({ port: parseInt(Config.PROPERTY_WEBSOCKET_PORT) });
        this.consoleUpdatesWebSocket = new WebSocket.Server({ port: parseInt(Config.CONSOLE_WEBSOCKET_PORT) });

        setInterval(() => {
            if (Object.keys(this.propertyUpdatePayload).length > 0) {
                this.propertyUpdatesWebSocket.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(that.propertyUpdatePayload));
                    }
                });
            }
        }, 750)
    }

    killSockets() {
        this.propertyUpdatesWebSocket.close();
        this.consoleUpdatesWebSocket.close();
    }

    sendAsLiveUpdate(payload: any) {
        Object.assign(this.propertyUpdatePayload, payload);
    }

    sendConsoleUpdate(message: string) {
        if (Config.CONSOLE_LOGGING) { console.log(message); }
        var that = this;
        this.consoleUpdatesWebSocket.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ message: message }));
            }
        });
    }
}