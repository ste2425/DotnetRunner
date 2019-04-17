class WebWorkerBase {
    constructor() {
        /**
         * @type {Object<string, Array<Function>>}
         */
        this._handlers = {};
    }

    /**
     * [INTERNAL] Handler to be registered with the Web Worker. Deals with routing messages to channels.
     * @param {MessageEvent} e 
     * @private
     */
    onWorkerMessage(e) {
        const { channel, data } = e.data;

        (this._handlers[channel] || [])
            .forEach(h => h(data));
    }

    buildPayload(channel, data) {
        return {
            channel,
            data
        };
    }

    /**
     * Registers a handler to the specified channel for Web Worker communication
     * @param {string} channel 
     * @param {Function} handler 
     */
    on(channel, handler) {
        if (!(channel in this._handlers))
            this._handlers[channel] = [];

        this._handlers[channel].push(handler);

        return this;
    }

    /**
     * Will remove a handler from the specified channel. If no handler provided all will be removed for that channel
     * @param {string} channel 
     * @param {Function} [handler] 
     */
    off(channel, handler) {
        if (!(channel in this._handlers))
            return;

        if (!handler)
            delete this._handlers[channel];
        else (this._handlers[channel].indexOf(handler) > -1)
            this._handlers[channel] = this._handlers[channel].filter(h => h !== handler);

        return this;
    }

    /**
     * Will clear all handlers for all channels.
     */
    clearAll() {
        for (channel in this._handlers) {
            this.off(channel);
        }
    }
}

class WebWorkerHost extends WebWorkerBase {
    constructor(url, options) {
        super();

        this._instance = new Worker(url, options);

        this._instance.addEventListener('message', this.onWorkerMessage.bind(this));
    }

    /**
     * Emits a message to the provided channel witht he provided data
     * @param {string} channel 
     * @param {any} data 
     */
    emit(channel, data) {
        const messagePayload = this.buildPayload(channel, data);

        this._instance.postMessage(messagePayload);
    }

    terminate() {
        this._instance.terminate();
    }
}

class WebWorkerChild extends WebWorkerBase {
    constructor() {
        super();

        onmessage = this.onWorkerMessage.bind(this);
    }

    /**
     * Emits a message to the provided channel witht he provided data
     * @param {string} channel 
     * @param {any} data 
     */
    emit(channel, data) {
        const messagePayload = this.buildPayload(channel, data);

        postMessage(messagePayload);
    }
}

module.exports.WebWorkerBase = WebWorkerBase;
module.exports.WebWorkerHost = WebWorkerHost;
module.exports.WebWorkerChild = WebWorkerChild;