import { ConnectionString } from 'azure-iot-common';
import * as iothub from 'azure-iothub';
import * as uuidV4 from 'uuid/v4';
import * as crypto from 'crypto';

export class IotHub {

    static CreateDevice(connectionString: string) {

        // Create a new device
        var device = {
            deviceId: uuidV4()
        };

        return new Promise((resolve, reject) => {
            if (connectionString === '') { reject('Connection string for IoT Hub is empty.'); return; }
            try {
                var registry = iothub.Registry.fromConnectionString(connectionString);
                registry.create(device, function (err: any, deviceInfo: any, res: any) {
                    if (err) { reject(err.toString()); }
                    if (res) {
                        console.log('-----> ' + Date.now() + ' DEVICE CREATE [' + res.statusCode + '] ' + res.statusMessage);
                        if (deviceInfo) {
                            resolve(deviceInfo);
                        }
                        else {
                            reject('No DeviceInfo from device create. Check subscription');
                        }
                    }
                    else {
                        reject('No response from device create. Check subscription');
                    }
                })
            }
            catch (ex) {
                reject(ex.message);
            }
        })
    }

    static GetDevices(connectionString: string) {

        return new Promise((resolve, reject) => {
            if (connectionString === '') { reject('Connection string for IoT Hub is empty.'); return; }
            try {
                let registry = iothub.Registry.fromConnectionString(connectionString);
                registry.list(function (err, deviceList) {
                    if (err) { reject(err.toString()); }
                    if (deviceList) {
                        let cn = ConnectionString.parse(connectionString);
                        let deviceList2 = []
                        deviceList.map((item: any) => {
                            let o = item;
                            o.connectionString = 'HostName=' + cn.HostName + ';DeviceId=' + item.deviceId + ';SharedAccessKey=' + item.authentication.SymmetricKey.primaryKey;
                            deviceList2.push(o);
                        })
                        resolve(deviceList2);
                    }
                    else {
                        reject('No Devices found');
                    }
                })
            }
            catch (ex) {
                reject(ex.message);
            }
        })
    }

    static GetTwin(connectionString: string, deviceId: string) {

        return new Promise((resolve, reject) => {
            if (connectionString === '') { reject('Connection string for IoT Hub is empty.'); return; }
            try {
                let registry = iothub.Registry.fromConnectionString(connectionString);

                registry.getTwin(deviceId, function (err, twin) {
                    if (err) { reject(err.toString()); }
                    if (twin) {
                        let payload = JSON.stringify(twin, null, 2);
                        resolve(payload);
                    }
                    else {
                        reject('Device not found');
                    }
                })
            }
            catch (ex) {
                reject(ex.message);
            }
        })
    }

    static WriteTwin(connectionString: string, properties: any, deviceId: string) {

        return new Promise((resolve, reject) => {
            if (connectionString === '') { reject('Connection string for IoT Hub is empty.'); return; }
            try {
                var etag = crypto.randomBytes(2).toString('hex');
                var payload = { properties: { desired: properties } }
                
                let registry = iothub.Registry.fromConnectionString(connectionString);
                registry.updateTwin(deviceId, payload, etag, function (err, twin) {
                    if (err) { reject(err.toString()); }
                    if (twin) {
                        let payload = JSON.stringify(twin, null, 2);
                        resolve(payload);
                    }
                    else {
                        reject('Device not found');
                    }
                })
            }
            catch (ex) {
                reject(ex.message);
            }
        })
    }

    static DeleteDevice(connectionString: string, deviceId: string) {

        return new Promise((resolve, reject) => {
            if (connectionString === '') { reject('Connection string for IoT Hub is empty.'); return; }
            try {
                let registry = iothub.Registry.fromConnectionString(connectionString);
                registry.delete(deviceId, function (err) {
                    if (err) { reject(err.toString()); }
                    registry.list(function (err2, deviceList) {
                        if (err2) { reject(err2.toString()); }
                        if (deviceList) {
                            resolve(deviceList);
                        }
                        else {
                            reject('No Devices found');
                        }
                    })
                })
            }
            catch (ex) {
                reject(ex.message);
            }
        })
    }
}