const { killDotnetProcessAsync, startDotnetProcess } = require('../../tasks');
const WebComponentBaseFactory = require('../WebComponentBaseFactory');
const Terminal = require('xterm').Terminal;
const pty = require('node-pty');
//const fit = require('xterm/lib/addons/fit/fit');

//Terminal.apply(fit);

module.exports = class RunnerElement extends WebComponentBaseFactory(HTMLElement) {
    constructor() {
        super();

        this.state;
        this._runningProccess;

        this.cwd = '';

        this._name = '';

        this._terminalProcess;
        this._ptyProcess;

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

        const start = shadow.querySelector('.start');
        const stop = shadow.querySelector('.terminate');
        const clearLog = shadow.querySelector('.clear-log');

        start.addEventListener('click', (e) => this.onStart());
        stop.addEventListener('click', (e) => this.onTerminate());
        clearLog.addEventListener('click', () => this.clearData());

        this._terminalProcess = new Terminal();
        this._ptyProcess = pty.spawn('cmd.exe', [], {
            name: 'xterm-color',
            cwd: process.cwd(),
            env: process.env
          });

        this._terminalProcess.open(shadow.querySelector('.terminal'));
        this._terminalProcess.on('data', (d) => 
            this._ptyProcess.write(d));
        this._ptyProcess.on('data', (d) => 
            this._terminalProcess.write(d));        
    }

    _enableStart() {
        if (!this.shadowRoot)
            return;

        this.shadowRoot.querySelector('.start').removeAttribute('disabled');
    }
    
    _disableStart() {
        if (!this.shadowRoot)
            return;

        this.shadowRoot.querySelector('.start').setAttribute('disabled', 'disabled');
    }

    _enableStop() {
        if (!this.shadowRoot)
            return;

        this.shadowRoot.querySelector('.terminate').removeAttribute('disabled');
    }
    
    _disableStop() {
        if (!this.shadowRoot)
            return;

        this.shadowRoot.querySelector('.terminate').setAttribute('disabled', 'disabled');
    }

    onStart() {

        this._ptyProcess.write(`dotnet run --project ${this.cwd}\n\r`);

        return;
        if (this.state === RunnerElement.states.running || this.state === RunnerElement.states.starting)
            return;

        this.clearData();

        this.setState(RunnerElement.states.starting);

        this._runningProccess = startDotnetProcess(this.cwd, true);

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
       // const terminal = this.shadowRoot.querySelector('.terminal');

        el.classList.add('log-item');

        if (errorData)
            el.classList.add('error');
        
        el.textContent = d;

        //terminal.appendChild(el);

        //terminal.scrollTop = terminal.scrollHeight;
    }

    clearData() {
     //  const terminal = this.shadowRoot.querySelector('.terminal');

       // while(terminal.firstChild) {
       //     terminal.removeChild(terminal.firstChild);
       // }
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
        this._disableStart();
        this._disableStop();

        this.state = state;
        
        if (!this.shadowRoot)
            return;

        const stateEl = this.shadowRoot.querySelector('.state');

        switch(state) {
            case RunnerElement.states.starting:
                stateEl.textContent = 'Starting';
                stateEl.className = 'state badge badge-info';
                this._enableStop();
            break;
            case RunnerElement.states.running:
                stateEl.textContent = 'Running';
                stateEl.className = 'state badge badge-success';
                this._enableStop();
            break;
            case RunnerElement.states.stopping:
                stateEl.textContent = 'Stopping';
                stateEl.className = 'state badge badge-info';
            break;
            case RunnerElement.states.stopped:
                stateEl.textContent = 'Stopped';
                stateEl.className = 'state badge badge-secondary';
                this._enableStart();
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
