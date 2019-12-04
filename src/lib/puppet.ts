import { Browser, Page, LaunchOptions } from "puppeteer";

/**
 * A class that makes it easier to organize multiple pages in a Puppeteer browser.
 */
export class Puppet {
    private controller: any;
    private browser: Browser;
    private launchOptions: LaunchOptions;
    private uuid: Function;
    private pages: Map<string, Page>;

    /**
     * Creates a new Puppet.
     * @param {LaunchOptions} [options] Optional launch options for Puppeteer.
     */
    constructor(options?: LaunchOptions) {
        this.controller = require("puppeteer");
        this.launchOptions = options || {};
        this.uuid = require("uuid/v4");
        this.pages = new Map();
    }

    /**
     * Returns a promise that resolves when the Puppet is ready.
     * @returns {Promise<void>}
     */
    async ready(): Promise<void> {
        this.browser = await this.controller.launch(this.launchOptions);
    }

    /**
     * Returns a Page the Puppet is on.
     * @param {string} id The ID of the page to fetch.
     * @returns {Page}
     */
    page(id: string): Page {
        return this.pages.get(id);
    }

    /**
     * Creates a new Page and returns the page ID and the Page object.
     * @param {string} [id] The ID of the page. If no ID is provided one will be generated.
     * @returns {Promise<{id: string, page: Page}>}
     */
    async newPage(id?: string): Promise<{ id: string, page: Page }> {
        const key: string = !!id ? id : this.uuid();
        const newPage: Page = await this.browser.newPage();

        this.pages.set(key, newPage);

        return {
            id: key,
            page: this.pages.get(key)
        };
    }

    /**
     * Closes a page the Puppet is on.
     * @param {string} id The ID of the page to close.
     * @returns {Promise<void>}
     */
    async closePage(id: string): Promise<void> {
        await this.pages.get(id).close();
        this.pages.delete(id);
    }

    /**
     * Destroys the page controller. The page controller can be generated again by calling ready().
     * @returns {Promise<void>}
     */
    async destroy(): Promise<void> {
        this.pages.clear();
        await this.browser.close();
    }
}
