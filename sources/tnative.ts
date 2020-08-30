import * as electron from 'electron';

function createWindow(): void {
    const win = new electron.BrowserWindow({
        'width': 800,
        'height': 700
    });
    win.once('ready-to-show', function(): void {
        win.show();
    });
    win.loadFile('../test/index.html').catch(function(e): void {
        throw e;
    });
}

electron.app.whenReady().then(createWindow).catch(function(e): void {
    throw e;
});

electron.app.on('window-all-closed', function(): void {
    if (process.platform !== 'darwin') {
        electron.app.quit();
    }
});

electron.app.on('activate', function(): void {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
