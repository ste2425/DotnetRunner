# Useage

```html
    <modal-element>
        <div slot="modal-header">
            Header content
        </div>
        <div slot="modal-body">
            Body content
        </div>
        <div slot="modal-footer">
            Footer content

            <button data-modal-dismiss>Close</button>
        </div>
    </modal-element>
```

## Options

* display
  * Toggles visiblity - boolean
* modal-size
  * xLarge || large || small
* modal-esc-close
  * attribute allows esc keypress to close modal
* modal-backdrop-close
  * attribute allows backdrop click to close modal

## Events
* modal-opening
  * Before modal opens. Cancelling event prevents modal opening.
* modal-closing
  * BEfore modal closes. Cancelling event prevents modal closing.
