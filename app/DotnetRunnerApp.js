const { BrowserWindow, Menu, ipcMain } = require('electron');
const { getApplications } = require('./data/applicationStore');
const { shell } = require('electron');
const ipcMessages = require('./ipcMessages');

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
        });

        prefWindow.setMenu(this.getPreferencesMenu());

        prefWindow.loadFile('app/browserWindows/dotnetAppConfiguration/appConfig.html');

        prefWindow.on('close', () => {
            this._preferencesOpen = false;
            this._sendMessage(ipcMessages.reloadApplications);
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
                label: 'Options',
                submenu: [{
                    id: 'config-apps',
                    label: 'Configure Applicaions',                    
                    click: this._preferencesOnCLick.bind(this)
                }, {
                    label: 'Preferences',
                    click: this._displayPreferences.bind(this)
                }]
            }, {
                id: 'tasks',
                label: 'Tasks',
                submenu: [{
                    id: 'start-all',
                    label: 'Start all',
                    accelerator: 'Ctrl+s',
                    click: this._startAllApps.bind(this)
                }, {
                    id: 'stop-all',
                    label: 'Stop all',
                    accelerator: 'Ctrl+Shift+S',
                    click: this._stopAllApps.bind(this)
                }, {
                    id: 'clear-all',
                    label: 'Clear all',
                    accelerator: 'Ctrl+Shift+C',
                    click: this._clearAllApps.bind(this)
                }, {
                    id: 'purge-all',
                    label: 'Purge',
                    accelerator: 'Ctrl+Shift+P',
                    click: this._purge.bind(this)
                }]
            }, {
                label: 'Help',
                submenu: [{
                    label: 'Release Notes',
                    click: this._displayReleaseNotes.bind(this)
                }, {
                    label: 'Wiki',
                    click() {
                        shell.openExternal('https://github.com/ste2425/DotnetRunner/wiki');
                    } 
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

    _displayPreferences() {
        this._sendMessage(ipcMessages.displayPreferences);
    }

    _displayReleaseNotes() {
        this._sendMessage(ipcMessages.displayReleaseNotes);
    }

    _startAllApps() {
        this._disableTasks();
        this._disableConfigAppMenu();
        this._sendMessage(ipcMessages.startAllApplications);
        ipcMain.once(ipcMessages.taskComplete, this._onTaskComplete.bind(this));
    }

    _stopAllApps() {
        this._disableTasks();
        this._disableConfigAppMenu();
        this._sendMessage(ipcMessages.stopAllApplications);
        ipcMain.once(ipcMessages.taskComplete, this._onTaskComplete.bind(this));
    }

    _clearAllApps() {
        this._disableTasks();
        this._disableConfigAppMenu();
        this._sendMessage(ipcMessages.clearAllApplicationLogs);
        ipcMain.once(ipcMessages.taskComplete, this._onTaskComplete.bind(this));
    }

    _purge() {
        this._sendMessage(ipcMessages.purgeRunningProcesses);
    }

    _sendMessage(message) {
        this._mainWindow.send(message);
    }

    _disableTasks() {
        const menu = this._menu.getApplicationMenu().getMenuItemById('tasks');

        if (!menu || !menu.submenu || !menu.submenu.items)
            return;

        menu.submenu.items.forEach(x => x.enabled = false);
    }

    _enableTasks() {
        const menu = this._menu.getApplicationMenu().getMenuItemById('tasks');

        if (!menu || !menu.submenu || !menu.submenu.items)
            return;

        menu.submenu.items.forEach(x => x.enabled = true);
    }

    _disableConfigAppMenu() {
        const menu = this._menu.getApplicationMenu().getMenuItemById('config-apps') || {};

        menu.enabled = false;
    }

    _enableConfigAppMenu() {
        const menu = this._menu.getApplicationMenu().getMenuItemById('config-apps') || {};

        menu.enabled = true;
    }

    _onTaskComplete(e, task) {
        if (task === ipcMessages.startAllApplications || task === ipcMessages.stopAllApplications || task === ipcMessages.clearAllApplicationLogs)
            this._enableConfigAppMenu();

        this._enableTasks();
    }

    _handleMinimizeToTray() {
        this._mainWindow.on('minimize', (e) => {
            e.preventDefault();
            this._mainWindow.hide();
        });
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

        this._handleMinimizeToTray();

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

    onSecondInstance() {
        if (this._mainWindow.isMinimized())
            this._mainWindow.restore();

        this._mainWindow.show();
        this._mainWindow.focus();
    }

    once(...args) {
        this._mainWindow.once(...args);
    }

    on(...args) {
        ipcMain.on(...args);
    }
}