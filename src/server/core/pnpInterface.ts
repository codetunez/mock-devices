import { BaseInterface, Telemetry, Property, Command } from 'azure-iot-digitaltwins-device'

export class PnpInterface extends BaseInterface {

    private _name: string;
    private _urn: string;

    constructor(name: string, urn: string, propertyCallback: any, commandCallback: any) {
        super(name, urn, propertyCallback, commandCallback);
        this._name = name;
        this._urn = urn;
    }

    add(name: string, type: 'telemetry' | 'property' | 'command', writeable?: boolean) {
        switch (type) {
            case 'telemetry':
                this[name] = new Telemetry();
                break;
            case 'property':
                if (this[name] && this[name].writable) { return; }
                this[name] = writeable ? new Property(true) : new Property();
                break;
            case 'command':
                this[name] = new Command();
                break;
        }
    }

    getName() {
        return this._name;
    }

    getUrn() {
        return this._urn;
    }

}