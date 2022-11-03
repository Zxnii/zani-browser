import React from "react";
import WebviewTag from "./WebviewTag";

type OpenPage = {
    url: string;
    pageId: string;

    webviewRef: React.RefObject<WebviewTag>;

    didMount: () => void;
};

export default OpenPage;