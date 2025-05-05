import {ChatInputCommandInteraction, Interaction} from "discord.js";
import SetCommand from "../commands/SetCommand";
import EditChannelCommand from "../commands/EditChannelCommand";
import ListCommand from "../commands/ListCommand";
import SetOtherCommand from "../commands/SetOtherCommand";
import DeleteCommand from "../commands/DeleteCommand";

export class CommandInteraction {
    public async handleInteraction(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) {
            return
        }

        const commandId = interaction.commandName

        await (new SetCommand()).executeCommand(interaction, commandId)
        await (new EditChannelCommand()).executeCommand(interaction, commandId)
        await (new ListCommand()).executeCommand(interaction, commandId)
        await (new SetOtherCommand()).executeCommand(interaction, commandId)
        await (new DeleteCommand()).executeCommand(interaction, commandId)
    }
}