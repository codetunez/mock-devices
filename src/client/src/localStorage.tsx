const keyName = "MOCK.DEVICES.LOCAL.STATES";

export interface LocalStoragePayload {
    date: string;
    name: string;
    payload: any;
}

export function GetSaveStates(): Array<LocalStoragePayload> {
    let p = localStorage.getItem(keyName);    
    return JSON.parse(p || '[]');
}

export function SaveState(payload: LocalStoragePayload) {
    let s: Array<LocalStoragePayload> = GetSaveStates();
    s.push(payload);
    localStorage.setItem(keyName, JSON.stringify(s));
}

export function GetSaveState(index: number): any {
    let s: Array<LocalStoragePayload> = GetSaveStates();    
    return s[index].payload;
}

export function DeleteState(index: number) {
    let s: Array<LocalStoragePayload> = GetSaveStates();
    s.splice(index, 1);    
    localStorage.setItem(keyName, JSON.stringify(s));
}
