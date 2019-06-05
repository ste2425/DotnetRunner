module.exports = function (fn, { delay = 100, executeOnFirstRun = false }) {
    let timeout,
        executed;

    return function () {
        if (!executed && executeOnFirstRun) {
            executed = true;
            fn();
        }

        clearTimeout(timeout);
        timeout = setTimeout(fn, delay);
    }
}