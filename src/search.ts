import {isValidUri} from "./util";

const searchProvider: "google" | "duckduckgo" = "duckduckgo";

export async function getTopResults(query: string): Promise<string[]> {
    const results: string[] = [];

    if (!isValidUri(query)) {
        switch (searchProvider) {
            case "google": {
                const request = await fetch(`https://google.com/complete/search?q=${encodeURI(query)}&cp=8&client=gws-wiz-serp&xssi=t&hl=en`);
                const jsonResponse = JSON.parse((await request.text()).replace(")]}'", ""));

                jsonResponse[0].forEach((result: string[]) => {
                    results.push(result[0]);
                });

                break;
            }
        }
    }

    return results;
}

export function getSearchUrl(query: string): string {
    switch (searchProvider) {
        case "google": {
            return `https://google.com/search?q=${encodeURI(query.replace(/ /g, "+"))}`;
        }
        case "duckduckgo": {
            return `https://duckduckgo.com/?q=${encodeURI(query.replace(/ /g, "+"))}`;
        }
    }
}