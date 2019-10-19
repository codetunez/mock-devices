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
        "semantics": {
            "SemanticType/Velocity": {
                "x": "AUTO_INTEGER",
                "y": "AUTO_INTEGER",
                "z": "AUTO_INTEGER",
            },
            "SemanticType/Acceleration": {
                "x": "AUTO_INTEGER",
                "y": "AUTO_INTEGER",
                "z": "AUTO_INTEGER",
            },
            "SemanticType/Location": {
                "lat": "AUTO_INTEGER",
                "lon": "AUTO_INTEGER",
                "alt": "AUTO_INTEGER",
            }
        },
        "runloop": {
            "secs": { min: 20, max: 90 },
            "mins": { min: 2, max: 10 }
        }
    }

    public get(): {} { return SimulationStore.simulation; }

    public set(payload: any) { SimulationStore.simulation = payload; }
}