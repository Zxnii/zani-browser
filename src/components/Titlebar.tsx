import React, {KeyboardEventHandler, Ref, RefObject} from "react";
import native from "../native";

import "../styles/titlebar.scss";
import Main from "./Main";
import {extractHost, isSecure, isValidUri, shouldTryOpen} from "../util";
import WebviewTag from "../types/WebviewTag";
import {getSearchUrl, getTopResults} from "../search";

interface Props {}

interface State {
    activePageId: string;

    maximized: boolean;

    omniboxOpen: boolean;
    omniboxHost: string;
    omniboxSecure: boolean;

    canGoForward: boolean;
    canGoBackward: boolean;

    currentWebview?: WebviewTag;
}

export default class Titlebar extends React.Component<Props, State> {
    private omniboxRef: RefObject<HTMLElement> = React.createRef();

    private ignoreNextEvent: boolean = false;
    private attachedWebviews: string[] = [];

    constructor(props: Props) {
        super(props);

        this.state = {
            activePageId: "",

            maximized: false,

            omniboxOpen: false,
            omniboxHost: "",
            omniboxSecure: true,

            canGoForward: false,
            canGoBackward: false
        };

        native.window.fetchState().then(state => {
            this.setState({
                maximized: state
            });
        });

        native.window.onState(state => {
            console.log("maximized:", state);

            this.setState({
                maximized: state
            });
        });
    }

    private attachListeners(): void {
        const webview = (this.state.currentWebview ?? Main.getInstance().getActiveWebview()) as WebviewTag;
        const pageId = Main.getInstance().getActivePage().pageId;

        if (!this.attachedWebviews.includes(pageId)) {
            webview.addEventListener("will-navigate", () => {
                if (pageId === this.state.activePageId) {
                    const webviewUrl = webview.getURL().trim().length >= 0 ? webview.getURL() : webview.src;

                    this.setState({
                        omniboxHost: extractHost(webviewUrl),
                        omniboxSecure: isSecure(webview)
                    });
                }
            });

            webview.addEventListener("did-start-navigation", () => {
                if (pageId === this.state.activePageId) {
                    const webviewUrl = webview.getURL().trim().length >= 0 ? webview.getURL() : webview.src;

                    this.setState({
                        omniboxHost: extractHost(webviewUrl),
                        omniboxSecure: isSecure(webview)
                    });
                }
            });

            webview.addEventListener("did-stop-loading", () => {
                if (pageId === this.state.activePageId) {
                    const webviewUrl = webview.getURL().trim().length >= 0 ? webview.getURL() : webview.src;

                    this.setState({
                        omniboxHost: extractHost(webviewUrl),
                        omniboxSecure: isSecure(webview)
                    });
                }
            });

            this.attachedWebviews.push(pageId);
        }
    }

    public render(): React.ReactNode {
        const activeWebview = this.state.currentWebview ?? Main.getInstance().getActiveWebview();

        return (
            <div id="titlebar">
                <div id="history-controls">
                    <div className="history-button">
                        <img src="./assets/icons/back.svg" alt=""></img>
                    </div>
                    <div className="history-button">
                        <img src="./assets/icons/forward.svg" alt=""></img>
                    </div>
                </div>
                <div id="omnibox" ref={this.omniboxRef as Ref<any>} onClick={() => {
                    this.setState({
                        omniboxOpen: true
                    });

                    this.ignoreNextEvent = true;
                }}>
                    {
                        this.state.omniboxOpen ? (
                            <>
                                <input
                                    type="text"
                                    defaultValue={activeWebview?.getURL()}
                                    id="omnibox-input"
                                    autoFocus={true}
                                    onKeyDown={this.handleOmniboxInput.bind(this) as any}
                                    onKeyUp={this.handleOmniboxInput.bind(this) as any}
                                />
                            </>
                        ) : (
                            <>
                                { activeWebview !== null ? (
                                    <>
                                        <div id="omnibox-closed-inner">
                                            <img src={ this.state.omniboxSecure ? "./assets/icons/secure.svg" : "./assets/icons/insecure.svg" } alt=""></img>
                                            <p>
                                                { this.state.omniboxHost }
                                            </p>
                                        </div>
                                        <div id="refresh" onClick={this.refreshCurrentWebview.bind(this) as any}>
                                            <img src="./assets/icons/refresh.svg" alt=""></img>
                                        </div>
                                    </>
                                ) : null}
                            </>
                        )
                    }
                </div>
                <div id="window-controls">
                    <div className="window-control" onClick={native.window.minimize}>
                        <img src="./assets/minimize.svg" alt=""></img>
                    </div>
                    <div className="window-control" onClick={native.window.maximize}>
                        <img src={this.state.maximized ? "./assets/restore.svg" : "./assets/maximize.svg"} alt=""></img>
                    </div>
                    <div className="window-control close" onClick={native.window.close}>
                        <img src="./assets/close.svg" alt=""></img>
                    </div>
                </div>
            </div>
        )
    }

    private refreshCurrentWebview(event: MouseEvent): void {
        const webview = this.state.currentWebview;

        event.stopPropagation();

        if (webview) {
            webview.reload();
        }
    }

    private handleOutsideClick(event: MouseEvent): void {
        if (!this.ignoreNextEvent && !this.omniboxRef.current?.contains(event.target as Node)) {
            this.setState({
                omniboxOpen: false
            });
        }

        this.ignoreNextEvent = false;
    }

    private handleOmniboxInput(event: KeyboardEvent): void {
        const element = event.target as HTMLInputElement;

        if (event.key === "Enter") {
            this.handleOmniboxEnter(element);
        }
    }

    private handleOmniboxEnter(target: HTMLInputElement): void {
        const { value } = target;
        const webview = this.state.currentWebview ?? Main.getInstance().getActiveWebview();

        if (webview) {
            if (shouldTryOpen(value)) {
                let fullUrl = value;

                if (!isValidUri(value)) {
                    fullUrl = `https://${value}`;
                }

                webview.src = fullUrl;

                this.setState({
                    omniboxOpen: false,
                    omniboxHost: extractHost(fullUrl)
                });
            } else {
                const searchUrl = getSearchUrl(value);

                webview.src = searchUrl;

                this.setState({
                    omniboxOpen: false,
                    omniboxHost: extractHost(searchUrl)
                });
            }
        }
    }

    public componentDidMount(): void {
        document.addEventListener("click", this.handleOutsideClick.bind(this));
    }

    public updateState() {
        const webview = Main.getInstance().getActiveWebview() as WebviewTag;
        const { pageId } = Main.getInstance().getActivePage();

        const webviewUrl = webview.getURL().trim().length >= 0 ? webview.getURL() : webview.src;

        this.attachListeners();

        this.setState({
            currentWebview: webview,
            omniboxHost: extractHost(webviewUrl),
            omniboxSecure: isSecure(webview),
            activePageId: pageId
        });
    }
}