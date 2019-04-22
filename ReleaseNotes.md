## Version **TBC**
---

Release highlights:

* Made the running processes update instantly upon purging them.
* Provided keyboard short cuts for all batch tasks such as starting and stopping all.

---

## Keyboard Shortcuts

All batch tasks now have keyboard shortcuts making them easier to execute.

| Command   | Shortcut         |
| --------- | ---------------- |
| Start All | Ctrl + S         |
| Stop All  | Ctrl + Shift + S |
| Clear All | Ctrl + Shift + C |
| Purge     | Ctrl + Shift + P |


---

## Technical Notes

* Classes for web worker hosts and children have been created. These allow easy message-based communication between the two.
* Dropdown web component implemented.