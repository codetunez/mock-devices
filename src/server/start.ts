const isDocker = require('is-docker');
import { screen, dialog, app, Menu, BrowserWindow } from 'electron';
import * as http from 'http';
import * as https from 'https';
import * as express from 'express';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import root from './api/root';
import device from './api/device';
import devices from './api/devices';
import state from './api/state';
import server from './api/server';
import sensors from './api/sensors';
import semantics from './api/simulation';
import template from './api/template';

import { Config, GLOBAL_CONTEXT } from './config';
import { DeviceStore } from './store/deviceStore';
import { SensorStore } from './store/sensorStore';
import { SimulationStore } from './store/simulationStore';
import { ServerSideMessageService } from './core/messageService';
var path = require('path');
var pjson = require('../../package.json');

class Server {

    private expressServer: any = null;

    private deviceStore: DeviceStore;
    private sensorStore: SensorStore;
    private simulationStore: SimulationStore;

    public start = () => {

        const ms = new ServerSideMessageService();

        this.deviceStore = new DeviceStore(ms);
        this.sensorStore = new SensorStore();
        this.simulationStore = new SimulationStore();

        this.expressServer = express();
        this.expressServer.server = http.createServer(this.expressServer);
        this.expressServer.use(cors({ origin: false, exposedHeaders: ["Link"] }));
        if (Config.WEBAPI_LOGGING) { this.expressServer.use(morgan('tiny')); }

        // if sec is an issue, this should be changed
        this.expressServer.use(function (req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            res.setHeader('Access-Control-Allow-Credentials', false);
            next();
        });

        this.expressServer.use(bodyParser.urlencoded({ extended: false }));
        this.expressServer.use(bodyParser.json({ limit: "9000kb" }));

        this.expressServer.use(express.static(__dirname + '/../../static'));
        this.expressServer.use('/_dist', express.static(__dirname + '/..'));
        this.expressServer.use('/node_modules', express.static(__dirname + '/../../node_modules'));

        this.expressServer.use('/api/simulation', semantics(this.deviceStore, this.simulationStore));
        this.expressServer.use('/api/device', device(this.deviceStore));
        this.expressServer.use('/api/devices', devices(this.deviceStore));
        this.expressServer.use('/api/state', state(this.deviceStore, this.simulationStore, ms));
        this.expressServer.use('/api/server', server(this.deviceStore));
        this.expressServer.use('/api/sensors', sensors(this.sensorStore));
        this.expressServer.use('/api/template', template(this.deviceStore));
        this.expressServer.use('/api', root(dialog, app, GLOBAL_CONTEXT, ms));

        // experimental stream api
        this.expressServer.get('/api/events/:type', (req, res, next) => {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Connection': 'keep-alive',
                'Cache-Control': 'no-cache'
            });
            res.write('\n');

            // messageLoop|controlLoop|dataLoop|stateLoop
            const dynamicName = `${req.params.type}Loop`;
            ms[dynamicName](res);
            res.on('close', () => { ms.end(dynamicName); });
            res.on('finish', () => { ms.end(dynamicName); });
        });

        this.expressServer.get('*', (req, res) => res.sendFile(path.resolve(__dirname + '/../../static/index.html')));

        if (isDocker() || Config.NODE_MODE) {
            this.startApplication();
        }
        else {
            app.on('quit', function (err) {
                console.log("exiting application");
            });

            app.on('ready', this.startApplication.bind(this));

            app.on('window-all-closed', (() => {
                app.quit();
            }));

            app.on('activate', (() => {
                if (this.mainWindow === null) {
                    this.startApplication();
                }
            }));

            app.on('will-quit', (() => {
                ms.endAll();
            }));
        }
    }

    private mainWindow: any = null;

    public startApplication = () => {
        this.expressServer.server.listen(Config.APP_PORT);

        if (isDocker() || Config.NODE_MODE) {
            console.log("mock-devices for desktop headless has launched on: " + this.expressServer.server.address().port);
            return;
        }

        // electron start only
        let override = { size: { height: 1000 } };
        try {
            override = screen.getPrimaryDisplay();
        } catch { }

        this.mainWindow = new BrowserWindow({
            "width": Config.APP_WIDTH,
            "height": override.size.height,
            "minWidth": Config.APP_WIDTH,
            "minHeight": Config.APP_HEIGHT,
            webPreferences: {
                devTools: true,
                spellcheck: false,
                enableWebSQL: false
            }
        });

        const template: any = [{
            label: 'File',
            submenu: [
                process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' },
                { role: 'forcereload' },
                { role: 'toggledevtools' }
            ]
        }]

        const menu = Menu.buildFromTemplate(template)
        if (Config.DEV_TOOLS) { Menu.setApplicationMenu(menu); }
        else { Menu.setApplicationMenu(null); }

        this.mainWindow.loadURL('http://127.0.0.1:' + Config.APP_PORT);
        this.mainWindow.on('closed', (() => {
            this.mainWindow = null;
        }));

        console.log("mock-devices for desktop is launching. Keep current window open to keep app running");
    }
}

// handle all uncaught client errors
process.on('uncaughtException', ((err) => {
    console.log(err);
}));

// start the application
new Server().start();