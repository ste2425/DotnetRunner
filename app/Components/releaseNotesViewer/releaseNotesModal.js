
const WebComponentBaseFactory = require('../WebComponentBaseFactory');

module.exports = class ReleaseNotesModal extends WebComponentBaseFactory(HTMLElement) {
    connectedCallback() {        
        /**
         * @type {ShadowRoot}
         */
        let shadow = this.attachShadow({ mode: 'open'});

        this.applyHTML(shadow, __dirname, 'releaseNotesModal.html');
    }

    display() {
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
    
    static get observedAttributes() {
        return ['display'];
    } 

    static register() {
        customElements.define('releasenotes-modal', ReleaseNotesModal);
    }
}