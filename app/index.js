(() => {
    const states = require('./states');
    const { killDotnetProcessAsync, startDotnetProcess } = require('./tasks');

    class RunnerElement extends HTMLElement {
        constructor() {
            super();

            this.state;
            this._runningProccess;

            this.cwd = '';

            this._nameEL = document.createElement('h1');
            this._terminal = document.createElement('div');
            this._state = document.createElement('span');

            this._applyTerminalStyles();

            this.setState(states.stopped);
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
                <div>
                    <button class="start">Start</button>
                    <button class="terminate">Terminate</button>
                    <button class="clear-log">Clear Log</button>
                </div>`;

            let shadow = this.attachShadow({ mode: 'open'});

            shadow.appendChild(this._nameEL);
            shadow.appendChild(this._state);
            shadow.appendChild(instance);
            shadow.appendChild(this._terminal);

            shadow.querySelector('.start').addEventListener('click', () => this.onStart());
            shadow.querySelector('.terminate').addEventListener('click', () => this.onTerminate());
            shadow.querySelector('.clear-log').addEventListener('click', () => this.clearData());
        }

        onStart() {
            if (this.state === states.running || this.state === states.starting)
                return;

            this.clearData();

            this.setState(states.starting);

            this._runningProccess = startDotnetProcess(this.cwd, true);

            this._runningProccess.on('close', () => {
                this.setState(states.stopped);

                this._runningProccess = undefined;
            });

            this._runningProccess.stdout.on('data', (d) => this.onData(d.toString()));
            this._runningProccess.stderr.on('data', (d) => this.onData(d.toString(), true));
        }

        onData(d, errorData) {
            if (this.state === states.starting)
                this.setState(states.running);

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
            if (!this._runningProccess || this.state === states.stopped || this.state === states.stopping)
                return Promise.resolve();
        
            this.setState(states.stopping);

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
            switch(state) {
                case states.starting:
                    this._state.textContent = 'Starting';
                break;
                case states.running:
                    this._state.textContent = 'Running';
                break;
                case states.stopping:
                    this._state.textContent = 'Stopping';
                break;
                case states.stopped:
                    this._state.textContent = 'Stopped';
                break;
            }
            this.state = state;
        }
    }

    customElements.define('runner-element', RunnerElement);
})();