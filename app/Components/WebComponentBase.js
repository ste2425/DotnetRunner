const fs = require('fs');

module.exports = class WebComponentBase extends HTMLElement {
  constructor(...args) {
    super(...args);

    this.parentNodes = [];
  }

  applyStyle(shadow, componentDirectory, fileName) {
      const linkEl = document.createElement('link');

      linkEl.setAttribute("rel", "stylesheet");
      linkEl.setAttribute("type", "text/css");
      linkEl.setAttribute("href", path.join(componentDirectory, fileName));

      shadow.appendChild(linkEl);
  }

  applyHTML(shadow, componentDirectory, fileName) {
      shadow.innerHTML = fs.readFileSync(path.join(componentDirectory, fileName));
  }

  setup() {
    (() => {
      // collect the parentNodes
      let el = this;
      while (el.parentNode) {
        el = el.parentNode
        this.parentNodes.push(el)
      }
    })();

    const hasNextSiblings = () => [this, ...this.parentNodes]
      .some(el=> el.nextSibling);

    // check if the parser has already passed the end tag of the component
    // in which case this element, or one of its parents, should have a nextSibling
    // if not (no whitespace at all between tags and no nextElementSiblings either)
    // resort to DOMContentLoaded or load having triggered
    if (hasNextSiblings() || document.readyState !== 'loading') {
      this.childrenAvailableCallback();
    } else {
      this.mutationObserver = new MutationObserver(() => {
        if (hasNextSiblings() || document.readyState !== 'loading') {
          this.childrenAvailableCallback()
          this.mutationObserver.disconnect()
        }
      });

      this.mutationObserver.observe(this, {childList: true});
    }
  }
}