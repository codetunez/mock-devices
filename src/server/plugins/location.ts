import { isArray } from 'lodash';
import { PlugIn } from '../interfaces/plugin'

const amtrakEmpireBuilder = [
    { "lat": 41.768321848400014, "lon": -87.6875472938727, "alt": 150 },
    { "lat": 44.853027003833986, "lon": -91.5767074501227, "alt": 150 },
    { "lat": 45.93308261605998, "lon": -95.5537582313727, "alt": 150 },
    { "lat": 47.854713044021224, "lon": -97.0918441688727, "alt": 150 },
    { "lat": 48.615735050822146, "lon": -101.0469222938727, "alt": 150 },
    { "lat": 48.324373734023865, "lon": -104.1670394813727, "alt": 150 },
    { "lat": 48.67380662151449, "lon": -108.3418441688727, "alt": 150 },
    { "lat": 48.659294997432106, "lon": -110.8247543251227, "alt": 150 },
    { "lat": 48.74972897998688, "lon": -115.90872652632665, "alt": 150 },
    { "lat": 48.311391656106984, "lon": -117.06778414351415, "alt": 150 },
    { "lat": 46.97043699395145, "lon": -120.04413248271241, "alt": 150 },
    { "lat": 47.276922917781874, "lon": -122.46112467021241, "alt": 150 }
]

const redmondToBellevue = [
    { "lat": 47.649982546308685, "lon": -122.13334800571964, "alt": 150 },
    { "lat": 47.649747649901215, "lon": -122.13333727688358, "alt": 150 },
    { "lat": 47.64975307059946, "lon": -122.13248165220783, "alt": 150 },
    { "lat": 47.64941698624499, "lon": -122.13243069023655, "alt": 150 },
    { "lat": 47.64895622192149, "lon": -122.13241191477344, "alt": 150 },
    { "lat": 47.647998541891745, "lon": -122.13242532581852, "alt": 150 },
    { "lat": 47.64692700360937, "lon": -122.1323502239661, "alt": 150 },
    { "lat": 47.64555728185674, "lon": -122.13233681292103, "alt": 150 },
    { "lat": 47.644108012083386, "lon": -122.1323153552489, "alt": 150 },
    { "lat": 47.642989408542554, "lon": -122.13229926199482, "alt": 150 },
    { "lat": 47.641688256357256, "lon": -122.13237704605625, "alt": 150 },
    { "lat": 47.63986116712858, "lon": -122.1323850926833, "alt": 150 },
    { "lat": 47.638349994764866, "lon": -122.13237704605625, "alt": 150 },
    { "lat": 47.636660147740955, "lon": -122.13238777489231, "alt": 150 },
    { "lat": 47.63504073503379, "lon": -122.1324575123267, "alt": 150 },
    { "lat": 47.6332306383942, "lon": -122.1323689994292, "alt": 150 },
    { "lat": 47.63278946960625, "lon": -122.13236012366063, "alt": 150 },
    { "lat": 47.63193632918991, "lon": -122.13376828339345, "alt": 150 },
    { "lat": 47.6308825369497, "lon": -122.13445492890126, "alt": 150 },
    { "lat": 47.62963711872509, "lon": -122.1347124209667, "alt": 150 },
    { "lat": 47.62891046042013, "lon": -122.13517376091725, "alt": 150 },
    { "lat": 47.62820548375264, "lon": -122.13643976357228, "alt": 150 },
    { "lat": 47.627536650944805, "lon": -122.13860967066533, "alt": 150 },
    { "lat": 47.62715703932763, "lon": -122.140170716312, "alt": 150 },
    { "lat": 47.62661653993442, "lon": -122.14266517069585, "alt": 150 },
    { "lat": 47.62624053706007, "lon": -122.14450248387105, "alt": 150 },
    { "lat": 47.625631334354225, "lon": -122.14750387575872, "alt": 150 },
    { "lat": 47.62519566871768, "lon": -122.14963891413457, "alt": 150 },
    { "lat": 47.62459910822144, "lon": -122.152597390678, "alt": 150 },
    { "lat": 47.62417247290319, "lon": -122.15479680207021, "alt": 150 },
    { "lat": 47.62335354026886, "lon": -122.1585948100353, "alt": 150 },
    { "lat": 47.62291785564796, "lon": -122.16065206434972, "alt": 150 },
    { "lat": 47.62206275057758, "lon": -122.16464183574377, "alt": 150 },
    { "lat": 47.62140107068849, "lon": -122.16781220679937, "alt": 150 },
    { "lat": 47.62081697663085, "lon": -122.1705542256353, "alt": 150 },
    { "lat": 47.620142625511235, "lon": -122.17401427526451, "alt": 150 },
    { "lat": 47.61998533592938, "lon": -122.17564505834557, "alt": 150 },
    { "lat": 47.62046624281769, "lon": -122.17871082324959, "alt": 150 },
    { "lat": 47.62102488473919, "lon": -122.18026382226921, "alt": 150 },
    { "lat": 47.622096954295436, "lon": -122.18245518703438, "alt": 150 },
    { "lat": 47.62274235487693, "lon": -122.18423080940224, "alt": 150 },
    { "lat": 47.62283274647908, "lon": -122.1855745961187, "alt": 150 },
    { "lat": 47.62224158256942, "lon": -122.18568724889732, "alt": 150 },
    { "lat": 47.621128746264176, "lon": -122.18563810404426, "alt": 150 },
    { "lat": 47.6195093985426, "lon": -122.18576766052524, "alt": 150 },
    { "lat": 47.6183486847078, "lon": -122.18577034273426, "alt": 150 },
    { "lat": 47.617433836019174, "lon": -122.18576497831623, "alt": 150 },
    { "lat": 47.6173754240131, "lon": -122.18602073831737, "alt": 150 },
    { "lat": 47.617395312220495, "lon": -122.18795997543513, "alt": 150 },
    { "lat": 47.61742243249111, "lon": -122.19015402240932, "alt": 150 },
    { "lat": 47.61741520042031, "lon": -122.19107670231044, "alt": 150 },
    { "lat": 47.61719462178064, "lon": -122.19107938451945, "alt": 150 },
    { "lat": 47.61694330563908, "lon": -122.19109547777354, "alt": 150 },
    { "lat": 47.61692703332929, "lon": -122.19149512691676, "alt": 150 }
]
// This class name is used in the device configuration and UX
export class Location implements PlugIn {

