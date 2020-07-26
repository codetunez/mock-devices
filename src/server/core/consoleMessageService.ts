import { Config } from '../config';
import * as WebSocket from 'ws';
import { MessageService } from '../interfaces/messageService';

export class ConsoleMessageService implements MessageService {

    end() { }

    sendConsoleUpdate(message: string) {
        if (Config.CONSOLE_LOGGING) { console.log(message); }
    }

    sendAsLiveUpdate(payload: any) {
        if (Config.PROPERTY_LOGGING) {
            console.log(JSON.stringify(payload));
        }
    }

    sendAsControlPlane(payload: any) {
        if (Config.CONTROL_LOGGING) {
            console.log('CONTROL PLANE >>>>>> ' + JSON.stringify(payload));
        }
    }
}