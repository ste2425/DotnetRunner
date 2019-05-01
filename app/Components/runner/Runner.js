const { killDotnetProcessAsync, startDotnetProcess } = require('../../tasks');
const WebComponentBase = require('../WebComponentBase');

module.exports = class RunnerElement extends WebComponentBase {
    constructor() {
        super();

        this.state;
        this._runningProccess;

        this.cwd = '';

        this.runCommandArguments = '';

        this._name = '';

        this.setState(RunnerElement.states.stopped);
    }

    connectedCallback() {
        /**
         * @type {ShadowRoot}
         */
        let shadow = this.attachShadow({ mode: 'open'});

        this.applyHTML(shadow, __dirname, 'runner.html');

        this.applyStyle(shadow, __dirname, 'runner.css');

        if (this._name)
            shadow.querySelector('.name').textContent = this._name;

        if (this.state != undefined)
            this.setState(this.state);

        const clearLog = shadow.querySelector('.clear-log');

        clearLog.addEventListener('click', () => this.clearData());

        shadow.querySelector('.action').addEventListener('click', this._onToggle.bind(this));
    }

    _enableAction() {
        if (!this.shadowRoot)
            return;

        this.shadowRoot.querySelector('.action').removeAttribute('disabled');
    }
    
    _disableAction() {
        if (!this.shadowRoot)
            return;

        this.shadowRoot.querySelector('.action').setAttribute('disabled', 'disabled');
    }

    _onToggle() {
        if (this.state !== RunnerElement.states.stopped && this.state !== RunnerElement.states.running)
            return;

        const isRunning = this.state !== RunnerElement.states.stopped;

        if (isRunning) {
            this.onTerminate();
        } else {
            this.onStart();
        }
    }

    onStart() {
        if (this.state === RunnerElement.states.running || this.state === RunnerElement.states.starting)
            return;

        this.clearData();

        this.setState(RunnerElement.states.starting);

        this._runningProccess = startDotnetProcess(this.cwd, true, this.runCommandArguments);

        this._runningProccess.on('close', () => {
            this.setState(RunnerElement.states.stopped);

            this._runningProccess = undefined;
        });

        this._runningProccess.stdout.on('data', (d) => this.onData(d.toString()));
        this._runningProccess.stderr.on('data', (d) => this.onData(d.toString(), true));
    }

    onData(d, errorData) {
        if (this.state === RunnerElement.states.starting)
            this.setState(RunnerElement.states.running);

        const el = document.createElement('span');
        const terminal = this.shadowRoot.querySelector('.terminal');

        el.classList.add('log-item');

        if (errorData)
            el.classList.add('error');
        
        el.textContent = d;

        terminal.appendChild(el);

        terminal.scrollTop = terminal.scrollHeight;
    }

    clearData() {
        const terminal = this.shadowRoot.querySelector('.terminal');

        while(terminal.firstChild) {
            terminal.removeChild(terminal.firstChild);
        }
    }

    onTerminate() {      
        if (!this._runningProccess || this.state === RunnerElement.states.stopped || this.state === RunnerElement.states.stopping)
            return Promise.resolve();
    
        this.setState(RunnerElement.states.stopping);

        return killDotnetProcessAsync(this._runningProccess.pid)
            .then((d) => {
                console.log('KILLED', d);
                return d;
            });
    }

    set name(value) {
        if (this.shadowRoot)
            this.shadowRoot.querySelector('.name').textContent = value;

        this._name = value;
    }

    setState(state) {
        this._disableAction();

        this.state = state;
        
        if (!this.shadowRoot)
            return;

        const stateEl = this.shadowRoot.querySelector('.state');
        const actionBtn = this.shadowRoot.querySelector('.action');

        switch(state) {
            case RunnerElement.states.starting:
                stateEl.textContent = 'Starting';
                stateEl.className = 'state badge badge-info';
                actionBtn.textContent = 'Stop';
            break;
            case RunnerElement.states.running:
                stateEl.textContent = 'Running';
                stateEl.className = 'state badge badge-success';
                actionBtn.textContent = 'Stop';
                this._enableAction();
            break;
            case RunnerElement.states.stopping:
                stateEl.textContent = 'Stopping';
                stateEl.className = 'state badge badge-info';
                actionBtn.textContent = 'Start';
            break;
            case RunnerElement.states.stopped:
                stateEl.textContent = 'Stopped';
                stateEl.className = 'state badge badge-secondary';
                this._enableAction();
                actionBtn.textContent = 'Start';
            break;
        }
    }

    static register() {
        customElements.define('runner-element', RunnerElement);
    }

    static get states() {
        return {            
            stopped: 0,
            starting: 1,
            running: 2,
            stopping: 3
        };
    }
}
