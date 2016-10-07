const electron = require('electron');
const exif = require('jpeg-exif');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const { app, globalShortcut, BrowserWindow, ipcMain } = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    backgroundColor: "#ffffff"
  });
  win.maximize();

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// Single instance for the app
const shouldQuit = app.makeSingleInstance(() => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});
if (shouldQuit) {
  app.quit();
}

// User ask for update
ipcMain.on('tag', (event, pictures, city) => {
  const promises = [];
  console.log(`Tag ${pictures.length} files with ${city} location:`);
  pictures.forEach((path) => {
    promises.push(tagFile(path, city));
  });
  Promise.all(promises).then((results) => win.webContents.send('files', results));
});

const EXIF_DATE_FORMAT = 'YYYY:MM:DD HH:mm:ss';
const APP_EXPORT_DATE_FORMAT = 'YYYY_MM_DD_HH[h]mm[.]ss';

function tagFile(filePath, city) {
  return new Promise((resolve) => {
    exif.parse(filePath, (err, data) => {
      if (err) {
        resolveError(resolve, err, filePath);
        return;
      }

      const newFileName = `${moment(data['ModifyDate'], EXIF_DATE_FORMAT).format(APP_EXPORT_DATE_FORMAT)} - ${city}.jpg`;
      try {
        fs.renameSync(filePath, path.join(path.dirname(filePath), newFileName));
      } catch(err) {
        resolveError(resolve, err, filePath);
      }

      console.log(` [X] ${path.dirname(filePath)} -> ${newFileName}: OK`);
      resolve(newFileName);
    });
  });
}

function resolveError(resolve, error, filePath) {
  console.log(` [ ] ${filePath}: problem parsing EXIF data on file`, error);
  resolve(filePath);
}
