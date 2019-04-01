module.exports = class ValidateableForm extends HTMLFormElement {
    
    connectedCallback() {
        this.noValidate = true;

        this.addEventListener('submit', (event) => {
            if (this.reportValidity() === false) {
              event.preventDefault();
              event.stopPropagation();
            }
            this.classList.add('was-validated'); 
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