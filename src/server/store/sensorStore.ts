import * as uuidV4 from 'uuid/v4';

export class SensorStore {

    constructor() {
    }

    public getListOfItems = () => {

        return [{
            _id: uuidV4(),
            _hasState: false,
            _type: "battery",
            _value: 0,            
            init: 100,
            running: 0,
            variance: 0.1,
            timeToRunning: 10800,
            _resx: {
                init: "Initial",
                running: "Start",
                variance: "Varies %",
                timeToRunning: "End (ms)"
            }
        },
        {
            _id: uuidV4(),
            _hasState: false,
            _type: "hotplate",
            _value: 0,
            init: 0,
            running: 275,
            variance: 0.1,
            timeToRunning: 520,
            _resx: {
                init: "Initial",
                running: "Start",
                variance: "Varies %",
                timeToRunning: "End (ms)"
            }
        },
        {
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
        },
        {
            _id: uuidV4(),
            _hasState: false,
            _type: "random",
            _value: 0,
            init: 0,
            _resx: {
                init: "Initial"
            }
        },
        {
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
        }]
    }

}