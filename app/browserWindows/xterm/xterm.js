var os = require('os');
var pty = require('node-pty');
var Terminal = require('xterm').Terminal;
const fit = require('xterm/lib/addons/fit/fit');

Terminal.apply(fit);

// Initialize node-pty with an appropriate shell
document.addEventListener('DOMContentLoaded', () => {
  const shell = process.env[os.platform() === 'win32' ? 'SHELL' : 'SHELL'];
  console.log(shell)
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cwd: process.cwd(),
    env: process.env
  });

  // Initialize xterm.js and attach it to the DOM
  const xterm = new Terminal();
  //xterm.setOption('disableStdin', true);
  xterm.open(document.getElementById('xterm'));

  // Setup communication between xterm.js and node-pty
  xterm.on('data', (data) => {
    ptyProcess.write(data);
  });
  ptyProcess.on('data', function (data) {
    xterm.write(data);
  });
  

  document.querySelector('#test')
    .addEventListener('click', () => {
      ptyProcess.write('dotnet build c:/code/cascade.novo \n\r');
    });
});