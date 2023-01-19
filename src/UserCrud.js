const {ipcRenderer} = require('electron');

const userListButton = document.getElementById('UserListButton');

userListButton.addEventListener('click', (e) => {
  ipcRenderer.send('display-user-list');
});