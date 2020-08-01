import * as rw from 'random-words';
import * as randomLocation from 'random-location';

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
        return (value.toString().toLowerCase() === "true");
    } else if (asString === true) {
        return value.toString();
    } else {
        let res = parseFloat(value);
        if (!isNumeric(res)) {
            res = value.toString();
        }
        return res;
    }
}

export function getRandomNumberBetweenRange(min: number, max: number, floor: boolean) {
    const val = (Math.random() * (max - min)) + min;
    return floor ? Math.floor(val) : val;
}

export function getRandomValue(schema: string, min?: number, max?: number) {
    if (schema === 'double') { return getRandomNumberBetweenRange(min, max, false); }
    if (schema === 'float') { return getRandomNumberBetweenRange(min, max, false); }
    if (schema === 'integer') { return getRandomNumberBetweenRange(min, max, true); }
    if (schema === 'long') { return getRandomNumberBetweenRange(min, max, true); }
    if (schema === 'boolean') { return Math.random() >= 0.5; }
    if (schema === 'string') { return rw(); }
    const dt = new Date();
    if (schema === 'dateTime') { return dt.toISOString(); }
    if (schema === 'date') { return dt.toISOString().substr(0, 10); }
    if (schema === 'time') { return dt.toISOString().substr(11, 8); }
    if (schema === 'duration') { return dt.toISOString().substr(11, 8); }
}

export function getRandomMap() {
    return {}
}

export function getRandomVector(min: number, max: number) {
    return {
        "x": getRandomNumberBetweenRange(min, max, true),
        "y": getRandomNumberBetweenRange(min, max, true),
        "z": getRandomNumberBetweenRange(min, max, true)
    }
}

export function getRandomGeo(lat?: number, long?: number, alt?: number, radius?: number) {
    const randomPoint = randomLocation.randomCirclePoint({
        latitude: lat || 51.508009,
        longitude: long || -0.128114
    }, radius || 25000)
    return {
        "lat": randomPoint.latitude,
        "lon": randomPoint.longitude,
        "alt": alt || 100
    }
}

export function decodeModuleKey(key: string): any {
    const r = new RegExp(`\<(.*)\>(.*)?`)
    const m = key.match(r);
    if (!m && m.length != 3) { return key; }
    return { deviceId: m[1], moduleId: m[2] };
}

export function getModuleKey(deviceId: string, moduleId: string) {
    return `<${deviceId}>${moduleId}`;
}