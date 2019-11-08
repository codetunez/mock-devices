import { Config } from '../config';
import * as WebSocket from 'ws';
import { MessageService } from '../interfaces/messageService';

export class ConsoleMessageService implements MessageService {

    private propertyUpdatePayload = {};
    private showConsole: boolean;
    private showLiveUpdate: boolean;
    private timer: any = null;

    constructor(showConsole: boolean, showLiveUpdate: boolean) {
        this.liveUpdateTimer();
        this.showConsole = showConsole;
        this.showLiveUpdate = showLiveUpdate;
    }

    end() {
        this.timer = null;
    }

    sendConsoleUpdate(message: string) {
        if (this.showConsole) { console.log(message); }
    }

    sendAsLiveUpdate(payload: any) {
        Object.assign(this.propertyUpdatePayload, payload);
    }

    liveUpdateTimer = () => {
        if (this.showLiveUpdate) {
            this.timer = setInterval(() => {
                console.log(JSON.stringify(this.propertyUpdatePayload));
            }, 750)
        }
    }
}