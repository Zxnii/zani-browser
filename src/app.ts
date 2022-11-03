import { app, BrowserWindow, ipcMain, webContents } from "electron";
import path from "path";

function ready(): void {
    const WIN_WIDTH = 1024;
    const WIN_HEIGHT = 676;

    const window = new BrowserWindow({
        width: WIN_WIDTH,
        height: WIN_HEIGHT,
        minWidth: WIN_WIDTH,
        minHeight: WIN_HEIGHT,
        show: false,
        paintWhenInitiallyHidden: true,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            webviewTag: true,
            navigateOnDragDrop: false,
            webgl: true,
            backgroundThrottling: false,
            nodeIntegration: false
        }
    });

    window.loadFile(path.join(__dirname, "../view/index.htm"));

    window.once("ready-to-show", () => {
        window.show();
    });

    window.on("maximize", () => {
        window.webContents.send("window-state", true);
    });

    window.on("unmaximize", () => {
        window.webContents.send("window-state", false);
    })

    ipcMain.handle("close", () => window.close());
    ipcMain.handle("minimize", () => window.minimize());

    ipcMain.handle("fetchState", (ev) => {
        ev.returnValue = window.isMaximized()
    });

    ipcMain.handle("maximize", () => {
        if (!window.isMaximized()) {
            window.maximize();
        } else {
            window.unmaximize();
        }

        window.webContents.send("window-state", window.isMaximized()); 
    });

    ipcMain.handle("webcontents.emulate", (event, id: number) => {
        const contents = webContents.fromId(id);

        contents.setWindowOpenHandler((details) => {
            window.webContents.send("webcontents.windowOpen", id, details);

            return { action: "deny" };
        });
    });
}

app.once("ready", ready);