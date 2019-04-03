const { ipcRenderer } = require("electron");

ipcRenderer.on('checking-for-update', () => {
    document.querySelector('.message').textContent = 'Checking for update';
}); 

ipcRenderer.on('update-available', () => {
    document.querySelector('.message').textContent = 'Update available';
    document.querySelector('.progress').classList.remove('hidden');
}); 

ipcRenderer.on('update-not-available', () => {
    document.querySelector('.message').textContent = 'Update not available';
}); 

ipcRenderer.on('download-progress', (e, {percent}) => {
    document.querySelector('.progress-bar').style.width = `${percent}%`;
}); 

ipcRenderer.on('update-downloaded', () => {
    document.querySelector('.message').textContent = 'Update downloaded';
    document.querySelector('.progress-bar').style.width = '100%';
}); 

ipcRenderer.on('error', (e, error) => {
    document.querySelector('.message').textContent = `Error checking for updates: ${error}. Starting...`;
    document.querySelector('.progress-bar').classList.add('hidden');
}); 