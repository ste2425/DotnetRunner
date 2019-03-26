const fs = require('fs'),
    path = require('path'),
    electron = require('electron');

const dataPath = path.join(
    (electron.app || electron.remote.app).getPath('userData'),
    'applicationSore.json'
);

/**
 * 
 * @param {[]} apps - applications to store 
 */
function setApplications(apps) {
    const data = JSON.stringify(apps.map(x => {
        delete x.component;

        return x;
    }));
    
    fs.writeFileSync(dataPath, data);
}

/**
 * @returns {[]}
 */
function getApplications() {
    const data = fs.readFileSync(dataPath);

    return (data ? JSON.parse(data) : [])
        .map(x => Object.assign({}, x, { 
            component: {}
        }));
}

if (!fs.existsSync(dataPath))
    setApplications([]);

module.exports.getApplications = getApplications;

module.exports.setApplications = setApplications; 