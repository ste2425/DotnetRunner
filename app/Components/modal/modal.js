const WebComponentBaseFactory = require('../WebComponentBaseFactory');

/**
 * @extends HTMLElement
 */
module.exports = class ModalElement extends WebComponentBaseFactory(HTMLElement) {
    constructor() {
        super();

        this._open = false;
    }

    connectedCallback() {
        /**
         * @type {ShadowRoot}
         */
        let shadow = this.attachShadow({ mode: 'open'});

        this.applyHTML(shadow, __dirname, 'modal.html');

        this.applyStyle(shadow, __dirname, 'modal.css');

        const dialog = shadow.querySelector('.modal-dialog'),
            modal = shadow.querySelector('.modal');

        modal.addEventListener('click', this._onBackdropClick.bind(this));

        document.addEventListener('keydown', this._onEsc.bind(this));

        dialog.addEventListener('click', this._onDialogClick.bind(this));

        if (this.getAttribute('display') === 'true')
            this._show();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'display' && newValue === 'true')
            this._show();
        else if (name === 'display')
            this._hide();
    }

    show() {
        this.setAttribute('display', 'true');
    }

    hide() {
        this.setAttribute('display', 'false');
    }

    _onEsc(e) {
        const escToClose = this.hasAttribute('modal-esc-close');

        if (escToClose && e.key === 'Escape' && this._open)
            this.hide();
    }

    _onBackdropClick(e) {
        const allowClose = this.hasAttribute('modal-backdrop-close');

        if (allowClose)
            this.hide();
    }

    _onDialogClick(e) {
        e.stopPropagation();

        if (e.target.matches("[data-dismiss]"))    
            this.hide();
    }

    _applySize() {
        const size = this.getAttribute('modal-size'),
            elem = this.shadowRoot.querySelector('.modal-dialog');

        elem.classList.remove('modal-lg');
        elem.classList.remove('modal-sm');

        switch(size) {
            case 'large':
                elem.classList.add('modal-lg');
            break;
            case 'small':
                elem.classList.add('modal-sm');
            break;
        }
    }

    _show() {
        this._open = true;

        const headerTemaplate = this.shadowRoot.querySelector('#header'),
            bodyTemaplate = this.shadowRoot.querySelector('#body'),
            footerTemaplate = this.shadowRoot.querySelector('#footer');

        this.closest('body')
            .style.overflow = 'hidden';

        this._applySize();

        function renderTemplate(destination, template) {
            var clone = document.importNode(template.content, true);

            destination.appendChild(clone);
        }
        
        renderTemplate(this.shadowRoot.querySelector('.modal-header'), headerTemaplate);
        renderTemplate(this.shadowRoot.querySelector('.modal-body'), bodyTemaplate);
        renderTemplate(this.shadowRoot.querySelector('.modal-footer'), footerTemaplate);

        Array.from(this.shadowRoot.querySelectorAll('.modal, .modal-backdrop'))
            .forEach(x => x.classList.add('show'));
    }

    _hide() {
        this._open = false;

        const modalContent = this.shadowRoot.querySelector('.modal-body');

        this.closest('body').removeAttribute('style');

        while(modalContent.firstChild) {
            modalContent.removeChild(modalContent.firstChild);
        }

        Array.from(this.shadowRoot.querySelectorAll('.modal, .modal-backdrop'))
            .forEach(x => x.classList.remove('show'));
    }

    static register() {
        customElements.define('modal-element', ModalElement);
    }
    
    static get observedAttributes() {
        return ['display'];
    }    
}
