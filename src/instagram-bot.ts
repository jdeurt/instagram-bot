import { Bot } from "./lib/bot";
import cfg from "../config";

export async function run() {
    const bot = new Bot({
        defaultViewport: {
            width: 1080,
            height: 720
        }
    });
    await bot.ready();

    const page = (await bot.newPage()).page;
    await page.goto("https://www.instagram.com/accounts/login");

    await page.waitFor(() => !!document.querySelector("input[name='username']"));

    await page.type("input[name='username']", cfg.USERNAME);
    await page.type("input[name='password']", cfg.PASSWORD);

    await page.click("button[type='submit']");
    await page.waitForNavigation();

    await page.goto("https://www.instagram.com/explore/tags/dog");
    await page.addScriptTag({
        path: cfg.DIR + "/src/assets/jquery.min.js"
    });

    const routes: Array<string> = await page.evaluate(() => {
        const routes: Array<string> = [];

        $("#react-root > section > main > article > div:nth-child(3) > div > div").each((i, elem) => {
            $(elem).find("a").each((i, elem) => {
                routes.push($(elem).attr("href"));
            });
        });

        return routes;
    });

    for (let i = 0; i < routes.length; i++) {
        const page = (await bot.newPage()).page;
        await page.goto("https://instagram.com" + routes[i]);

        if (!!(await page.$("button.coreSpriteHeartOpen"))) {
            await page.click("button.coreSpriteHeartOpen");
            console.log("Liked " + routes[i]);
        }

        if (!!(await page.$("span[class*='glyphsSpriteSave']"))) {
            await page.click("span[class*='glyphsSpriteSave']");
        }
    }

    await bot.destroy();
}
