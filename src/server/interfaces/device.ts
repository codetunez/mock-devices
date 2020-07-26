export interface DeviceType {
    mock: boolean;
    direction: 'd2c' | 'c2d';
}

export interface RunLoop {
    include: boolean;
    unit: 'secs' | 'mins';
    value: number;
}

export interface PnpInterface {
    name: string;
    urn: string;
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
    interface: PnpInterface;
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
    asProperty?: boolean;
    asPropertyId?: string;
    asPropertyConvention?: boolean;
    asPropertyVersion?: boolean;
    asPropertyVersionPayload?: any;
}

export interface Method {
    _id: string;
    _type: "method";
    execution: "direct" | "cloud";
    enabled?: boolean;
    name: string;
    interface: PnpInterface;
    status: 200 | 404 | 500;
    receivedParams: string;
    asProperty: boolean;
    payload: any;
    color?: string;
    asPropertyId?: string;
}

export interface PropertyObjectDefault {
    type: "default";
}

export interface PropertyObjectTemplated {
    type: "templated"
    template: any;
}

export interface Plan {
    loop: boolean,
    startup: Array<any>,
    timeline: Array<any>,
    random: Array<any>,
    receive: Array<any>
}

export class Device {
    public _id: string;
    public configuration: DeviceConfiguration;
    public comms: Array<any>;
    public plan: Plan;

    constructor() {
        this.comms = new Array<any>();
        this.configuration = new DeviceConfiguration();
    }
}

export class DeviceConfiguration {
    public _kind: 'dps' | 'hub' | 'template' | 'edge' | 'module';
    public _deviceList?: [];
    public deviceId?: string;
    public devices?: [];
    public mockDeviceName?: string;
    public mockDeviceCount?: number;
    public mockDeviceCountMax?: number;
    public mockDeviceCloneId?: string;
    public connectionString?: string;
    public scopeId?: string;
    public dpsPayload?: any;
    public sasKey?: string;
    public isMasterKey?: boolean;
    public capabilityModel?: string;
    public capabilityUrn?: string;
    public machineState?: string;
    public machineStateClipboard?: string;
    public pnpSdk?: boolean;
    public planMode?: boolean;
    public modules?: Array<string> = [];
}