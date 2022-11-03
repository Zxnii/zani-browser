import React from "react";

import "../styles/index.scss";

import Page from "./Page";
import TabBar from "./TabBar";
import OpenPage from "../types/OpenPage";
import Titlebar from "./Titlebar";
import WebviewTag from "../types/WebviewTag";
import native from "../native";

export default class Main extends React.Component {
    private static instance: Main;

    private openPages: OpenPage[] = [];

    private tabBarRef: React.RefObject<TabBar> = React.createRef();
    private titlebarRef: React.RefObject<Titlebar> = React.createRef();

    private activePage: string = "";
    private mounted: boolean = false;

    constructor(props: {}) {
        super(props);

        Main.instance = this;

        this.openPage();
    }

    private async attachHandlers(page: OpenPage): Promise<void> {
        const webview = page.webviewRef.current;

        if (webview) {
            const contents = await native.webContents.fromId(webview.getWebContentsId());

            contents.setWindowOpenHandler((details) => {
                switch (details.disposition) {
                    case "foreground-tab":
                        this.openPage(details.url);
                        break;
                    case "background-tab":
                        this.openPage(details.url, false);
                        break;
                    case "default":
                        this.openPage(details.url);
                        break;
                }
            });
        }
    }

    public openPage(url?: string, makeActive: boolean = true): void {
        const page: OpenPage = {
            webviewRef: React.createRef(),
            url: url ?? "https://duckduckgo.com",
            pageId: btoa(Date.now().toString()),
            didMount: () => {
                const readyListener = () => {
                    page.webviewRef.current?.removeEventListener("did-attach", readyListener);

                    if (makeActive) {
                        this.activePage = page.pageId;
                    }

                    this.tabBarRef.current?.updateState();
                    this.titlebarRef.current?.updateState();

                    this.setState({});
                    void this.attachHandlers(page);
                }

                page.webviewRef.current?.addEventListener("did-attach", readyListener);
            }
        }

        this.openPages.push(page);

        if (this.mounted) {
            this.setState({});
        }
    }

    public getActivePage(): OpenPage {
        return this.openPages.find(({ pageId }) => pageId === this.activePage) ?? this.openPages[0];
    }

    public getActiveWebview(): WebviewTag | null {
        return this.getActivePage().webviewRef.current;
    }

    public setActive(id: string): void {
        this.activePage = id;

        this.setState({});

        this.tabBarRef.current?.updateState();
        this.titlebarRef.current?.updateState();
    }

    public render(): React.ReactNode {
        return (
            <>
                <Titlebar ref={this.titlebarRef}></Titlebar>
                <TabBar pages={this.openPages} ref={this.tabBarRef}></TabBar>
                {
                    this.openPages.map(page => {
                        return (
                            <Page key={page.pageId} {...page as any}></Page>
                        );
                    })
                }
            </>
        );
    }

    public closePage(id: string): void {
        const pageIndex = this.openPages.findIndex(page => page.pageId === id);

        if (pageIndex !== -1) {
            this.openPages.splice(pageIndex, 1);

            if (this.openPages[pageIndex]) {
                this.setActive(this.openPages[pageIndex].pageId);
            } else if (this.openPages[pageIndex - 1]) {
                this.setActive(this.openPages[pageIndex - 1].pageId);
            } else {
                native.window.close();
            }
        }
    }

    public static getInstance(): Main {
        return Main.instance;
    }

    public componentDidMount(): void {
        this.mounted = true;
    }
}