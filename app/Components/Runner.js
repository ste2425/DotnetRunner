const { killDotnetProcessAsync, startDotnetProcess } = require('../tasks');

module.exports = class RunnerElement extends HTMLElement {
    constructor() {
        super();

        this.state;
        this._runningProccess;

        this.cwd = '';

        this._nameEL = document.createElement('h1');
        this._terminal = document.createElement('div');
        this._state = document.createElement('span');

        this._applyTerminalStyles();

        this.setState(RunnerElement.states.stopped);
    }
    
    _applyTerminalStyles() {
        Object.assign(this._terminal.style, {
            backgroundColor: 'rgb(0, 36, 81)',
            color: '#cccccc',
            whiteSpace: 'pre-line',
            border: '1px solid rgba(128, 128, 128, 0.35)',
            borderRadius: '4px',
            padding: '5px',
            wordBreak: 'break-word',
            maxHeight: '200px',
            overflow: 'auto'
        });
    }

    connectedCallback() {
        const instance = document.createElement('div');
        instance.innerHTML = `   
        <style>
            span.badge {
                padding: 5px;
            }
        </style>
        <link rel="stylesheet" href="../../../node_modules/bootstrap-css-only/css/bootstrap.css">  
            <div class="d-flex justify-content-between align-items-center pb-2">
                <div class="btn-group">
                    <button class="start btn-sm btn btn-success">Start</button>
                    <button class="terminate btn-sm btn btn-danger" disabled>Stop</button>
                    <button class="clear-log btn-sm btn btn-light">Clear Log</button>
                </div>
            </div>`;

        let shadow = this.attachShadow({ mode: 'open'});

        this._state.classList.add('badge');

        instance.querySelector('.btn-group').insertAdjacentElement('beforebegin', this._state);
        shadow.appendChild(this._nameEL);
        shadow.appendChild(instance);
        shadow.appendChild(this._terminal);

        const start = shadow.querySelector('.start');
        const stop = shadow.querySelector('.terminate');

        start.addEventListener('click', (e) => this.onStart());
        stop.addEventListener('click', (e) => this.onTerminate());
        shadow.querySelector('.clear-log').addEventListener('click', () => this.clearData());
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

        if (errorData)
            el.style.color = 'red';
        
        el.textContent = d;

        this._terminal.appendChild(el);

        this._terminal.scrollTop = this._terminal.scrollHeight;
    }

    clearData() {
        while(this._terminal.firstChild) {
            this._terminal.removeChild(this._terminal.firstChild);
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
        this._nameEL.textContent = value;
    }

    setState(state) {
        this._disableStart();
        this._disableStop();

        switch(state) {
            case RunnerElement.states.starting:
                this._state.textContent = 'Starting';
                this._state.className = 'badge badge-info';
                this._enableStop();
            break;
            case RunnerElement.states.running:
                this._state.textContent = 'Running';
                this._state.className = 'badge badge-success';
                this._enableStop();
            break;
            case RunnerElement.states.stopping:
                this._state.textContent = 'Stopping';
                this._state.className = 'badge badge-info';
            break;
            case RunnerElement.states.stopped:
                this._state.textContent = 'Stopped';
                this._state.className = 'badge badge-secondary';
                this._enableStart();
            break;
        }
        this.state = state;
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
