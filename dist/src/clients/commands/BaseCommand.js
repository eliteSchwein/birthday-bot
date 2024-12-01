"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserRepository_1 = require("../../repository/UserRepository");
const GuildRepository_1 = require("../../repository/GuildRepository");
class BaseCommand {
    commandId;
    ephemeral = false;
    defer = true;
    guild;
    user;
    userRepository = new UserRepository_1.default();
    guildRepository = new GuildRepository_1.default();
    async executeCommand(interaction, commandId) {
        if (commandId !== this.commandId) {
            return;
        }
        if (!interaction.guild)
            return;
        this.guild = interaction.guild;
        this.user = interaction.user;
        if (this.defer) {
            await interaction.deferReply({ ephemeral: this.ephemeral });
        }
        await this.handleCommand(interaction);
    }
    // here we handle the command. what did you expect?
    async handleCommand(interaction) {
    }
}
exports.default = BaseCommand;
