const {ipcRenderer} = require('electron')

const loginForm=document.getElementById("LoginForm");

loginForm.addEventListener("submit", (e) => {
  console.log('entro');
  e.preventDefault()
  let firstname = document.getElementById("nickName").value;
  ipcRenderer.send('form-submission', firstname)
})

