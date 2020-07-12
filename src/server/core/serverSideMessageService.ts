import { Config } from '../config';
import { MessageService } from '../interfaces/messageService';

export class ServerSideMessageService implements MessageService {

    private eventMessage: Array<any> = [];
    private eventData = {};
    private eventControl = {};
    private timers = {};
    private compose: boolean = false;

    constructor() {
    }

    end(type: string) {
        this.timers[type] = null;
    }

    endAll() {
        for (const timer in this.timers) {
            this.timers[timer] = null;
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
        if (Config.CONSOLE_LOGGING) {
            for (const key in payload) { this.eventControl[key] = payload[key] }
        }
    }

    messageLoop = (res) => {
        if (this.timers['messageLoop'] != null) { return; }
        this.timers['messageLoop'] = setInterval(() => {
            if (this.eventMessage.length > 0) {
                res.write(`data: ${JSON.stringify(this.eventMessage)}\n\n`);
                this.eventMessage = [];
            }
        }, 250)
    }

    controlLoop = (res) => {
        if (this.timers['controlLoop'] != null) { return; }
        this.timers['controlLoop'] = setInterval(() => {
            if (Object.keys(this.eventControl).length > 0) {
                res.write(`data: ${JSON.stringify(this.eventControl)}\n\n`);
                this.eventControl = {};
            }
        }, 457)
    }

    dataLoop = (res) => {
        if (this.timers['dataLoop'] != null) { return; }
        this.timers['dataLoop'] = setInterval(() => {
            if (Object.keys(this.eventData).length > 0) {
                res.write(`data: ${JSON.stringify(this.eventData)}\n\n`);
                this.eventData = {};
            }
        }, 823)
    }

}