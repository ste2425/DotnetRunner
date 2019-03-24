const { addDeletegateEventListener } = require('./eventUtils');
const applicationStore = require('./applicationStore');
const fs = require('fs');
const { showOpenDialog, showMessageDialogAsync } = require('./dialog');

document.addEventListener('DOMContentLoaded', onLoad);

function onLoad() {
    document.querySelector('.add-btn').addEventListener('click', onAddBtnClick);
    document.querySelector('#pathSelector').addEventListener('click', onPathSelectorClick)
    addDeletegateEventListener(document, '.delete-btn', 'click', onDeleteBtnClick);

    const apps = applicationStore.getApplications();

    const template = document.querySelector('#appTemplate');

    apps.forEach(({ name, cwd }, i) => {
        const clone = document.importNode(template.content, true);

        clone.querySelector('.name').value = name;
        clone.querySelector('.cwd').value = cwd;
        clone.querySelector("[type=hidden]").value = i;

        document.querySelector('.existing').appendChild(clone);
    });
}

function onDeleteBtnClick(e) {
    const container = e.target.parentNode;

    const index = container.querySelector("[type=hidden]").value;

    const apps = applicationStore.getApplications();

    apps.splice(index, 1);

    applicationStore.setApplications(apps);

    reload();
}

function onAddBtnClick(e) {
    const container = e.target.parentNode;
    const name = container.querySelector('#appName');
    const cwd = container.querySelector('#appCWD');

    if (!name.value || !cwd.value)
        return showMessageDialogAsync('Application name and Path to .csproj are required');

    if (!_appCWDValid(cwd.value))
        return showMessageDialogAsync('Application CWD must contain a .csproj');

    const items = applicationStore.getApplications();

    items.push({
        name: name.value,
        cwd: cwd.value
    });

    applicationStore.setApplications(items);

    name.value = cwd.value = '';

    reload();
}

function reload() {  
    const container = document.querySelector('.existing');

    while(container.firstChild) {
        container.removeChild(container.firstChild);
    }

    onLoad();
}

function onPathSelectorClick(e) {
    const inputSelector = e.target.dataset.pathInput;
    const input = document.querySelector(inputSelector);

    var path = showOpenDialog();

    input.value = path;
}

function _appCWDValid(cwd) {
    try {
        if (!fs.existsSync(cwd))
            return false;

        const files= fs.readdirSync(cwd);

        return files.some(x => x.endsWith('.csproj'));

    } catch(e) {
        console.error('Error validating CWD');
        console.error(e);

        return false;
    }
}