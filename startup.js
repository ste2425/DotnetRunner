const { app, BrowserWindow, Menu } = require('electron');

const DotnetRunnerApp = require('./app/DotnetRunnerApp');
const SplashScreenApp = require('./app/SplashScreenApp');

const preferenceStore = require('./app/data/preferencesStore');

const ipcMessages = require('./app/ipcMessages');

const tray = require('./app/tray');

const splashApp = new SplashScreenApp();
const dotnetApp = new DotnetRunnerApp(BrowserWindow, Menu);

splashApp.onReady = function(settings) {
    const preferences = preferenceStore.getPreferences();
    
    dotnetApp.run({ displayReleaseNotes: preferences.autoOpenReleasenotes && settings.upgradePerformed })
        .once('ready-to-show', () => {

            splashApp.close();
            dotnetApp.show();

            tray.create({
                onQuit() {
                    app.quit();
                },
                onClick() {
                    dotnetApp.show()
                }
            });

            dotnetApp.on(ipcMessages.trayTooltipText, (e, t) => tray.setTooltip(t));
        });
}
app.on('ready', () => {
    const shouldQuit = !app.requestSingleInstanceLock();

    if (shouldQuit) {
        app.quit();
        return;
    } else {
        app.on('second-instance', () => {
            if (splashApp.ready) {
                dotnetApp.onSecondInstance();
            } else {
                splashApp.onSecondInstance();
            }
        });
    }

    splashApp.run();
});

app.on('window-all-closed', () => {    
      app.quit();
});
