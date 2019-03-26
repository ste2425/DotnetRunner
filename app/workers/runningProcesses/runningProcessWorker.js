const { countRunningDotnetProcessesAsync } = require('../../tasks');


function getTaskCount() {
    countRunningDotnetProcessesAsync()
        .then(count => {
            postMessage(count);
            setTimeout(getTaskCount, 5000);
        });
}

getTaskCount();