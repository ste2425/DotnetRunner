
const remote = require('electron').remote;
const { ipcRenderer } = require('electron');
const { showYesNoDialogAsync, showMessageDialogAsync } = require('../../utils/dialog.js');
const { stopAllDotnetProcessesAsync, countRunningDotnetProcessesAsync } = require('../../tasks');
const { getApplications } = require('../../data/applicationStore');
const Runner = require('../../Components/runner/Runner');
const { shell } = require('electron');
const preferencesStore = require('../../data/preferencesStore');

const ipcMessages = require('../../ipcMessages');

const runningProccessesCounter = require('../../workers/runningProcesses/runningProcesses');

runningProccessesCounter
    .start()
    .on('data', function(count) {
        document.querySelector('.runningProcessCount').textContent = count;
    });

let apps = [];

document.addEventListener('DOMContentLoaded', onDomContentLoaded);

ipcRenderer.on(ipcMessages.reloadApplications, onReloadDataIPC);

ipcRenderer.on(ipcMessages.displayReleaseNotes, onDisplayReleaseNotes);

ipcRenderer.on(ipcMessages.displayPreferences, onDisplayPreferences);

ipcRenderer.on(ipcMessages.startAllApplications, onStartAll);

ipcRenderer.on(ipcMessages.stopAllApplications, onTerminateAll);

ipcRenderer.on(ipcMessages.clearAllApplicationLogs, onClearAll);

ipcRenderer.on(ipcMessages.purgeRunningProcesses, onPurgeClick);

function onDomContentLoaded() {
    document.querySelector('.runningProcessCount').addEventListener('click', onPurgeClick);

    document.querySelector('#github').addEventListener('click', () => {
        shell.openExternal('https://github.com/ste2425/DotnetRunner');
    });

    loadData();
}

function onDisplayReleaseNotes() {
    const releaseNotesModal = document.querySelector('releasenotes-modal');

    releaseNotesModal.display();
}

function onDisplayPreferences() {
    const modal = document.querySelector('preferences-modal');

    modal.display();
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
                .finally(() => {
                    process.nextTick(() => remote.getCurrentWindow().close());  
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

    if(!kill)
        return;

    try {
        apps.forEach(x => x.component.onTerminate());
        
        await stopAllDotnetProcessesAsync();
    } catch(e) {
        console.error('Error purging', e);
    } finally {
        runningProccessesCounter.triggerNow();
    }
}

async function onStartAll() {
    const pref = preferencesStore.getPreferences();

    document.querySelector('.batch-run-message').classList.remove('hide');

    try {
        if (pref.waitTimeout === 0)
            apps.forEach(x => x.component.onStart());
        else 
            await apps.reduce((accu, cur) => {
                return accu
                    .then(() => 
                        new Promise((res) => {
                            cur.component.onStart();
                            setTimeout(() => {
                                res();
                            }, pref.waitTimeout * 1000);
                        })
                    );
            }, Promise.resolve());
    } catch(e) {
        throw e;
    } finally {
        ipcRenderer.send(ipcMessages.taskComplete, ipcMessages.startAllApplications);
        document.querySelector('.batch-run-message').classList.add('hide');
    }
}

async function onTerminateAll() {
    document.querySelector('.batch-run-message').classList.remove('hide');    

    try {
        const promises = apps.map(x => x.component.onTerminate());
        await Promise.all(promises);
    } catch(e) {
        throw e;
    } finally {        
        ipcRenderer.send(ipcMessages.taskComplete, ipcMessages.stopAllApplications);
        document.querySelector('.batch-run-message').classList.add('hide');  
    }    
}

function onClearAll() {
    document.querySelector('.batch-run-message').classList.remove('hide');
    apps.forEach(a => a.component.clearData());
    ipcRenderer.send(ipcMessages.taskComplete, ipcMessages.clearAllApplicationLogs);
    document.querySelector('.batch-run-message').classList.add('hide');
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
        el.runCommandArguments = x.commandArgs;

        container.appendChild(el);

        x.component = el;
    });
}