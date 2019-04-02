/**
 * @type {Worker}
 */
let instance;

const handlers = {};

function messageHandler(e) {
    const {channel, data} = e.data;

    (handlers[channel] || [])
        .forEach(x => x(data));
}

module.exports.start = function () {
    instance = new Worker('../../workers/runningProcesses/runningProcessWorker.js');

    instance.addEventListener('message', messageHandler);

    return this;
}

module.exports.stop = function () {
    instance.removeEventListener('message', messageHandler);

    instance.terminate();

    return this;
}

module.exports.on = function (channel, handler) {    
    if (!(channel in handlers))
        handlers[channel] = [];

    handlers[channel].push(handler);

    return this;
}

module.exports.triggerNow = function () {
    console.log('Trigger');
    instance.postMessage('message', { channel: 'triggerNow' });
}