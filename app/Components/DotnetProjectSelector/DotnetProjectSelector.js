const { showOpenDialog } = require('../../utils/dialog');
const fs = require('fs');
const WebComponentBase = require('../WebComponentBase');

/**
 * Represents a Dotnet project selector control.
 */
module.exports = class DotnetProjectSelector extends WebComponentBase {
    
    connectedCallback() {
        /* 
            Cannot create a shadow root as forms will ignore the input within
            For validation.
        */
        const container = document.createElement('span');
        
        this.applyHTML(container, __dirname, 'DotnetProjectSelector.html');

        this.appendChild(container);

        const input = this.querySelector('input'),
            button = this.querySelector('.path-selector');

        input.name = this.getAttribute('name');

        button.addEventListener('click', this._cwdSelect.bind(this));
        input.addEventListener('input', this.validate.bind(this));
    }

    set value(val) {
        const input = this.querySelector('input');

        input.value = val;
        
        const e = new Event('input', {
            bubbles: true,
            cancelable: true
        });

        input.dispatchEvent(e);
    }

    get value() {
        return this.querySelector('input').value;
    }

    _cwdSelect() {
        const selected = showOpenDialog();

        this.querySelector('input').focus();

        if (selected) {
            const input = this.querySelector('input');

            input.value = selected;
            
            const e = new Event('input', {
                bubbles: true,
                cancelable: true
            });

            input.dispatchEvent(e);
        }
    }
    
    validate(e) {
        const setCustomValidity = e.target.setCustomValidity.bind(e.target),
            value = e.target.value;

        setCustomValidity('');

        if (!fs.existsSync(value))
            return setCustomValidity('Path doesnt exist.');

        if(value.endsWith('.csproj'))
            return setCustomValidity('Do not select a .csproj file directly. Select its containing folder.');

        const filesInFolder = fs.readdirSync(value);

        if (!filesInFolder.some(x => x.endsWith('.csproj')))
            setCustomValidity('Selected path must point to a .csproj');
    }

    static register() {
        customElements.define('dotnet-project-selector', DotnetProjectSelector);
    }
}