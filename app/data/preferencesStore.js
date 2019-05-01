const fs = require('fs'),
    path = require('path'),
    electron = require('electron');

const dataPath = path.join(
    (electron.app || electron.remote.app).getPath('userData'),
    'preferencesStore.json'
);

function setPreferences({
    runAtStartup,
    waitTimeout,
    autoOpenReleasenotes
} = {}) {
    const data = JSON.stringify({
        runAtStartup,
        waitTimeout,
        autoOpenReleasenotes
    });
    
    fs.writeFileSync(dataPath, data);
}


function getPreferences() {
    const data = fs.readFileSync(dataPath);

    const {
        runAtStartup,
        waitTimeout,
        autoOpenReleasenotes
    } = (data ? JSON.parse(data) : {});

    return {
        runAtStartup,
        waitTimeout,
        autoOpenReleasenotes
    };
}

if (!fs.existsSync(dataPath))
    setPreferences({
        waitTimeout: 0,
        autoOpenReleasenotes: true,
        runAtStartup: false
    });

module.exports.getPreferences = getPreferences;

module.exports.setPreferences = setPreferences; 