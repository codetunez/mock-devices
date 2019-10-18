import * as rw from 'random-words';

export function getDeviceId(connString: string) {
    var arr = /DeviceId=(.*);/g.exec(connString);
    if (arr && arr.length > 0) {
        return arr[1];
    }
    return null;
}

export function getHostName(connString: string) {
    var arr = /HostName=(.*);/g.exec(connString);
    if (arr && arr.length > 0) {
        return arr[1];
    }
    return null;
}

// this test for a particular state. not for general use
export function isEmptyOrUndefined(obj: any) {
    return !(obj && Object.keys(obj).length > 0 && obj.constructor === Object);
}

export function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// create a string or non string value for a object property value
export function formatValue(asString: boolean, value: any) {
    if (asString === false && (value.toString().toLowerCase() === "true" || value.toString().toLowerCase() === "false")) {
        return (value.toLowerCase() === "true");
    } else if (asString === true) {
        return value.toString();
    } else {
        let res = parseInt(value);
        if (!isNumeric(res)) {
            res = value.toString();
        }
        return res;
    }
}

export function getRandomNumberBetweenRange(min: number, max: number, floor: boolean) {
    const val = (Math.random() * (max - min)) + min;
    return !floor ? Math.floor(val) : val;
}

export function getRandomValue(schema: string, min?: number, max?: number) {
    if (schema === 'double') { return getRandomNumberBetweenRange(min, max, true); }
    if (schema === 'float') { return getRandomNumberBetweenRange(min, max, true); }
    if (schema === 'integer') { return getRandomNumberBetweenRange(min, max, false); }
    if (schema === 'long') { return getRandomNumberBetweenRange(min, max, false); }
    if (schema === 'boolean') { return Math.random() >= 0.5; }
    if (schema === 'string') { return rw(); }
    const dt = new Date();
    if (schema === 'dateTime') { return dt.toISOString(); }
    if (schema === 'date') { return dt.toISOString().substr(0, 10); }
    if (schema === 'time') { return dt.toISOString().substr(11, 8); }
}