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

export function getRandomNumberBetweenRange(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}