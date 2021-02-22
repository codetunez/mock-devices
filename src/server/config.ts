export enum REPORTING_MODES {
    UX = "UX",
    SERVER = "SERVER",
    MIXED = "MIXED"
}

export const GLOBAL_CONTEXT = {
    OPERATION_MODE: REPORTING_MODES.UX,
    LATEST_VERSION: false,
    IOTEDGE_WORKLOADURI: process.env.IOTEDGE_WORKLOADURI,
    IOTEDGE_DEVICEID: process.env.IOTEDGE_DEVICEID,
    IOTEDGE_MODULEID: process.env.IOTEDGE_MODULEID,
    IOTEDGE_MODULEGENERATIONID: process.env.IOTEDGE_MODULEGENERATIONID,
    IOTEDGE_IOTHUBHOSTNAME: process.env.IOTEDGE_IOTHUBHOSTNAME,
    IOTEDGE_AUTHSCHEME: process.env.IOTEDGE_AUTHSCHEME
};

export class Config {
    // app settings
    public static APP_PORT: string = '9000';
    public static APP_HEIGHT: number = 767;
    public static APP_WIDTH: number = 1023;
    public static MAX_NUM_DEVICES: number = 1500;

    // reporting settings
    public static CONSOLE_LOGGING: boolean = true;
    public static CONTROL_LOGGING: boolean = true;
    public static PROPERTY_LOGGING: boolean = false;
    public static STATE_LOGGING: boolean = true;
    public static STATS_LOGGING: boolean = true;

    // dev settings
    public static NODE_MODE: boolean = true;
    public static WEBAPI_LOGGING: boolean = false;
    public static DEV_TOOLS: boolean = false;

    // cache settings
    public static CACHE_CENTRAL_TEMPLATES: boolean = false;
}
