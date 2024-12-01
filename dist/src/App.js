"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscordClient = getDiscordClient;
const packageConfig = require("../package.json");
const LogHelper_1 = require("./helper/LogHelper");
const ConfigHelper_1 = require("./helper/ConfigHelper");
const DatabaseHelper_1 = require("./helper/DatabaseHelper");
require("reflect-metadata");
const DiscordClient_1 = require("./clients/DiscordClient");
const SchedulerHelper_1 = require("./helper/SchedulerHelper");
void init();
let discordClient;
async function init() {
    (0, LogHelper_1.logSuccess)(`Starting ${packageConfig.name} ${packageConfig.version}...`);
    (0, LogHelper_1.logRegular)('load config');
    (0, ConfigHelper_1.default)();
    (0, LogHelper_1.logRegular)('connect database');
    await (0, DatabaseHelper_1.connectDatabase)();
    discordClient = new DiscordClient_1.DiscordClient();
    await discordClient.connect();
    (0, LogHelper_1.logRegular)('init scheduler');
    (0, SchedulerHelper_1.initScheduler)();
}
function getDiscordClient() {
    return discordClient;
}
