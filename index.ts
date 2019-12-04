import { run } from "./src/instagram-bot";
import cfg from "./config";

const data: {
    following: Array<string>
} = {
    following: []
};

run(data);
setInterval(() => run(data), (1000 * 60 * 60 * 24) / cfg.LIKES_DAILY_LIMIT);
