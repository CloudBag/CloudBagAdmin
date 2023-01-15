const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron');
const path = require('path');
const ejse = require('ejs-electron');
const os = require('os');
const {validateUser} = require('./users.js');
const {startUp}= require('./express-server/server')

let mainWindow;
let user;

let tray = null;
app.whenReady().then(() => {
  tray = new Tray('./public/images/logito.png');
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Item1', type: 'radio'},
    {label: 'Item2', type: 'radio'},
    {label: 'Item3', type: 'radio', checked: true},
    {label: 'Item4', type: 'radio'},
  ]);
  tray.setToolTip('CloudBag');
  tray.setContextMenu(contextMenu);
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
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the html of the app.
  mainWindow.loadURL(path.join(__dirname, 'views/login.ejs'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

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
    app.quit();
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
