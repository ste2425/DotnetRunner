
const remote = require('electron').remote;
const { ipcRenderer } = require('electron');
const { showYesNoDialogAsync, showMessageDialogAsync } = require('../../utils/dialog.js');
const { stopAllDotnetProcessesAsync, countRunningDotnetProcessesAsync } = require('../../tasks');
const { getApplications } = require('../../data/applicationStore');
const Runner = require('../../Components/runner/Runner');

const runningProccessesCounter = require('../../workers/runningProcesses/runningProcesses');

runningProccessesCounter
    .start()
    .on(function({ data }) {
        document.querySelector('.runningProcessCount').textContent = data;
    });

let apps = [];

document.addEventListener('DOMContentLoaded', onDomContentLoaded);

ipcRenderer.on('reload-data', onReloadDataIPC);

function onDomContentLoaded() {
    document.querySelector('.purge').addEventListener('click', onPurgeClick);
    document.querySelector('.start-all').addEventListener('click', onStartAll);
    document.querySelector('.terminate-all').addEventListener('click', onTerminateAll);

    loadData();
}

async function onReloadDataIPC() {
    const running = apps.some(x => x.component.state !== Runner.states.stopped);

    if (!running) {
        loadData();

        return showMessageDialogAsync('Configuration reloaded');
    }

    const continueReload = await showYesNoDialogAsync('There are dotnet apps running. In order to reload these will need to be stopped.');

    if (continueReload) {
        onTerminateAll()
            .then(() => {
                loadData();
                
                showMessageDialogAsync('Configuration reloaded');
            })
            .catch(async () => {
                const forceReload = await showYesNoDialogAsync('Failed to stop all processes, reload anyway?');

                if (forceReload) {
                    loadData();
                    showMessageDialogAsync('Configuration reloaded');
                }
            });
    }
}

(() => {
    let closing = false;

    window.addEventListener('beforeunload', (e) => {
        if (!closing && apps.some(x => x.component.state !== Runner.states.stopped)) {
            closing = true;
            e.returnValue = false;

            onTerminateAll()
                .then(() => {
                    remote.getCurrentWindow().close();
                });
        }
    });
})();

async function onPurgeClick() {
    const toKillCount = await countRunningDotnetProcessesAsync();

    if (toKillCount === 0) {
        return;
    }

    const kill = await showYesNoDialogAsync(`There are upto (${toKillCount}) dotnet processes running (Potentially including child processes). Stop them all?`);

    if (kill)
       await stopAllDotnetProcessesAsync();
}

async function onStartAll() {
    apps.forEach(x => x.component.onStart());
}

async function onTerminateAll() {
    const promises = apps.map(x => x.component.onTerminate());

    return Promise.all(promises);
}


function loadData() {
    apps = getApplications();

    const container = document.querySelector('div.runners');  

    while(container.firstChild) {
        container.removeChild(container.firstChild);
    }

    apps.forEach(x => {
        const el = document.createElement('runner-element');

        el.name = x.name;
        el.cwd = x.cwd;

        container.appendChild(el);

        x.component = el;
    });
}