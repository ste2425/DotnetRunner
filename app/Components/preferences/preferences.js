
const WebComponentBase = require('../WebComponentBase');

const preferencesStore = require('../../data/preferencesStore');

const { app } = require('electron').remote;

module.exports = class Preferences extends WebComponentBase {
    connectedCallback() {       
        /**
         * @type {ShadowRoot}
         */
        let shadow = this.attachShadow({ mode: 'open'});

        this.applyHTML(shadow, __dirname, 'preferences.html');

        const preferences = preferencesStore.getPreferences();
        
        shadow.querySelector('#runAtStartup').checked = preferences.runAtStartup;
        shadow.querySelector('#waitTimeout').value = preferences.waitTimeout;
        shadow.querySelector('#autoOpenReleasenotes').checked = preferences.autoOpenReleasenotes;
    }

    savePreferences() {
        const formEl = this.shadowRoot.querySelector('form');

        this._onSubmit(formEl);
    }

    _emitSaved() {
        const e = new CustomEvent('preferences-saved', {
            bubbles: true,
            cancelable: true
        });

        this.dispatchEvent(e);
    }

    /**
     * 
     * @param {Event} e 
     */
    _onSubmit(form) {
        const data = new FormData(form);
        const runAtStartup = !!data.get('runAtStartup');
        const waitTimeout = data.get('waitTimeout');
        const autoOpenReleasenotes = !!data.get('autoOpenReleasenotes');

        const preferences = preferencesStore.getPreferences();

        Object.assign(preferences, {
            runAtStartup,
            waitTimeout: waitTimeout ? parseInt(waitTimeout) : undefined,
            autoOpenReleasenotes
        });

        preferencesStore.setPreferences(preferences);

        this._manageStartUp(runAtStartup);

        this._emitSaved();
    }

    _manageStartUp(runatStartup) {
        app.setLoginItemSettings({
            openAtLogin: runatStartup
        });
    }

    static register() {
        customElements.define('preferences-pane', Preferences);
    }
}