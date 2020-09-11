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
                "min": 300,
                "max": 900
            },
            "mins": {
                "min": 30,
                "max": 120
            }
        },
        "geo": {
            "latitude": 51.508009,
            "longitude": -0.128114,
            "altitude": 100,
            "radius": 25000
        },
        "colors": {
            "Default": "#333",
            "Color1": "#3a1e1e",
            "Color2": "#383a1e",
            "Color3": "#3e2e12",
            "Color4": "#ad3523",
            "Color5": "#313546",
            "Color6": "#205375",
            "Color7": "#4a4646",
            "Color8": "#774b00",
            "Color9": "#941d49",
            "Color10": "#000"
        },
        "simulation": {
            "firmware": 30000,
            "connect": 5000,
            "restart": {
                min: 8,
                max: 16
            },
            "sasExpire": 168,
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
        },
        "snippets": {
            "DTDLv2": {
                "value": "DESIRED_VALUE",
                "ac": 200,
                "ad": "completed",
                "av": "DESIRED_VERSION"
            },
            "Legacy IoTC": {
                "value": "DESIRED_VALUE",
                "status": "completed",
                "message": "test message",
                "statusCode": 200,
                "desiredVersion": "DESIRED_VERSION"
            },
            "Response": {
                "result": "OK"
            }
        }
    }

    public get(): {} { return SimulationStore.simulation; }

    public set(payload: any) { SimulationStore.simulation = payload; }
}