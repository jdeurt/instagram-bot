import { Browser, Page, Mouse, Keyboard, LaunchOptions } from "puppeteer";

declare type BotMap = {[key: string]: Bot};

export class Bot {
    private controller: any;
    private browser: Browser;
    private launchOptions: LaunchOptions;
    private uuid: Function;
    private pages: Map<string, Page>;

    constructor(options?: LaunchOptions) {
        this.controller = require("puppeteer");
        this.launchOptions = options || {};
        this.uuid = require("uuid/v4");
        this.pages = new Map();
    }

    async ready(): Promise<void> {
        this.browser = await this.controller.launch(this.launchOptions);
    }

    page(id: string): Page {
        return this.pages.get(id);
    }

    listPageIDs(): Array<string> {
        return [...this.pages.keys()];
    }

    async newPage(id?: string): Promise<{id: string, page: Page}> {
        const key: string = !!id ? id : this.uuid();
        const newPage: Page = await this.browser.newPage();

        this.pages.set(key, newPage);

        return {
            id: key,
            page: this.pages.get(key)
        };
    }

    async closePage(id: string): Promise<void> {
        await this.pages.get(id).close();
        this.pages.delete(id);
    }

    async destroy(): Promise<void> {
        this.pages.clear();
        await this.browser.close();
    }
}

export class BotNet {
    private network: BotMap;

    constructor(bots: BotMap | number) {
        if (typeof bots === "object") {
            this.network = bots;
        } else {
            for (let i = 0; i < bots; i++) {
                this.network[i.toString()] = new Bot();
            }
        }
    }

    get(key: string): Bot {
        return this.network[key];
    }
}
