const { countRunningDotnetProcessesAsync } = require('../../tasks');

const { WebWorkerChild } = require('../workerManagers');

const childManager = new WebWorkerChild();

let pendingTimeout;

function getTaskCount() {
    countRunningDotnetProcessesAsync()
        .then(count => {
            childManager.emit('data', count);
            
            pendingTimeout = setTimeout(getTaskCount, 5000);
        });
}

function stopTaskCount() {
    clearTimeout(pendingTimeout);
}

function triggerNow() {
    stopTaskCount();
    getTaskCount();
}

childManager.on('start', getTaskCount);

childManager.on('stop', stopTaskCount);

childManager.on('triggerNow', triggerNow);