import {DiscordClient} from "../clients/DiscordClient";
import {logError, logRegular} from "./LogHelper";
import {Routes} from "discord-api-types/v10"
import * as commandOptionsTypes from '../meta/command_option_types.json'
import * as commands from "../meta/commands.json"
import {RouteLike} from "@discordjs/rest";

export async function registerCommands(discordClient: DiscordClient) {
    const rest = discordClient.getRest()
    const commandKeys = []

    logRegular('get current commands...')
    const currentCommands = await rest.get(Routes.applicationCommands(discordClient.getClient().user.id))

    for(const commandIndex in commands) {
        const command = commands[commandIndex]

        commandKeys.push(commandIndex)

        logRegular(`Register Command ${command.name}...`)

        new Promise(async (resolve, reject) => {
            try {
                await discordClient.getClient().application?.commands?.create(command)
            } catch (e) {
                logError(`An Error occured while registering the command ${command.name}`)
                logError(`Reason: ${e}`)
                logError(`Command Data: ${JSON.stringify(command, null, 4)}`)
            }
        })
    }

    // @ts-ignore
    for(const currentCommand of currentCommands) {
        if (!commandKeys.includes(currentCommand.name)) {
            logRegular(`Unregister Command ${currentCommand.name}...`)
            const deleteUrl = `${Routes.applicationCommands(discordClient.getClient().user.id)}/${currentCommand.id}`;

            new Promise(async (resolve, reject) => {
                try {
                    await rest.delete(<RouteLike>deleteUrl)
                } catch (e) {
                    logError(`An Error occured while unregistering the command ${currentCommand.name}`)
                    logError(`Reason: ${e}`)
                    logError(`Command Data: ${JSON.stringify(currentCommand, null, 4)}`)
                }
            })
        }
    }
}