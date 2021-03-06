const { startDotnetProcess, startCleanProcess } = require('../../tasks');
const Terminal = require('xterm').Terminal;
const fit = require('xterm/lib/addons/fit/fit');
const fullScreen = require('xterm/lib/addons/fullscreen/fullscreen');
const debounce = require('../../utils/debounce');
const { clipboard } = require('electron');

Terminal.applyAddon(fit);
Terminal.applyAddon(fullScreen);

const WebComponentBase = require('../WebComponentBase');

module.exports = class RunnerElement extends WebComponentBase {
    constructor() {
        super();

        this.state;
        this._runningProccess;

        this.cwd = '';

        this.runCommandArguments = '';

        this._name = '';

        this._terminalProcess;

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
        const clean = shadow.querySelector('.clean');
        const full = shadow.querySelector('.full');
        const terminal = shadow.querySelector('.terminals');
        const copyLogBtn = shadow.querySelectorAll('.copy-log');
        const closeFullScreen = shadow.querySelector('.close-fullscreen');

        clearLog.addEventListener('click', () => this.clearData());
        clean.addEventListener('click', () => this.clean());
        copyLogBtn.forEach(x => x.addEventListener('click', () => this.exportLog()));

        closeFullScreen.addEventListener('click', (e) => {
            terminal.classList.remove('full-screen');
            this._terminalProcess.fit();
        });

        full.addEventListener('click', () => {
            terminal.classList.add('full-screen');

            this.resize();
        });

        this._terminalProcess = new Terminal();
        this._terminalProcess.setOption('disableStdin', true);
        this._terminalProcess.setOption('fontFamily', "Consolas, 'Courier New', monospace");

        this._terminalProcess.open(shadow.querySelector('.terminals'));    

        shadow.querySelector('.action').addEventListener('click', this._onToggle.bind(this));

        // Terminal wont fit itself on resize.
        window.addEventListener('resize', debounce(this.resize.bind(this), {
            delay: 100,
            executeOnFirstRun: true
        }));

        terminal.addEventListener('contextmenu', () => {
            const selection = this._terminalProcess.getSelection();

            if (selection)
                clipboard.writeText(selection.trim());

            this._terminalProcess.clearSelection();
        });

        this.resize();
    }

    resize() {
        this._terminalProcess.fit();

        if (this._runningProccess)
            this._runningProccess.resize(this._terminalProcess.cols, this._terminalProcess.rows);
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

    _enableClean() {
        if (!this.shadowRoot)
            return;

        this.shadowRoot.querySelector('.clean').removeAttribute('disabled');
    }
    
    _disableClean() {
        if (!this.shadowRoot)
            return;

        this.shadowRoot.querySelector('.clean').setAttribute('disabled', 'disabled');
    }

    onStart() {
        if (this.state === RunnerElement.states.running || this.state === RunnerElement.states.starting)
            return;

        this.clearData();

        this.setState(RunnerElement.states.starting);

        this._terminalProcess.writeln("Starting...");

        this._runningProccess = startDotnetProcess(this.cwd, true, this.runCommandArguments, this._terminalProcess.cols, this._terminalProcess.rows);

        this._runningProccess.on('exit', () => {
            this.setState(RunnerElement.states.stopped);

            this._runningProccess = undefined;
        });

        this._runningProccess.once('data', () => this.setState(RunnerElement.states.running));

        this._runningProccess.on('data', (d) => {
            this._terminalProcess.write(d);
        });
        
        this._emitEvent('starting');
    }

    clean() {
        if (this.state === RunnerElement.states.running || this.state === RunnerElement.states.starting)
            return;

        this._runningProccess = startCleanProcess(this.cwd);

        this._runningProccess.once('exit', () => {
            this.setState(RunnerElement.states.stopped);

            this._runningProccess.kill();

            this._runningProccess = undefined;
        });

        this._runningProccess.on('data', (d) => {
            this.setState(RunnerElement.states.running);
            this._terminalProcess.write(d);
        });
    }

    clearData() {
        this._terminalProcess.clear();
    }

    onTerminate() {      
        if (!this._runningProccess || this.state === RunnerElement.states.stopped || this.state === RunnerElement.states.stopping)
            return;
    
        this.setState(RunnerElement.states.stopping);

        this._runningProccess.kill();

        this._emitEvent('stopped');
    }

    exportLog() {
        if (!this._terminalProcess)
            return;

        this._terminalProcess.selectAll();
        const log = this._terminalProcess.getSelection();
        this._terminalProcess.clearSelection();

        if (log)
            clipboard.writeText(log.trim());
    }

    set name(value) {
        if (this.shadowRoot)
            this.shadowRoot.querySelector('.name').textContent = value;

        this._name = value;
    }

    setState(state) {
        this._disableAction();
        this._disableClean();

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
                this._emitEvent('state-change', {
                    state: RunnerElement.states.starting
                });
            break;
            case RunnerElement.states.running:
                stateEl.textContent = 'Running';
                stateEl.className = 'state badge badge-success';
                actionBtn.textContent = 'Stop';
                this._enableAction();
                this._emitEvent('state-change', {
                    state: RunnerElement.states.running
                });
            break;
            case RunnerElement.states.stopping:
                stateEl.textContent = 'Stopping';
                stateEl.className = 'state badge badge-info';
                actionBtn.textContent = 'Start';
                this._emitEvent('state-change', {
                    state: RunnerElement.states.stopping
                });
            break;
            case RunnerElement.states.stopped:
                stateEl.textContent = 'Stopped';
                stateEl.className = 'state badge badge-secondary';
                this._enableAction();
                this._enableClean();
                actionBtn.textContent = 'Start';
                this._emitEvent('state-change', {
                    state: RunnerElement.states.stopped
                });
            break;
        }
    }

    _emitEvent(key, data) {
        const e = new CustomEvent(key, {
            detail: data,
            bubbles: true
        });

        this.dispatchEvent(e);
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
