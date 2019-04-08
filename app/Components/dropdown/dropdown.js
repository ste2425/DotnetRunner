const { showOpenDialog } = require('../../utils/dialog');
const fs = require('fs');
const webComponentBaseFactory = require('../WebComponentBaseFactory');

/**
 * Represents a Dropdown control.
 * @extends {HTMLElement}
 */
module.exports = class Dropdown extends webComponentBaseFactory(HTMLElement) {
    
    static get observedAttributes() {
        return ['active', 'label'];
    }

    _display() {
        clearTimeout(this._hideTimeout);
        this.setAttribute('active', true);
    }

    _hide() {
        clearTimeout(this._hideTimeout);
        this._hideTimeout = setTimeout(() => {
            this.setAttribute('active', false);
        });
    }

    connectedCallback() {
        /**
         * @type {ShadowRoot}
         */
        let shadow = this.attachShadow({ mode: 'open'});

        this.applyHTML(shadow, __dirname, 'dropdown.html');

        this.applyStyle(shadow, __dirname, 'dropdown.css');

        super.setup();   

        /**
         * @private
         */
        this._hideTimeout;
        
        shadow.querySelector('.trigger').addEventListener('click', () => {
            this._display();
        });

        shadow.querySelector('.trigger').addEventListener('blur', () => {
            this._hide();
        });


        shadow.querySelector('.dropdown-menu').addEventListener('focusin', (e) => {
            this._display();
        });

        shadow.querySelector('.dropdown-menu').addEventListener('focusout', (e) => {
            this._hide();
        });

        shadow.querySelector('.dropdown-menu').addEventListener('click', (e) => {
            this._hide();
        });        
        
        this.label = this.getAttribute('label');
        this.active = this._parseActiveValue(this.getAttribute('active'));
    }

    _parseActiveValue(val) {
        return (!!val && val.toString().toLowerCase() === 'true');
    }

    set label(value) {
        if (!this.shadowRoot)
            return;

        this.shadowRoot.querySelector('.trigger').textContent = value;
    }

    set active(value) {
        if (!this.shadowRoot)
            return;

        clearTimeout(this._hideTimeout);

        const elem = this.shadowRoot.querySelector('.dropdown-menu');

        if (value) {
            elem.classList.add('visible');
            this.shadowRoot.querySelector('.dropdown').classList.add('show');
        } else {
            elem.classList.remove('visible');
            this.shadowRoot.querySelector('.dropdown').classList.remove('show');
        }
    }

    get active() {
        return this.shadowRoot.querySelector('.dropdown-menu').classList.contains('visible');
    }

    childrenAvailableCallback() {
        this.shadowRoot.querySelector('slot').assignedElements()
            .forEach(x => x.classList.add('dropdown-item'));
    }

    static register() {
        customElements.define('drop-down', Dropdown);
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        if (attr === 'label')
            this.label = newVal;
        else if (attr === 'active')
            this.active = this._parseActiveValue(newVal);
    }
}