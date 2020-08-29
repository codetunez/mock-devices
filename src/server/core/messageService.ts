import { Config, GLOBAL_CONTEXT } from '../config';
import { REPORTING_MODES } from '../config';

export class ServerSideMessageService {

    private eventMessage: Array<any> = [];
    private eventData = {};
    private eventControl = {};
    private eventState = {};
    private timers = {};
    private messageCount = 1;
    private controlCount = 1;

    end(type: string) {
        clearInterval(this.timers[type]);
    }

    endAll() {
        for (const timer in this.timers) {
            this.end(this.timers[timer]);
        }
    }

    clearState() {
        this.eventData = {};
        this.eventControl = {};
        this.eventState = {};
    }

    sendConsoleUpdate(message: string) {
        if (Config.CONSOLE_LOGGING) {
            if (message.length > 0 && message[0] != '[') { message = ` ${message}`; }
            const msg = `[${new Date().toISOString()}]${message}`;
            if (GLOBAL_CONTEXT.OPERATION_MODE === REPORTING_MODES.MIXED || GLOBAL_CONTEXT.OPERATION_MODE === REPORTING_MODES.SERVER) {
                console.log(msg);
                if (GLOBAL_CONTEXT.OPERATION_MODE === REPORTING_MODES.SERVER) { return; }
            }
            this.eventMessage.push(msg);
        }
    }

    sendAsLiveUpdate(group: string, payload: any) {
        if (Config.PROPERTY_LOGGING && Object.keys(payload).length > 0) {
            if (GLOBAL_CONTEXT.OPERATION_MODE === REPORTING_MODES.MIXED || GLOBAL_CONTEXT.OPERATION_MODE === REPORTING_MODES.SERVER) {
                console.log(`[${new Date().toISOString()}][LOG][PROPERTY REPORTING] ${JSON.stringify(payload)}`);
                if (GLOBAL_CONTEXT.OPERATION_MODE === REPORTING_MODES.SERVER) { return; }
            }
            const o = this.eventData[group];
            if (o == null) { this.eventData[group] = payload; }
            else { for (const key in payload) { this.eventData[group][key] = payload[key] } }
        }
    }

    sendAsControlPlane(payload: any) {
        if (Config.CONTROL_LOGGING) {
            if (GLOBAL_CONTEXT.OPERATION_MODE === REPORTING_MODES.MIXED || GLOBAL_CONTEXT.OPERATION_MODE === REPORTING_MODES.SERVER) {
                console.log(`[${new Date().toISOString()}][LOG][CONTROL PLANE REPORTING] ${JSON.stringify(payload)}`);
                if (GLOBAL_CONTEXT.OPERATION_MODE === REPORTING_MODES.SERVER) { return; }
            }
            for (const key in payload) { this.eventControl[key] = payload[key] }
        }
    }

    sendAsStateChange(payload: any) {
        if (Config.STATE_LOGGING) {
            if (GLOBAL_CONTEXT.OPERATION_MODE === REPORTING_MODES.MIXED || GLOBAL_CONTEXT.OPERATION_MODE === REPORTING_MODES.SERVER) {
                console.log(`[${new Date().toISOString()}][LOG][STATE CHANGE REPORTING] ${JSON.stringify(payload)}`);
                if (GLOBAL_CONTEXT.OPERATION_MODE === REPORTING_MODES.SERVER) { return; }
            }
            for (const key in payload) { this.eventState[key] = payload[key] }
        }
    }

    messageLoop = (res) => {
        this.timers['messageLoop'] = setInterval(() => {
            if (this.eventMessage.length > 0) {
                let msg = `id: ${this.messageCount}\n`
                for (const event of this.eventMessage) { msg = msg + `data: ${event}\n`; }
                res.write(msg + `\n`);
                this.eventMessage = [];
                this.messageCount++
            }
        }, 255)
    }

    controlLoop = (res) => {
        this.timers['controlLoop'] = setInterval(() => {
            if (Object.keys(this.eventControl).length > 0) {
                res.write(`id: ${this.controlCount}\ndata: ${JSON.stringify(this.eventControl)} \n\n`);
                this.controlCount++;
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

    stateLoop = (res) => {
        this.timers['stateLoop'] = setInterval(() => {
            if (Object.keys(this.eventState).length > 0) {
                res.write(`data: ${JSON.stringify(this.eventState)} \n\n`);
                this.eventState = {};
            }
        }, 2895)
    }
}