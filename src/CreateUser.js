const {ipcRenderer} = require('electron')

const createForm = document.getElementById("CreateForm");

createForm.addEventListener("submit", (e) => {
  e.preventDefault()
  let formData = [document.getElementById("username").value, document.getElementById("password").value]
  ipcRenderer.send('createForm-submit', formData)
})