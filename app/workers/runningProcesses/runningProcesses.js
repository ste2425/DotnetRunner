/**
 * @type {Worker}
 */
let instance;

module.exports.start = function () {
    instance = new Worker('../../workers/runningProcesses/runningProcessWorker.js');

    return this;
}

module.exports.stop = function () {
    instance.terminate();

    return this;
}

module.exports.on = function (...args) {
    instance.addEventListener('message', ...args);

    return this;
}

module.exports.off = function (...args) {
    instance.removeEventListener('message', ...args);

    return this;
}