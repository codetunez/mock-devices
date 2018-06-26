import * as electron from 'electron';
import * as http from 'http';
import * as express from 'express';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import ping from './api/root';
import device from './api/device';
import devices from './api/devices';
import state from './api/state';
import server from './api/server';
import sensors from './api/sensors';

import { Config } from './config';
import { DeviceStore } from './store/deviceStore';
import { SensorStore } from './store/sensorStore';

const electronApp = electron.app;
const BrowserWindow = electron.BrowserWindow;

class Server {

    private app: any = null;
    private wss: any = null;

    private deviceStore: DeviceStore;
    private sensorStore: SensorStore;

    private mainWindow: any = null;
    
    public start = () => {

        this.deviceStore = new DeviceStore();
        this.sensorStore = new SensorStore();

        this.app = express();
        this.app.server = http.createServer(this.app);
        this.app.use(cors({ exposedHeaders: ["Link"] }));
        if (Config.WEBAPI_LOGGING) { this.app.use(morgan('tiny')); }
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json({ limit: "100kb" }));

        this.app.use(express.static(__dirname + '/../../src/client'));
        this.app.use('/_dist', express.static(__dirname + '/..'));
        this.app.use('/node_modules', express.static(__dirname + '/../../node_modules'));

        this.app.use('/api', ping());
        this.app.use('/api/device', device(this.deviceStore));
        this.app.use('/api/devices', devices(this.deviceStore));
        this.app.use('/api/state', state(this.deviceStore));
        this.app.use('/api/server', server(this.deviceStore));
        this.app.use('/api/sensors', sensors(this.sensorStore));

        // when in this mode you can run F5 in vscode
        if (Config.NODE_MODE) {
            this.startService();
        }
        else {
            electronApp.on('ready', this.startService.bind(this));
            electronApp.on('window-all-closed', (() => {
                if (process.platform !== 'darwin') {
                    electronApp.quit();
                }
            }));
            electronApp.on('activate', (() => {
                if (this.mainWindow === null) {
                    this.startService();
                }
            }));
        }
    }

    public startService = () => {
        this.app.server.listen(Config.APP_PORT);

        if (!Config.NODE_MODE) {
            this.mainWindow = new BrowserWindow({
                "width": Config.APP_WIDTH,
                "height": Config.APP_HEIGHT,
                "minWidth": Config.APP_WIDTH,
                "minHeight": Config.APP_HEIGHT,
                webPreferences: {
                    devTools: false
                }
            });

            this.mainWindow.loadURL(Config.LOCALHOST + ':' + Config.APP_PORT);

            this.mainWindow.on('closed', (() => {
                this.mainWindow = null;
            }));
            console.log("mock-devices is getting ready to launch. Once app has loaded, close app to end this console session.");
        } else {
            console.log("Started in NodeJS mode on port: " + this.app.server.address().port);           
        }
    }
}

// start the application
new Server().start();