    // Sample code
    private devices = {};

    // this is used by the UX to show some information about the plugin
    public usage: string = "This is a sample plugin that will provide a Geopoint on every call for any capability called location. Geopoint can be sent via the payload. Device/Capability combination is honored"

    // this is called when mock-devices first starts. time hear adds to start up time
    public initialize = () => {
        return undefined;
    }

    // not implemented
    public reset = () => {
        return undefined;
    }

    // this is called when a device is added or it's configuration has changed i.e. one of the capabilities has changed
    public configureDevice = (deviceId: string, running: boolean) => {
        if (!running) {
            this.devices[deviceId] = {};
        }
    }

    // this is called when a device has gone through dps/hub connection cycles and is ready to send data
    public postConnect = (deviceId: string) => {
        return undefined;
    }

    // this is called when a device has fully stopped sending data
    public stopDevice = (deviceId: string) => {
        return undefined;
    }

    // this is called during the loop cycle for a given capability or if Send is pressed in UX
    public propertyResponse = (deviceId: string, capability: any, payload: any) => {

        const arr = isArray(payload) && payload.length > 0 ? payload : payload && payload === 'AMTRAK' ? amtrakEmpireBuilder : redmondToBellevue;

        if (capability.name === 'location') {
            if (Object.getOwnPropertyNames(this.devices[deviceId]).indexOf(capability._id) > -1) {
                this.devices[deviceId][capability._id] = this.devices[deviceId][capability._id] + 1;
            } else {
                this.devices[deviceId][capability._id] = 0;
            }

            if (this.devices[deviceId][capability._id] > arr.length) {
                this.devices[deviceId][capability._id] = 0;
            }
            return arr[this.devices[deviceId][capability._id]];
        } else {
            return undefined;
        }
    }

    // this is called when the device is sent a C2D Command or Direct Method
    public commandResponse = (deviceId: string, capability: any) => {
        return undefined;
    }

    // this is called when the device is sent a desired twin property
    public desiredResponse = (deviceId: string, capability: any) => {
        return undefined;
    }
}
