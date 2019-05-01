
const WebComponentBase = require('../WebComponentBase');

module.exports = class PreferencesModal extends WebComponentBase {
    connectedCallback() {       
        /**
         * @type {ShadowRoot}
         */
        let shadow = this.attachShadow({ mode: 'open'});

        this.applyHTML(shadow, __dirname, 'preferencesModal.html');

        shadow.querySelector('.save-btn').addEventListener('click', this._onSaveClick.bind(this));

        shadow.addEventListener('preferences-saved', this._onSaveDone.bind(this));

        this.shadowRoot.querySelector('modal-element')
            .addEventListener('modal-closing', () => {
                
                const node = this.shadowRoot.querySelector('.destination');

                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
            });
    }

    display() {
        const template = this.shadowRoot.querySelector('#preferences-pane-template');
        const clone = document.importNode(template.content, true);

        this.shadowRoot.querySelector('.destination').appendChild(clone);

        const modal = this.shadowRoot.querySelector('modal-element');
        modal.show();
    }

    hide() {
        const modal = this.shadowRoot.querySelector('modal-element');
        modal.hide();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'display' && newValue === 'true')
            this.display();
        else if (name === 'display')
            this.hide();
    }

    _onSaveClick(e) {
        this.shadowRoot.querySelector('.save-btn').setAttribute('disabled', 'disabled');
        this.shadowRoot.querySelector('preferences-pane').savePreferences();
    }

    _onSaveDone() {
        this.hide();
        this.shadowRoot.querySelector('.save-btn').removeAttribute('disabled');
    }
    
    static get observedAttributes() {
        return ['display'];
    } 


    static register() {
        customElements.define('preferences-modal', PreferencesModal);
    }
}