import * as uuidV4 from 'uuid/v4';
import { SimulationStore } from '../store/simulationStore';

export class SensorStore {
    private simulationStore = new SimulationStore();
    private mocks = this.simulationStore.get()["mocks"];

    public getListOfItems = () => {
        return [
            this.getNewSensor('battery'),
            this.getNewSensor('hotplate'),
            this.getNewSensor('fan'),
            this.getNewSensor('random'),
            this.getNewSensor('function')
        ]
    }

    public getNewSensor = (type: string) => {
        let base = {}
        switch (type) {
            case 'battery':
                base = {
                    _type: "battery",
                    _value: 0,
                    init: 100,
                    running: 0,
                    variance: 0.1,
                    timeToRunning: 86400000,
                    _resx: {
                        init: "Start",
                        running: "End",
                        variance: "Varies %",
                        timeToRunning: "End (ms)"
                    }
                }
                break;
            case 'hotplate':
                base = {
                    _type: "hotplate",
                    _value: 0,
                    init: 0,
                    running: 275,
                    variance: 0.1,
                    timeToRunning: 28800000,
                    _resx: {
                        init: "Start",
                        running: "End",
                        variance: "Varies %",
                        timeToRunning: "End (ms)"
                    }
                }
                break;
            case 'fan':
                base = {
                    _type: "fan",
                    _value: 0,
                    init: 0,
                    variance: 2.5,
                    running: 2000,
                    timeToRunning: 1,
                    _resx: {
                        init: "Initial",
                        running: "Expected",
                        variance: "Varies %",
                        timeToRunning: "Starts"
                    }
                }
                break;
            case 'random':
                base = {
                    _type: "random",
                    _value: 0,
                    variance: 3,
                    init: 0,
                    _resx: {
                        init: "Initial",
                        variance: "Length"
                    }
                }
                break;
            case 'function':
                base = {
                    _type: "function",
                    _value: 0,
                    init: 0,
                    function: "http://myfunctionUrl",
                    _resx: {
                        init: "Initial",
                        function: "Url"
                    }
                }
                break;
        }
        return Object.assign({ _id: uuidV4(), _hasState: false }, base, this.mocks[type])
    }

}