"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron = require("electron");
function createWindow() {
    const win = new electron.BrowserWindow({
        'width': 800,
        'height': 700
    });
    win.once('ready-to-show', function () {
        win.show();
    });
    win.loadFile('../test/index.html').catch(function (e) {
        throw e;
    });
}
electron.app.whenReady().then(createWindow).catch(function (e) {
    throw e;
});
electron.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron.app.quit();
    }
});
electron.app.on('activate', function () {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
