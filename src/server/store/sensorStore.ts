import * as uuidV4 from 'uuid/v4';

export class SensorStore {

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
        switch (type) {
            case 'battery':
                return {
                    _id: uuidV4(),
                    _hasState: false,
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
            case 'hotplate':
                return {
                    _id: uuidV4(),
                    _hasState: false,
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
            case 'fan':
                return {
                    _id: uuidV4(),
                    _hasState: false,
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
            case 'random':
                return {
                    _id: uuidV4(),
                    _hasState: false,
                    _type: "random",
                    _value: 0,
                    variance: 3,
                    init: 0,
                    _resx: {
                        init: "Initial",
                        variance: "Length"
                    }
                }
            case 'function':
                return {
                    _id: uuidV4(),
                    _hasState: false,
                    _type: "function",
                    _value: 0,
                    init: 0,
                    function: "http://myfunctionUrl",
                    _resx: {
                        init: "Initial",
                        function: "Url"
                    }

                }
        }
    }
}