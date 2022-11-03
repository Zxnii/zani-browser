import { contextBridge, ipcRenderer } from "electron";

const maximizeListeners: ((maximizeState: boolean) => void)[] = [];

const allowedInvokes: string[] = [
    "webcontents.emulate"
];
const allowedListeners: string[] = [
    "webcontents.windowOpen"
];

ipcRenderer.on("window-state", (ev, state: boolean) => {
    for (const listener of maximizeListeners) {
        listener(state);
    }
});

contextBridge.exposeInMainWorld("natives", {
    _on(channel: string, handler: (...args: unknown[]) => void): void {
        if (allowedListeners.includes(channel)) {
            ipcRenderer.on(channel, (ev, ...args: unknown[]) => {
                handler(...args);
            });
        } else {
            throw new Error(`cant listen on channel ${channel}`);
        }
    },
    _invoke(channel: string, ...args: unknown[]): Promise<unknown> {
        if (allowedInvokes.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args);
        } else {
            throw new Error(`cant invoke on channel ${channel}`);
        }
    },
    window: {
        async minimize(): Promise<void> {
            await ipcRenderer.invoke("minimize")
        },
        async maximize(): Promise<void> {
            await ipcRenderer.invoke("maximize")
        },
        async close(): Promise<void> {
            await ipcRenderer.invoke("close")
        },
        async fetchState(): Promise<boolean> {
            return await ipcRenderer.invoke("fetchState")
        },
        onState(callback: (maximizeState: boolean) => void) {
            maximizeListeners.push(callback);
        }
    },
    webContents: {

    }
});