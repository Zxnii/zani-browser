import WebviewTag from "./types/WebviewTag";

export function extractHost(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return ""
    }
}

export function isSecure(webview: WebviewTag): boolean {
    try {
        return new URL(webview.getURL()).protocol.replace(":", "").toLowerCase() === "https"
    } catch {
        return false;
    }
}

export function isValidUri(input: string): boolean {
    try {
        const { protocol, hostname } = new URL(input);

        return input.startsWith(protocol);
    } catch {
        return false;
    }
}

export function shouldTryOpen(input: string): boolean {
    return isValidUri(input) || /^(((?!\-))(xn\-\-)?[a-z0-9\-_]{0,61}[a-z0-9]{1,1}\.)*(xn\-\-)?([a-z0-9\-]{1,61}|[a-z0-9\-]{1,30})\.[a-z]{2,}$/.test(input);
}