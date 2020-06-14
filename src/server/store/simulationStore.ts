import * as uuidV4 from 'uuid/v4';
import simulation from '../api/simulation';

export class SimulationStore {

    static simulation = {
        "bulk": {
            "mode": "random",
            "random": {
                "min": 5000,
                "max": 90000
            },
            "batch": {
                "size": 10,
                "delay": 5000
            }
        },
        "ranges": {
            "AUTO_INTEGER": {
                "min": 1,
                "max": 5000
            },
            "AUTO_DOUBLE": {
                "min": 1,
                "max": 5000
            },
            "AUTO_LONG": {
                "min": 1,
                "max":
                    5000
            },
            "AUTO_FLOAT": {
                "min": 1,
                "max": 5000
            },
            "AUTO_VECTOR": {
                "min": 1,
                "max": 500
            }
        },
        "runloop": {
            "secs": {
                "min": 90,
                "max": 360
            },
            "mins": {
                "min": 15,
                "max": 60
            }
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
            "connect": 5000,
            "restart": {
                min: 5,
                max: 10
            },
            "sasExpire": 72,
            "dpsRetires": 10
        },
        "commands": {
            "reboot": "reboot",
            "firmware": "firmware",
            "shutdown": "shutdown"
        },
        "mocks": {
            "battery": {
                "init": 100,
                "running": 0,
                "variance": 0.1,
                "timeToRunning": 60400000
            },
            "hotplate": {
                "init": 0,
                "running": 275,
                "variance": 0.1,
                "timeToRunning": 28800000
            },
            "fan": {
                "init": 0,
                "variance": 2.5,
                "running": 2000,
                "timeToRunning": 1
            },
            "random": {
                "init": 0,
                "variance": 3
            }
        },
        "plan": {
            "startDelay": 2000,
            "timelineDelay": 5000
        }
    }

    public get(): {} { return SimulationStore.simulation; }

    public set(payload: any) { SimulationStore.simulation = payload; }
}