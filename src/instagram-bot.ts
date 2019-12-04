import { Puppet } from "./lib/puppet";
import Instagram from "./lib/Instagram";
import { promiseLoop } from "./lib/promise-loop";
import cfg from "../config";

export async function run(data: { following: Array<string> }) {
    console.log(`\n----------\n[${new Date().toUTCString()}] Running new session...\n----------\n`);

    const puppet = new Puppet({
        defaultViewport: {
            width: 1080,
            height: 720
        },
        headless: !cfg.DEV
    });
    const instagram = new Instagram(puppet);

    await instagram.init();
    console.log("Bot is ready.");

    const page = (await puppet.newPage()).page;

    // Old method for waiting for login.
    // await page.waitFor(() => !!document.querySelector("input[name='username']"));

    await instagram.login(page, cfg.USERNAME, cfg.PASSWORD);
    console.log("Logged into Instagram with following credentials:");
    console.log(`\tUsername: ${cfg.USERNAME}`);
    console.log(`\tPassword: ${cfg.PASSWORD.replace(/./g, "*")}`);

    console.log("Cleaning up follow list:");
    console.log(data.following);

    const oldFollowingList = data.following;

    for (let i = oldFollowingList.length - 1; i > -1; i--) {
        await page.waitFor(1000);

        await page.goto(`https://www.instagram.com/${cfg.PROFILE_PAGE_ID}`);

        await page.waitFor(1000);

        await page.click(`a[href="/${cfg.PROFILE_PAGE_ID}/following/"]`);

        await page.waitForXPath("//button[contains(text(), 'Following')]");

        console.log(`Checking for ${oldFollowingList[i]}...`);

        try {
            await (await page.$x(`//a[text()="${oldFollowingList[i]}"]/../../../../..//button`))[0].click();

            await page.waitFor(1000);

            await (await page.$x("//button[text()='Unfollow']"))[0].click();

            await page.waitFor(1000);

            console.log("\tUnfollowed.");
        } catch (err) {
            console.log("\tNot found. Skipping...");
        }

        await page.click("section main header section h1");

        await page.waitFor(1000);

        data.following.splice(data.following.indexOf(oldFollowingList[i]), 1);
    }

    console.log("Interacting with posts...");

    for (let i = 0; i < cfg.TAGS.length; i++) {
        await page.goto("https://www.instagram.com/explore/tags/" + cfg.TAGS[i]);
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

        console.log(`Working on posts with hastag: ${cfg.TAGS[i]}`);

        for (let i = 0; i < routes.length; i++) {
            const pageHandle = await puppet.newPage();
            const page = pageHandle.page;
            const pageID = pageHandle.id;
            await page.goto("https://instagram.com" + routes[i]);

            await page.addScriptTag({
                path: cfg.DIR + "/src/assets/jquery.min.js"
            });
            console.log("Injected JQuery.");

            console.log(`Working on post: ${routes[i]}`);

            // Like post
            await instagram.like(page);
            console.log("\tLiked.");

            // Bookmark post
            // await instagram.bookmark(page);
            // console.log("\tBookmarked.");

            // Follow account
            const userId = await instagram.follow(page, "post");
            console.log("\tFollowed.");

            if (data.following.indexOf(userId) < 0) {
                data.following.push(userId);
                console.log(`Added ${userId} to follow list.`);
            }

            await puppet.closePage(pageID);
        }
    }

    await puppet.destroy();
    console.log("Destroyed Puppet.");
}
