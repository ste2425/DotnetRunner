const { WebWorkerHost } = require('../workerManagers');

const hostManager = new WebWorkerHost('../../workers/runningProcesses/runningProcessWorker.js');

module.exports.start = function () {
    hostManager.emit('start');

    return this;
}

module.exports.stop = function () {
    hostManager.emit('stop');
    
    hostManager.terminate();
    return this;
}

module.exports.on = function (...args) {    
    hostManager.on(...args)

    return this;
}

module.exports.triggerNow = function () {
    hostManager.emit('triggerNow');

    return this;
}