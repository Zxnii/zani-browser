import React from "react";
import WebviewTag from "../types/WebviewTag";
import OpenPage from "../types/OpenPage";
import Main from "./Main";

type Props = OpenPage;

export default class Page extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <webview id={this.props.pageId} src={this.props.url} ref={this.props.webviewRef} style={{
                display: Main.getInstance().getActivePage().pageId === this.props.pageId ? "flex" : "none"
                // @ts-ignore
            }} allowpopups="true" allowFullScreen={true}>

            </webview>
        )
    }

    public componentDidMount(): void {
        this.props.didMount();
    }
}