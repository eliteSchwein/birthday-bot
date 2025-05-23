import * as packageConfig from '../package.json'
import {logRegular, logSuccess} from "./helper/LogHelper";
import readConfig from "./helper/ConfigHelper";
import {connectDatabase, purgeLeftUsers} from "./helper/DatabaseHelper";
import "reflect-metadata"
import {DiscordClient} from "./clients/DiscordClient";
import {initScheduler} from "./helper/SchedulerHelper";

void init()

let discordClient: DiscordClient;

async function init() {
    logSuccess(`Starting ${packageConfig.name} ${packageConfig.version}...`)

    logRegular('load config')
    readConfig()

    logRegular('connect database')
    await connectDatabase()

    discordClient = new DiscordClient()
    await discordClient.connect()

    logRegular('init scheduler')
    initScheduler()

    logRegular('Purge missing users')
    await purgeLeftUsers()
}

export function getDiscordClient() {
    return discordClient;
}