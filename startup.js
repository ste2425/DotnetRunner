const { app, BrowserWindow, Menu } = require('electron');

const DotnetRunnerApp = require('./app/DotnetRunnerApp');
const SplashScreenApp = require('./app/SplashScreenApp');

const preferenceStore = require('./app/data/preferencesStore');

const splashApp = new SplashScreenApp();
const dotnetApp = new DotnetRunnerApp(BrowserWindow, Menu);

splashApp.onReady = function(settings) {
    const preferences = preferenceStore.getPreferences();
    
    dotnetApp.run({ displayReleaseNotes: preferences.autoOpenReleasenotes && settings.upgradePerformed })
        .once('ready-to-show', () => {
            splashApp.close();
            dotnetApp.show();
        });
}

app.on('ready', () => {
    splashApp.run();
});

app.on('window-all-closed', () => {    
      app.quit();
});
