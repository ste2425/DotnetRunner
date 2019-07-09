const { Tray, Menu } = require('electron');
const path = require('path');

let trayInstance;

module.exports.create = function({
        onQuit,
        onClick
}) {
    trayInstance =  new Tray(path.join(__dirname, 'assets/icon.ico'));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Quit', click: onQuit
        }
    ]);

    trayInstance.setContextMenu(contextMenu);

    if (onClick)
        trayInstance.on('click', onClick);
}

module.exports.setTooltip = function(tooltipText) {
    trayInstance.setToolTip(tooltipText);
}