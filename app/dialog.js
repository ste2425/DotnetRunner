const { dialog } = (require('electron').remote || require('electron'));
const { BrowserWindow } = (require('electron').remote || require('electron'));

/**
 * @param {string} message
 * @returns {Promise<boolean>} - promise resolving to true or false depending on yes or no being selected.
 */
module.exports.showYesNoDialogAsync = async function (message) {
    return new Promise((res) => {
        const opts = {
            buttons: ["Yes", "No"],
            message
        };

        const focuesWindow = BrowserWindow.getFocusedWindow();

        dialog.showMessageBox(focuesWindow, opts, (resp) => {
            if (resp === 0)
                res(true);
            else
                res(false);
        });
    });
}

/**
 * @param {string} message
 * @returns {Promise<void>} - Promise that will resolve when message closed.
 */
module.exports.showMessageDialogAsync = function (message) {
    const opts = {
        message
    };

    const focuesWindow = BrowserWindow.getFocusedWindow();

    return new Promise((res) => { 
        dialog.showMessageBox(focuesWindow, opts, () => res());
    });
}

/**
 * @returns {string} - Selected path
 */
module.exports.showOpenDialog = function () {
    return dialog.showOpenDialog({
        properties: ['openDirectory']
    });
}