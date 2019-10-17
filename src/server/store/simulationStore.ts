import * as uuidV4 from 'uuid/v4';
import simulation from '../api/simulation';

export class SimulationStore {

    private simulation: any;
    
    static Simulation = () => { return simulation; }

    constructor() {
        this.simulation = {
            "ranges": {
                "AUTO_INTEGER": { min: 0, max: 5000 },
                "AUTO_DOUBLE": { min: 0, max: 5000 },
                "AUTO_LONG": { min: 0, max: 5000 },
                "AUTO_FLOAT": { min: 0, max: 5000 }
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
            }
        }
    }

    public getSimulation = () => {
        return this.simulation;
    }

    public setSimulation = (payload: any) => {
        this.simulation = payload;
    }
}