import { Config } from '../config';
import { MessageService } from '../interfaces/messageService';

export class ServerSideMessageService implements MessageService {

    private eventMessage: Array<any> = [];
    private eventData = {};
    private eventControl = {};
    private timers = {};

    private messageIdCount = 1;

    end(type: string) {
        clearInterval(this.timers[type]);
    }

    endAll() {
        for (const timer in this.timers) {
            this.end(this.timers[timer]);
        }
    }

    sendConsoleUpdate(message: string) {
        if (Config.CONSOLE_LOGGING) {
            this.eventMessage.push(message);
        }
    }

    sendAsLiveUpdate(group: string, payload: any) {
        if (Config.PROPERTY_LOGGING && Object.keys(payload).length > 0) {
            const o = this.eventData[group];
            if (o == null) { this.eventData[group] = payload; }
            else { for (const key in payload) { this.eventData[group][key] = payload[key] } }
        }
    }

    sendAsControlPlane(payload: any) {
        if (Config.CONTROL_LOGGING) {
            for (const key in payload) { this.eventControl[key] = payload[key] }
        }
    }

    messageLoop = (res) => {
        this.timers['messageLoop'] = setInterval(() => {
            if (this.eventMessage.length > 0) {
                let msg = `id: ${this.messageIdCount}\n`
                for (const event of this.eventMessage) { msg = msg + `data: ${event}\n`; }
                res.write(msg + `\n`);
                this.eventMessage = [];
                this.messageIdCount++
            }
        }, 255)
    }

    controlLoop = (res) => {
        this.timers['controlLoop'] = setInterval(() => {
            if (Object.keys(this.eventControl).length > 0) {
                res.write(`data: ${JSON.stringify(this.eventControl)} \n\n`);
            }
        }, 995)
    }

    dataLoop = (res) => {
        this.timers['dataLoop'] = setInterval(() => {
            if (Object.keys(this.eventData).length > 0) {
                res.write(`data: ${JSON.stringify(this.eventData)} \n\n`);
                this.eventData = {};
            }
        }, 1525)
    }

}