"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = registerCommands;
const LogHelper_1 = require("./LogHelper");
const v10_1 = require("discord-api-types/v10");
const commands = require("../meta/commands.json");
async function registerCommands(discordClient) {
    const rest = discordClient.getRest();
    const commandKeys = [];
    (0, LogHelper_1.logRegular)('get current commands...');
    const currentCommands = await rest.get(v10_1.Routes.applicationCommands(discordClient.getClient().user.id));
    for (const commandIndex in commands) {
        const command = commands[commandIndex];
        commandKeys.push(commandIndex);
        (0, LogHelper_1.logRegular)(`Register Command ${command.name}...`);
        new Promise(async (resolve, reject) => {
            try {
                await discordClient.getClient().application?.commands?.create(command);
            }
            catch (e) {
                (0, LogHelper_1.logError)(`An Error occured while registering the command ${command.name}`);
                (0, LogHelper_1.logError)(`Reason: ${e}`);
                (0, LogHelper_1.logError)(`Command Data: ${JSON.stringify(command, null, 4)}`);
            }
        });
    }
    // @ts-ignore
    for (const currentCommand of currentCommands) {
        if (!commandKeys.includes(currentCommand.name)) {
            (0, LogHelper_1.logRegular)(`Unregister Command ${currentCommand.name}...`);
            const deleteUrl = `${v10_1.Routes.applicationCommands(discordClient.getClient().user.id)}/${currentCommand.id}`;
            new Promise(async (resolve, reject) => {
                try {
                    await rest.delete(deleteUrl);
                }
                catch (e) {
                    (0, LogHelper_1.logError)(`An Error occured while unregistering the command ${currentCommand.name}`);
                    (0, LogHelper_1.logError)(`Reason: ${e}`);
                    (0, LogHelper_1.logError)(`Command Data: ${JSON.stringify(currentCommand, null, 4)}`);
                }
            });
        }
    }
}
