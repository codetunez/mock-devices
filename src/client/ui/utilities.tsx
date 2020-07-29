export function decodeModuleKey(key: string): any {
    const r = new RegExp(`\<(.*)\>(.*)?`)
    if (key === undefined || key === null) { return null; }
    const m = key.match(r);
    if (!m || m.length != 3) { return null; }
    return { deviceId: m[1], moduleId: m[2] };
}

export const controlEvents = {
    ON: 'ON',
    OFF: 'OFF',
    INIT: 'INIT',
    SUCCESS: 'SUCCESS',
    CONNECTED: 'CONNECTED',
    TRYING: 'TRYING',
    ERROR: 'ERROR',
    DELAY: 'DELAY'
}