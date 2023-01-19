const {ipcRenderer} = require('electron')

document.getElementById('reportButton').addEventListener('click', (e) => {
  e.preventDefault();
  ipcRenderer.send('report');
})