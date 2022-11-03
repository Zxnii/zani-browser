import EmulatedWebContents from "./EmulatedWebContents";
import EmulatedWebContentsIpcMessage from "./types/EmulatedWebContentsIpcMessage";

const emulatedWebContents: Map<number, EmulatedWebContents> = new Map();

const native: {
    _invoke<T>(channel: string, ...args: any[]): Promise<T>,
    _on(channel: string, cb: (...args: any[]) => void): void;
    window: {
        close(): void;
        minimize(): void;
        maximize(): void;
        fetchState(): Promise<boolean>;
        onState(callback: (state: boolean) => void): void;
    },
    webContents: {
        fromId(id: number): Promise<EmulatedWebContents>;
    }
} = {
    ...(<any>window).natives,
    webContents: {
        async fromId(id: number): Promise<EmulatedWebContents> {
            if (emulatedWebContents.has(id)) {
                return <EmulatedWebContents>emulatedWebContents.get(id);
            }

            const ipcMessage = await native._invoke<EmulatedWebContentsIpcMessage>("webcontents.emulate", id);

            return new EmulatedWebContents(id, ipcMessage);
        }
    }
};

export default native;