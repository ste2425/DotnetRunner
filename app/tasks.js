const { exec, spawn } = require('child_process');

/**
 * @returns {Promise<string>} - resolves with the string output from executin the command.
 */
module.exports.stopAllDotnetProcessesAsync = function () {
    return new Promise((res, rej) => {
        exec('taskkill /im dotnet.exe /T /F', function (error, stdout, stderr) {
            if (error)
                rej(error);
            else
                res(stdout);
        });
    });
}

/**
 * @returns {Promise<number>} - resolves with the number of running dotnet processes.
 */
module.exports.countRunningDotnetProcessesAsync = function () {
    return new Promise((res, rej) => {
        exec('TASKLIST /FI "imagename eq dotnet.exe"', function (error, stdout, stderr) {
            if (error) {
                rej(error);
            } else {
                // Hacky mc hackyson
                const notRunning = stdout.trim() === 'INFO: No tasks are running which match the specified criteria.';

                res(notRunning ? 0 : stdout.split('\n').length - 1);
            }
        });
    });
}

/**
 * @returns {Promise<string>}
 */
module.exports.killDotnetProcessAsync = function (pid) {
    return new Promise((res, rej) => {        
        exec(`taskkill /PID ${pid} /T /F`, (error, stdout, stderr) => {
            if (error)
                rej(error);
            else
                res(stdout);
        });
    })
}

/**
 * @param {string} projectPath - Path to the project to run
 * @param {boolean} watch - If set it will execute a watch
 * @param {string} commandArgs - Extra arguments to pass to the run command
 * 
 * @returns {ChildProcess}
 */
module.exports.startDotnetProcess = function (projectPath, watch, commandArgs = '') {
    const args = [];

    if (watch)
        args.push('watch');

    args.push('run');

    args.push(...commandArgs.split(' '));

    return spawn('dotnet', args, {
        cwd: projectPath,
        detached: false,
        shell: true
    });
}