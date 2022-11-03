import type { BrowserWindowConstructorOptions } from "electron";
import { EventEmitter } from "events";
import TypedEventEmitter from "typed-emitter";
import EmulatedWebContentsEvents from "./types/EmulatedWebContentsEvents";
import EmulatedWebContentsIpcMessage from "./types/EmulatedWebContentsIpcMessage";
import native from "./native";

type OpenHandler = (details: {
    url: string,
    frameName: string,
    features: string[],
    disposition: "default" | "foreground-tab" | "background-tab" | "new-window" | "save-to-disk" | "other"
}) => (
    { action: "deny" } |
    { action: "allow", overrideBrowserWindowOptions?: BrowserWindowConstructorOptions } |
    void);

export default class EmulatedWebContents extends (EventEmitter as new () => TypedEventEmitter<EmulatedWebContentsEvents>) {
    public readonly id: number;

    private windowOpenHandler: OpenHandler | undefined;

    constructor(id: number, message: EmulatedWebContentsIpcMessage) {
        super();

        this.id = id;
        this.attachHandlers();
    }

    private attachHandlers(): void {
        native._on("webcontents.windowOpen", (id: number, details: Parameters<OpenHandler>[0]) => {
            if (id === this.id && this.windowOpenHandler) {
                this.windowOpenHandler(details);
            }
        });
    }

    public setWindowOpenHandler(handler: OpenHandler): void {
        this.windowOpenHandler = handler;
    }

    public update(message: EmulatedWebContentsIpcMessage): void {
        
    }
}