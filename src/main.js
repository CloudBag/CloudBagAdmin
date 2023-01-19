const {app, BrowserWindow, ipcMain, Tray, Menu, dialog, nativeImage} = require('electron');
const path = require('path');
const ejse = require('ejs-electron');
const os = require('os');
const {validateUser, extractUsers, createUser, extractSesions} = require('./users.js');
const {startUp}= require('./express-server/server')
const fs = require('fs');

let mainWindow;
let user;

let tray = null;

app.whenReady().then(() => {
  let icon = nativeImage.createFromPath(path.join(__dirname, '../public/images/Logo.ico'))
  console.log(path.join(__dirname, '../public/images/Logo.ico'));
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Stop server', type: 'normal', click() {app.quit()}},
  ]);
  tray.setToolTip('CloudBag');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow.isDestroyed()){
      createWindow()
    }
  })
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: './public/images/logito.png',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // and load the html of the app.
  mainWindow.loadFile(path.join(__dirname, 'views/login.ejs'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () =>{
    mainWindow.maximize();
  })

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  startUp();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    mainWindow.destroy();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on('loginForm-submit', function(event, formData) {
  console.log('[User, password] ->', formData);
  user = validateUser(formData);
  console.log(user);
  if (user.rango === 'admin') {
    mainWindow.loadFile(path.join(__dirname, 'views/AdminDashBoard.ejs'));
  } else {
    mainWindow.reload();
  }
});

ipcMain.on('display-user-list', function(event){
  let userList = extractUsers();
  console.log(userList);
  let nicknames = [];
  for (let x in userList){
    nicknames.push(userList[x].split(';')[0]);
  }
  console.log(nicknames);
  ejse.data('nicknames', nicknames)
  mainWindow.loadFile(path.join(__dirname, 'views/UserList.ejs'));
});

ipcMain.on('createForm-submit', function(event, formData){
  couldCreate = createUser(formData);
  console.log(couldCreate);
  if (couldCreate){
    mainWindow.loadFile(path.join(__dirname, 'views/AdminDashBoard.ejs'));
  }else{
    dialog.showMessageBox(null, {
      type: 'warning',
      title: 'Failed',
      message: 'Usuario ya existe',
    });
    mainWindow.reload();
  }
})

ipcMain.on('report', function(e) {
  ejse.data('sessions', extractSesions());
  mainWindow.loadFile(path.join(__dirname, 'views/report.ejs'));
})

ipcMain.on('logout-event', async function(event){
  mainWindow.loadFile(path.join(__dirname, 'views/login.ejs'))
});