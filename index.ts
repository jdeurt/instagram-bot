import { run } from "./src/instagram-bot";
import cfg from "./config";

setInterval(run, (1000 * 60 * 60 * 24) / cfg.LIKES_DAILY_LIMIT);