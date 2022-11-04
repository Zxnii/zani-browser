import React from "react";
import native from "../../native";

import "../../styles/titlebar.scss";
import Main from "../Main";
import {extractHost, isSecure, listenAll} from "../../util";
import WebviewTag from "../../types/WebviewTag";
import Omnibox from "./Omnibox";
import classNames from "classnames";

interface Props {
}

interface State {
    activePageId: string;

    maximized: boolean;

    omniboxHost: string;
    omniboxSecure: boolean;

    canGoForward: boolean;
    canGoBackward: boolean;

    currentWebview?: WebviewTag;
}

export default class Titlebar extends React.Component<Props, State> {
    private ignoreNextEvent: boolean = false;
    private attachedWebviews: string[] = [];
    private activePageId: string = "";

    constructor(props: Props) {
        super(props);

        this.state = {
            activePageId: "",

            maximized: false,

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

    public render(): React.ReactNode {
        const activeWebview = (this.state.currentWebview ?? Main.getInstance().getActiveWebview()) as WebviewTag;

        return (
            <div id="titlebar">
                <div id="history-controls">
                    <div className={classNames("history-button", { "inactive": !this.state.canGoBackward })} onClick={this.navigateBackward.bind(this)}>
                        <img src="./assets/icons/back.svg" alt=""></img>
                    </div>
                    <div className={classNames("history-button", { "inactive": !this.state.canGoForward })} onClick={this.navigateForward.bind(this)}>
                        <img src="./assets/icons/forward.svg" alt=""></img>
                    </div>
                </div>
                <Omnibox activeWebview={activeWebview} isSecure={this.state.omniboxSecure}
                         hostname={this.state.omniboxHost}></Omnibox>
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

    public updateState(): void {
        const {pageId} = Main.getInstance().getActivePage();

        this.activePageId = pageId;

        this.attachListeners(pageId);
    }

    public navigateForward(): void {
        const activeWebview = (this.state.currentWebview ?? Main.getInstance().getActiveWebview()) as WebviewTag;

        if (activeWebview.canGoForward()) {
            activeWebview.goForward();
        }
    }

    public navigateBackward(): void {
        const activeWebview = (this.state.currentWebview ?? Main.getInstance().getActiveWebview()) as WebviewTag;

        if (activeWebview.canGoBack()) {
            activeWebview.goBack();
        }
    }

    private attachListeners(pageId: string): void {
        const webview = (this.state.currentWebview ?? Main.getInstance().getActiveWebview()) as WebviewTag;

        if (!this.attachedWebviews.includes(pageId)) {
            listenAll(webview, [
                "load-commit",
                "did-finish-load",
                "did-fail-load",
                "did-frame-finish-load",
                "did-start-loading",
                "did-stop-loading",
                "dom-ready",
                "page-title-updated"
            ], () => {
                if (pageId === this.activePageId) {
                    const webviewUrl = webview.getURL().trim().length >= 0 ? webview.getURL() : webview.src;

                    this.setState({
                        omniboxHost: extractHost(webviewUrl),
                        omniboxSecure: isSecure(webview),
                        canGoForward: webview.canGoForward(),
                        canGoBackward: webview.canGoBack()
                    });
                }
            });

            this.attachedWebviews.push(pageId);
        } else {
            const webviewUrl = webview.getURL().trim().length >= 0 ? webview.getURL() : webview.src;

            this.setState({
                omniboxHost: extractHost(webviewUrl),
                omniboxSecure: isSecure(webview)
            });
        }
    }
}