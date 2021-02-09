export interface PlugIn {
    usage: string;
    initialize: Function;
    reset: Function;
    configureDevice: Function;
    postConnect: Function;
    stopDevice: Function;
    propertyResponse: Function;
    commandResponse: Function;
    desiredResponse: Function;
}