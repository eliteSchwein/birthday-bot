"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandInteraction = void 0;
const SetCommand_1 = require("../commands/SetCommand");
const EditChannelCommand_1 = require("../commands/EditChannelCommand");
const ListCommand_1 = require("../commands/ListCommand");
const SetOtherCommand_1 = require("../commands/SetOtherCommand");
const DeleteCommand_1 = require("../commands/DeleteCommand");
class CommandInteraction {
    async handleInteraction(interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }
        const commandId = interaction.commandName;
        await (new SetCommand_1.default()).executeCommand(interaction, commandId);
        await (new EditChannelCommand_1.default()).executeCommand(interaction, commandId);
        await (new ListCommand_1.default()).executeCommand(interaction, commandId);
        await (new SetOtherCommand_1.default()).executeCommand(interaction, commandId);
        await (new DeleteCommand_1.default()).executeCommand(interaction, commandId);
    }
}
exports.CommandInteraction = CommandInteraction;
