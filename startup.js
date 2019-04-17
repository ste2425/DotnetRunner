const { app, BrowserWindow, Menu } = require('electron');

const DotnetRunnerApp = require('./app/DotnetRunnerApp');
const SplashScreenApp = require('./app/SplashScreenApp');

const splashApp = new SplashScreenApp();
const dotnetApp = new DotnetRunnerApp(BrowserWindow, Menu);

splashApp.onReady = function(settings) {
    dotnetApp.run({ displayReleaseNotes: settings.upgradePerformed })
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
