const WebComponentBase = require('../WebComponentBase');

/**
 * Represents a Dropdown control.
 */
module.exports = class Dropdown extends WebComponentBase {
    
    static get observedAttributes() {
        return ['active', 'label'];
    }

    _display() {
        clearTimeout(this._hideTimeout);
        this.setAttribute('active', true);
    }

    _hide() {
        /*
            Wrap in a timeout because of events.
            Otherwise when focusing on child the blur from trigger would close.
        */
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

        const trigger = shadow.querySelector('.trigger'),
            dropDownMenu = shadow.querySelector('.dropdown-menu');
        
        trigger.addEventListener('click', () => {
            this._display();
        });

        trigger.addEventListener('blur', () => {
            this._hide();
        });

        dropDownMenu.addEventListener('focusin', (e) => {
            this._display();
        });

        dropDownMenu.addEventListener('focusout', (e) => {
            this._hide();
        });

        dropDownMenu.addEventListener('click', (e) => {
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

    dropdownHasSpace(elem) {
        var bounding = elem.getBoundingClientRect();
        // TODO: Check for vertical space.
        // bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        return (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    set active(value) {
        if (!this.shadowRoot)
            return;

        clearTimeout(this._hideTimeout);

        const elem = this.shadowRoot.querySelector('.dropdown-menu');

        if (value) {
            elem.classList.add('visible');
            if (!this.dropdownHasSpace(elem))
                elem.classList.add('right');

            this.shadowRoot.querySelector('.dropdown').classList.add('show');

            this.classList.add('open');
        } else {
            elem.classList.remove('visible');
            elem.classList.remove('right');
            this.shadowRoot.querySelector('.dropdown').classList.remove('show');

            this.classList.remove('open');
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