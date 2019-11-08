import * as uuidV4 from 'uuid/v4';
import simulation from '../api/simulation';

export class SimulationStore {

    static simulation = {
        "ranges": {
            "AUTO_INTEGER": { min: 1, max: 5000 },
            "AUTO_DOUBLE": { min: 1, max: 5000 },
            "AUTO_LONG": { min: 1, max: 5000 },
            "AUTO_FLOAT": { min: 1, max: 5000 },
            "AUTO_VECTOR": { min: 1, max: 500 }
        },
        "runloop": {
            "secs": { min: 20, max: 90 },
            "mins": { min: 2, max: 10 }
        },
        "geo": {
            "latitude": 51.508009,
            "longitude": -0.128114,
            "altitude": 100,
            "radius": 25000
        },
        "colors": {
            "Default": "#333333",
            "Color1": "#3a1e1e",
            "Color2": "#383a1e",
            "Color3": "#1e3a36",
            "Color4": "#1e233a",
            "Color5": "#3a1e29",
            "Color6": "#3e3136",
            "Color7": "#4c4c4c"
        },
        "simulation": {
            "firmware": 30000,
            "connect": 2000,
            "restart": 3300000
        },
        "commands": {
            "reboot": "reboot",
            "firmware": "firmware",
            "shutdown": "shutdown"
        }
    }

    public get(): {} { return SimulationStore.simulation; }

    public set(payload: any) { SimulationStore.simulation = payload; }
}