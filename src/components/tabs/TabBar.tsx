import React from "react";

import "../../styles/tabs.scss";

import Tab from "./Tab";
import OpenPage from "../../types/OpenPage";
import Main from "../Main";

interface Props {
    pages: OpenPage[];
}

interface State extends Props {
}

export default class TabBar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            pages: props.pages
        };
    }

    public render(): React.ReactNode {
        return (
            <div id="tab-bar">
                {
                    this.state.pages.map(page => {
                        if (page.webviewRef.current) {
                            return (
                                <Tab page={page} key={page.pageId}></Tab>
                            );
                        } else {
                            return;
                        }
                    })
                }
                <div id="new-tab" onClick={this.openNewTab.bind(this)}>
                    <img src="./assets/icons/add.svg" alt=""></img>
                </div>
            </div>
        )
    }

    public updateState() {
        this.setState({
            pages: this.props.pages
        })
    }

    private openNewTab(): void {
        Main.getInstance().openPage();
    }
}