export interface DeviceType {
    mock: boolean;
    direction: 'd2c' | 'c2d';
}

export interface RunLoop {
    include: boolean;
    unit: 'secs' | 'mins';
    value: number;
}

export interface MockSensor {
    _id: string;
    _hasState: boolean;
    _type: 'fan' | 'hotplate' | 'battery' | 'random' | 'function';
    _value: number;
    init: number;
    running?: number;
    variance?: number;
    timeToRunning?: number;
    function?: string;
}

export interface Property {
    _id: string;
    _type: "property";
    name: string;
    interface: string;
    string: boolean;
    value: any;
    sdk: string;
    type: DeviceType;
    version: number;
    propertyObject: PropertyObjectDefault | PropertyObjectTemplated;
    runloop?: RunLoop;
    mock?: MockSensor;
    enabled: boolean;
    color?: string;
}

export interface Method {
    _id: string;
    _type: "method";
    enabled?:boolean;
    name: string;
    interface?: string;
    status: 200 | 404 | 500;
    receivedParams: string;
    asProperty: boolean;
    payload: any;
    color?: string;
}

export interface PropertyObjectDefault {
    type: "default";
}

export interface PropertyObjectTemplated {
    type: "templated"
    template: any;
}

export class Device {
    public _id: string;
    public configuration: DeviceConfiguration;
    public comms: Array<any>;
    public running: boolean;

    constructor() {
        this.comms = new Array<any>();
        this.configuration = new DeviceConfiguration();
    }
}

export class DeviceConfiguration {
    public _kind: 'dps' | 'hub' | 'template';
    public deviceId?: string;
    public mockDeviceName?: string;
    public mockDeviceCloneId?: string;
    public mockDeviceState?: any;
    public connectionString?: string;
    public hubConnectionString?: string;
    public scopeId?: string;
    public dpsPayload?: any;
    public sasKey?: string;
    public capabilityModel?: any;
    public isMasterKey?: boolean;
}