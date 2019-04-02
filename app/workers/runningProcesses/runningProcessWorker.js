const { countRunningDotnetProcessesAsync } = require('../../tasks');

let pendingTimeout;

const handlers = {
    triggerNow() {
        console.log('run')
        clearTimeout(pendingTimeout);

        getTaskCount();
    }
}

function getTaskCount() {
    countRunningDotnetProcessesAsync()
        .then(count => {
            postMessage({
                channel: 'data',
                data: count
            });
            pendingTimeout = setTimeout(getTaskCount, 5000);
        });
}

onMessage = (e) => {
    console.log('on message');
    const {channel, data} = e.data;
    
    handlers[channel](data);
};

getTaskCount();