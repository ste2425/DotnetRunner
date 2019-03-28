const { BrowserWindow, Menu } = require('electron');
const { getApplications } = require('./data/applicationStore');

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
    }   

    /**
     * @private
     */
    _preferencesOnCLick() {
        const prefWindow = new BrowserWindow
        ({
            parent: this._mainWindow,
            modal: true,
            show: false
          //  autoHideMenuBar: true
        });

        prefWindow.setMenu(this.getPreferencesMenu());

        prefWindow.loadFile('app/browserWindows/dotnetAppConfiguration/appConfig.html');

        prefWindow.on('close', () => this._mainWindow.webContents.send('reload-data'));

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
                click: this._preferencesOnCLick.bind(this)
            }, 
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

    run() {
        this._mainWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInWorker: true
            }
        });

        this._mainWindow.once('ready-to-show', () => {
            this._mainWindow.show();
            this._mainWindow.focus();
        });

        this._mainWindow.loadFile('app/browserWindows/main/main.html');

        this._mainWindow.maximize();

        this._menu.setApplicationMenu(this.getMenu());

        const eixstingApps = getApplications();

        if (!eixstingApps || eixstingApps.length === 0) {
            this._preferencesOnCLick();
        }
    }
}