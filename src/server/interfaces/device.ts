export interface Component {
    enabled: boolean;
    name: string;
}

export interface DeviceType {
    mock: boolean;
    direction: 'd2c' | 'c2d';
}

export interface RunLoop {
    _ms: number;
    include: boolean;
    unit: 'secs' | 'mins';
    value: number;
    valueMax: number;
    onStartUp?: boolean;
    override?: boolean
}

export interface MockSensor {
    _id: string;
    _hasState: boolean;
    _type: 'fan' | 'hotplate' | 'battery' | 'random' | 'function' | 'inc' | 'dec';
    _value: number;
    init: number;
    running?: number;
    variance?: number;
    timeToRunning?: number;
    function?: string;
    reset?: number;
}

export interface Property {
    _id: string;
    _type: "property";
    _matchedId?: string;
    name: string;
    enabled: boolean;
    component: Component;
    string: boolean;
    value: any;
    sdk: string;
    type: DeviceType;
    version: number;
    propertyObject: PropertyObjectDefault | PropertyObjectTemplated;
    runloop?: RunLoop;
    mock?: MockSensor;
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
    name: string;
    enabled?: boolean;
    component: Component;
    status: string;
    receivedParams: string;
    payload: any;
    color?: string;
    asProperty?: boolean;
    asPropertyId?: string;
    asPropertyConvention?: boolean;
    asPropertyVersion?: boolean;
    asPropertyVersionPayload?: any;
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
    public plugin: string;

    constructor() {
        this.comms = new Array<any>();
        this.configuration = new DeviceConfiguration();
    }
}

export class DeviceConfiguration {
    public _kind: 'dps' | 'hub' | 'template' | 'edge' | 'module' | 'moduleHosted' | 'leafDevice';
    public _deviceList?: [];
    public _plugIns?: [];
    public _modules?: [];
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
    public capabilityModel?: any;
    public capabilityUrn?: string;
    public machineState?: string;
    public machineStateClipboard?: string;
    public planMode?: boolean;
    public modules?: Array<string> = [];
    public modulesDocker?: any;
    public leafDevices?: Array<string> = [];
    public centralAdded?: boolean;
    public plugIn?: string;
    public geo?: number;
    public gatewayId?: string;
    public gatewayDeviceId?: string;
    public gatewayScopeId?: string;
    public gatewaySasKey?: string;
}