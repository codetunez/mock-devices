import { Config } from '../config';
import * as WebSocket from 'ws';
import { MessageService } from '../interfaces/messageService';

export class WebSocketMessageService implements MessageService {

    private propertyUpdatesWebSocket = null;
    private consoleUpdatesWebSocket = null;
    private propertyUpdatePayload = {};
    private showConsole: boolean;
    private showLiveUpdate: boolean;
    private timer: any = null;

    constructor(showConsole: boolean, showLiveUpdate: boolean) {
        this.propertyUpdatesWebSocket = new WebSocket.Server({ port: parseInt(Config.PROPERTY_WEBSOCKET_PORT) });
        this.consoleUpdatesWebSocket = new WebSocket.Server({ port: parseInt(Config.CONSOLE_WEBSOCKET_PORT) });
        this.liveUpdateTimer();
        this.showConsole = showConsole;
        this.showLiveUpdate = showLiveUpdate;       
    }

    end() {
        this.timer = null;
        this.propertyUpdatesWebSocket.close();
        this.consoleUpdatesWebSocket.close();
    }

    sendConsoleUpdate(message: string) {
        if (!this.showConsole) { return; }
        this.consoleUpdatesWebSocket.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ message: message }));
            }
        });
    }

    sendAsLiveUpdate(payload: any) {
        Object.assign(this.propertyUpdatePayload, payload);
    }

    liveUpdateTimer = () => {
        if (!this.showLiveUpdate) { return; }
        var that = this;
        this.timer = setInterval(() => {
            if (Object.keys(this.propertyUpdatePayload).length > 0) {
                this.propertyUpdatesWebSocket.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(that.propertyUpdatePayload));
                    }
                });
            }
        }, 750)
    }
}