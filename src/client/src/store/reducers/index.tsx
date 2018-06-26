import { combineReducers } from 'redux';

import display from './displayReducer';
import device from './deviceReducer';
import devices from './devicesReducer';
import resx from './resxReducer';
import state from './stateReducer';
import sensors from './sensorsReducer';
import dirty from './dirtyReducer';
import methodParams from './methodParamsReducer';

export default combineReducers({
    display, device, devices, resx, state, sensors, dirty, methodParams
});