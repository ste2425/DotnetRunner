const fs = require('fs');

module.exports = function WebComponentBaseFactory(_super_) {
    class HTMLBaseElement extends _super_ {
        constructor(...args) {
          const self = super(...args)
          self.parsed = false // guard to make it easy to do certain stuff only once
          self.parentNodes = []
          return self
        }
      
        setup() {
          // collect the parentNodes
          let el = this;
          while (el.parentNode) {
            el = el.parentNode
            this.parentNodes.push(el)
          }
          // check if the parser has already passed the end tag of the component
          // in which case this element, or one of its parents, should have a nextSibling
          // if not (no whitespace at all between tags and no nextElementSiblings either)
          // resort to DOMContentLoaded or load having triggered
          if ([this, ...this.parentNodes].some(el=> el.nextSibling) || document.readyState !== 'loading') {
            this.childrenAvailableCallback();
          } else {
            this.mutationObserver = new MutationObserver(() => {
              if ([this, ...this.parentNodes].some(el=> el.nextSibling) || document.readyState !== 'loading') {
                this.childrenAvailableCallback()
                this.mutationObserver.disconnect()
              }
            });
      
            this.mutationObserver.observe(this, {childList: true});
          }
        }
      }

    class WebComponentBase extends HTMLBaseElement {
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
    };

    return WebComponentBase;
};
  