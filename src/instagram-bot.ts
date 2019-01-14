import { Puppet } from "./lib/puppet";
import cfg from "../config";

export async function run() {
    console.log(`\n----------\n[${new Date().toUTCString()}] Running new session...\n----------\n`);

    const puppet = new Puppet({
        defaultViewport: {
            width: 1080,
            height: 720
        },
        headless: false
    });
    await puppet.ready();
    console.log("Puppet is ready.");

    const page = (await puppet.newPage()).page;
    await page.goto("https://www.instagram.com/accounts/login");
    console.log("Opened instagram.");

    await page.waitFor(() => !!document.querySelector("input[name='username']"));

    await page.type("input[name='username']", cfg.USERNAME);
    console.log("Typed username: " + cfg.USERNAME);
    await page.type("input[name='password']", cfg.PASSWORD);
    console.log("Typed password: " + cfg.PASSWORD);

    await page.click("button[type='submit']");
    console.log("Logging in...");
    await page.waitForNavigation();
    console.log("Logged in.");

    await page.goto("https://www.instagram.com/explore/tags/" + cfg.TAG);
    await page.addScriptTag({
        path: cfg.DIR + "/src/assets/jquery.min.js"
    });
    console.log("Injected JQuery.");

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
        const page = (await puppet.newPage()).page;
        await page.goto("https://instagram.com" + routes[i]);

        if (!!(await page.$("button.coreSpriteHeartOpen"))) {
            await page.click("button.coreSpriteHeartOpen");
            console.log("Liked " + routes[i]);
        }

        if (!!(await page.$("span[class*='glyphsSpriteSave']"))) {
            await page.click("span[class*='glyphsSpriteSave']");
        }

        // follow account
        if (!!(await page.$("button[type='button']:contains(Follow)"))) {
            (await page.$("button[type='button']:contains(Follow)")).click();
        }
    }

    await puppet.destroy();
    console.log("Destroyed Puppet.");
}
