const { app, BrowserWindow, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const { showYesNoDialogAsync } = require('./app/dialog');

const DotnetRunnerApp = require('./app/DotnetRunnerApp');

const isDev = require('electron-is-dev');

const dotnetApp = new DotnetRunnerApp(BrowserWindow, Menu);

app.on('ready', () => {
    dotnetApp.run();

    if (!isDev)
        autoUpdater.checkForUpdates();
});

app.on('window-all-closed', () => {    
      app.quit();
});

autoUpdater.on('update-downloaded', async () => {
    const update = await showYesNoDialogAsync('Update downloaded. Install?');

    if (update)
        autoUpdater.quitAndInstall();
});
