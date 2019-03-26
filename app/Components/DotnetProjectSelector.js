const { showOpenDialog } = require('../utils/dialog');
const fs = require('fs');

module.exports = class DotnetProjectSelector extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const input = document.createElement('input'),
            button = document.createElement('button');

        input.required= true;
        input.type = 'string';
        input.name = this.getAttribute('name');
        input.classList.add('form-control');

        button.textContent = 'Select path.';
        button.type = 'button';
        button.classList.add('btn');
        button.classList.add('btn-outline-secondary');

        button.addEventListener('click', this._cwdSelect.bind(this));
        input.addEventListener('input', this.validate.bind(this));

        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('input-group-append');

        buttonGroup.appendChild(button);

        const itemGroup = document.createElement('div');
        itemGroup.classList.add('input-group');

        itemGroup.appendChild(input);
        itemGroup.appendChild(buttonGroup);

        this.appendChild(itemGroup);
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