const { BrowserWindow, Menu } = require('electron');
const { getApplications } = require('./data/applicationStore');
const { shell } = require('electron');

module.exports = class DotnetRunnerApp {
    /**
     * @param {typeof BrowserWindow} browserWindow
     * @param {typeof Menu} menu
     */
    constructor(browserWindow, menu) {
        
        /**
         * @type {typeof BrowserWindow}
         * @private
         */
        this._browserWindow = browserWindow;
        
        /**
         * 
         * @type {typeof Menu}
         * @private
         */
        this._menu = menu;

        /**
         * @type {BrowserWindow}
         * @private
         */
        this._mainWindow;

        /**
         * @type {boolean}
         * @private
         */
        this._preferencesOpen = false;
    }   

    /**
     * @private
     */
    _preferencesOnCLick() {
        if (this._preferencesOpen)
            return;

        this._preferencesOpen = true;

        const prefWindow = new BrowserWindow
        ({
            parent: this._mainWindow,
            modal: true,
            show: false
          //  autoHideMenuBar: true
        });

        prefWindow.setMenu(this.getPreferencesMenu());

        prefWindow.loadFile('app/browserWindows/dotnetAppConfiguration/appConfig.html');

        prefWindow.on('close', () => {
            this._preferencesOpen = false;
            this._sendMessage('reload-data');
        });

        prefWindow.once('ready-to-show', () => {
            prefWindow.show();
            prefWindow.focus();
        });
    }

    /**
     * @private
     */
    _devToolsOnClick() {
        this._browserWindow.getFocusedWindow().toggleDevTools();
    }

    /**
     * @returns {Menu}
     */
    getMenu() {
        const template = [
            {
                label: 'Preferences',
                submenu: [{
                    label: 'Configure Applicaions',                    
                    click: this._preferencesOnCLick.bind(this)
                }]
            }, {
                label: 'Tasks',
                submenu: [{
                    label: 'Start all',
                    accelerator: 'Ctrl+s',
                    click: this._startAllApps.bind(this)
                }, {
                    label: 'Stop all',
                    accelerator: 'Ctrl+Shift+S',
                    click: this._stopAllApps.bind(this)
                }, {
                    label: 'Clear all',
                    accelerator: 'Ctrl+Shift+C',
                    click: this._clearAllApps.bind(this)
                }, {
                    label: 'Purge',
                    accelerator: 'Ctrl+Shift+P',
                    click: () => this._sendMessage('purge')
                }]
            }, {
                label: 'Help',
                submenu: [{
                    label: 'Release Notes',
                    click: this._displayReleaseNotes.bind(this)
                }, {
                   label: 'Log an Issue',
                   click() {
                       shell.openExternal('https://github.com/ste2425/DotnetRunner/issues');
                   } 
                }, {
                    label: 'Toggle Developer Tools',
                    accelerator: 'Ctrl+Shift+I',
                    click: this._devToolsOnClick.bind(this)
                }]
            }
        ];
    
       return this._menu.buildFromTemplate(template);
    }

    _displayReleaseNotes() {
        this._sendMessage('display-release-notes');
    }

    _startAllApps() {
        this._sendMessage('start-all');
    }

    _stopAllApps() {
        this._sendMessage('stop-all');
    }

    _clearAllApps() {
        this._sendMessage('clear-all');
    }

    _sendMessage(message) {
        this._mainWindow.send(message);
    }

    /**
     * @returns {Menu}
     */
    getPreferencesMenu() {
        const template = [
            {
                label: 'Help',
                submenu: [{
                    label: 'Toggle Developer Tools',
                    accelerator: 'Ctrl+Shift+I',
                    click: this._devToolsOnClick.bind(this)
                }]
            }
        ];
    
       return this._menu.buildFromTemplate(template);        
    }

    run({
        displayReleaseNotes
    } = {}) {
        this._mainWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInWorker: true
            }
        });

        this._mainWindow.loadFile('app/browserWindows/main/main.html');

        this._menu.setApplicationMenu(this.getMenu());

        const eixstingApps = getApplications();

        if (!eixstingApps || eixstingApps.length === 0) {
            this._preferencesOnCLick();
        }

        if (displayReleaseNotes)
            this._mainWindow.once('ready-to-show', () => this._displayReleaseNotes());

        return this;
    }

    show() {
        this._mainWindow.show();
        this._mainWindow.focus();
        this._mainWindow.maximize();
    }

    once(...args) {
        this._mainWindow.once(...args);
    }
}