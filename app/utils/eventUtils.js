module.exports.addDeletegateEventListener = function (element, forSelector, type, listener, ...extra) {
    return element.addEventListener(type, (e) => {
        if (e.target && e.target.matches(forSelector))
            listener(e);
    }, ...extra);
}