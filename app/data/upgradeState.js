const fs = require('fs'),
    path = require('path'),
    electron = require('electron');

const dataPath = path.join(
    (electron.app || electron.remote.app).getPath('userData'),
    'upgradeState.json'
);

function _getSettings() {
    const data = fs.readFileSync(dataPath).toString();

    return data ? JSON.parse(data) : {};
}

function markUpgradeActive() {
    const data = _getSettings();

    Object.assign(data, {
        upgradeActive: true
    });
    
    fs.writeFileSync(dataPath, JSON.stringify(data));
}

function markUpgradeFinished() {
    const data = _getSettings();

    Object.assign(data, {
        upgradeActive: false
    });
    
    fs.writeFileSync(dataPath, JSON.stringify(data));
}

function isUpgradeActive() {
    const data = _getSettings();

    return data.upgradeActive;
}

// Very first run will be from an upgrade, so default to true
if (!fs.existsSync(dataPath))
    fs.writeFileSync(dataPath, JSON.stringify({
        upgradeActive: true
    }));

module.exports.markUpgradeActive = markUpgradeActive;
module.exports.markUpgradeFinished = markUpgradeFinished; 
module.exports.isUpgradeActive = isUpgradeActive; 