const fs = require('fs');

module.exports = function WebComponentBaseFactory(_super_) {
    return class WebComponentBase extends _super_ {
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
};