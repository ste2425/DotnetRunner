const { BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const { showYesNoDialogAsync } = require('./utils/dialog');

module.exports = class SplashScreenApp {

    constructor() {

        /**
         * @type {BrowserWindow}
         * @private
         */
        this._splashWindow;

        this.onReady;

        autoUpdater.on('checking-for-update', () => {
            this._splashWindow
                .webContents.send('checking-for-update');
        }); 
        
        autoUpdater.on('update-available', () => {
            this._splashWindow
                .webContents.send('update-available');
        }); 
        
        autoUpdater.on('update-not-available', () => {
            this._splashWindow
                .webContents.send('update-not-available');
            
            this.onReady();
        }); 
        
        autoUpdater.on('download-progress', (e) => {
            this._splashWindow
                .webContents.send('download-progress', e);
        }); 
        
        autoUpdater.on('update-downloaded', () => {
            this._splashWindow
                .webContents.send('update-downloaded');
        });
        
        autoUpdater.on('error', (e) => {
            this._splashWindow
                .webContents.send('error', e.message);
        
            // Give time to read error
            setTimeout(() => {
               this.onReady();
            }, 2000);
        }); 

        autoUpdater.on('update-downloaded', async () => {
            const update = await showYesNoDialogAsync('Update downloaded. Install?');
        
            if (update)
                autoUpdater.quitAndInstall();
            else
                this.onReady();
        });
    }

    run() {
        this._splashWindow = new BrowserWindow({
            height: 300,
            width: 600,
            frame: false,
            show: false
        });

        
        this._splashWindow
            .loadFile('app/browserWindows/splashScreen/splashScreen.html');

        this._splashWindow.once('ready-to-show', () => {
            this._splashWindow.show();
            autoUpdater.checkForUpdates();
        });
    }

    close() {
        this._splashWindow.close();
    }
}