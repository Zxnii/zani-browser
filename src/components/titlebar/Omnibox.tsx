import React, {Component, ReactNode, Ref, RefObject} from "react";
import WebviewTag from "../../types/WebviewTag";
import Main from "../Main";
import {extractHost, isValidUri, shouldTryOpen} from "../../util";
import {getSearchUrl} from "../../search";

type Props = {
    activeWebview: WebviewTag;

    isSecure: boolean;

    hostname: string;
};

type State = {
    isOpen: boolean;

    hostname: string;
};

export default class Omnibox extends Component<Props, State> {
    private ignoreNextEvent: boolean = false;
    private omniboxRef: RefObject<HTMLDivElement> = React.createRef();

    constructor(props: Props) {
        super(props);

        this.state = {
            isOpen: false,
            hostname: props.hostname
        };
    }

    public static getDerivedStateFromProps(props: Props, state: State): State {
        return {
            ...state,
            hostname: props.hostname
        };
    }

    public render(): ReactNode {
        return (
            <div id="omnibox" ref={this.omniboxRef as Ref<any>} onClick={() => {
                this.setState({
                    isOpen: true
                });

                this.ignoreNextEvent = true;
            }}>
                {
                    this.state.isOpen ? (
                        <>
                            <input
                                type="text"
                                defaultValue={this.props.activeWebview.getURL()}
                                id="omnibox-input"
                                autoFocus={true}
                                onKeyDown={this.handleInput.bind(this) as any}
                                onKeyUp={this.handleInput.bind(this) as any}
                            />
                        </>
                    ) : (
                        <>
                            <div id="omnibox-closed-inner">
                                <img
                                    src={this.props.isSecure ? "./assets/icons/secure.svg" : "./assets/icons/insecure.svg"}
                                    alt=""></img>
                                <p>
                                    {this.state.hostname}
                                </p>
                            </div>
                            <div id="refresh" onClick={this.refresh.bind(this) as any}>
                                <img src="./assets/icons/refresh.svg" alt=""></img>
                            </div>
                        </>
                    )
                }
            </div>
        );
    }

    public componentDidMount(): void {
        console.log("omnibox mounted")

        document.addEventListener("click", this.handleOutsideClick.bind(this));
    }

    private refresh(event: MouseEvent): void {
        const webview = this.props.activeWebview;

        event.stopPropagation();

        if (webview) {
            webview.reload();
        }
    }

    private handleOutsideClick(event: MouseEvent): void {
        if (!this.ignoreNextEvent && !this.omniboxRef.current?.contains(event.target as Node)) {
            this.setState({
                isOpen: false
            });
        }

        this.ignoreNextEvent = false;
    }

    private handleInput(event: KeyboardEvent): void {
        const element = event.target as HTMLInputElement;

        if (event.key === "Enter") {
            this.handleEnter(element);
        }
    }

    private handleEnter(target: HTMLInputElement): void {
        const {value} = target;
        const webview = this.props.activeWebview ?? Main.getInstance().getActiveWebview();

        if (webview) {
            if (shouldTryOpen(value)) {
                let fullUrl = value;

                if (!isValidUri(value)) {
                    fullUrl = `https://${value}`;
                }

                void webview.loadURL(fullUrl);

                this.setState({
                    isOpen: false,
                    hostname: extractHost(fullUrl)
                });
            } else {
                const searchUrl = getSearchUrl(value);

                void webview.loadURL(searchUrl);

                this.setState({
                    isOpen: false,
                    hostname: extractHost(searchUrl)
                });
            }
        }
    }
}