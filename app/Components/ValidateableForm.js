module.exports = class ValidateableForm extends HTMLFormElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.noValidate = true;

        this.addEventListener('submit', (event) => {
            if (this.reportValidity() === false) {
              event.preventDefault();
              event.stopPropagation();
            }
            this.classList.add('was-validated'); 
        });

        this.addEventListener('invalid', (e) => {
            console.log(e);
        });
    }

    reset() {
        this.classList.remove('was-validated');
        super.reset();
    }

    static register() {
        customElements.define('form-validateable', ValidateableForm, {
            extends: 'form'
        });
    }
}