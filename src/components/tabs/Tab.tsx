import React from "react";

import "../../styles/tabs.scss";

import OpenPage from "../../types/OpenPage";
import WebviewTag from "../../types/WebviewTag";
import Main from "../Main";
import classNames from "classnames";

interface PropsAndState {
    page: OpenPage,
    favicon?: string
}

export default class Tab extends React.Component<PropsAndState, PropsAndState> {
    constructor(props: PropsAndState) {
        super(props);

        this.state = {
            page: props.page
        };
    }

    public render(): React.ReactNode {
        const webview = this.state.page.webviewRef.current as WebviewTag;

        if (webview) {
            const tabTitle = webview.getTitle().length >= 1 ? webview.getTitle() : webview.getURL().length >= 1 ? webview.getURL() : this.state.page.url;
            const isActive = this.state.page.pageId === Main.getInstance().getActivePage().pageId;

            return (
                <div className={classNames("tab", {"inactive": !isActive})} onClick={this.switchActiveTab.bind(this)}>
                    <div className="tab-inner">
                        {
                            typeof this.state.favicon === "string" ? (
                                <img src={this.state.favicon} alt=""></img>
                            ) : null
                        }
                        <p>{tabTitle}</p>
                    </div>
                    <img src="./assets/icons/close.svg" id="close" alt=""
                         onClick={() => Main.getInstance().closePage(this.state.page.pageId)}></img>
                    <div className="fade"></div>
                </div>
            )
        } else {
            return (
                <></>
            )
        }
    }

    public componentDidMount(): void {
        this.attachListeners();
    }

    private attachListeners(): void {
        const webview = this.props.page.webviewRef.current as WebviewTag;

        webview.addEventListener("page-title-updated", this.updateState.bind(this));
        webview.addEventListener("page-favicon-updated", (event) => {
            this.setState({
                favicon: event.favicons[0]
            });
        });
    }

    private switchActiveTab(): void {
        Main.getInstance().setActive(this.state.page.pageId);
    }

    private updateState(): void {
        this.setState({
            page: this.props.page
        });
    }
}