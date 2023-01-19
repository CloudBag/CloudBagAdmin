const {ipcRenderer} = require('electron')

const loginForm=document.getElementById("CreateForm");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault()
  let formData = [document.getElementById("nickName").value, document.getElementById("Password").value]
  ipcRenderer.send('loginForm-submit', formData)
})