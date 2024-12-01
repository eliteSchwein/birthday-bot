"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandInteraction = void 0;
const SetCommand_1 = require("../commands/SetCommand");
const EditChannelCommand_1 = require("../commands/EditChannelCommand");
class CommandInteraction {
    async handleInteraction(interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }
        const commandId = interaction.commandName;
        await (new SetCommand_1.default()).executeCommand(interaction, commandId);
        await (new EditChannelCommand_1.default()).executeCommand(interaction, commandId);
    }
}
exports.CommandInteraction = CommandInteraction;
