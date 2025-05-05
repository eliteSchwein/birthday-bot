"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseCommand_1 = require("./BaseCommand");
const LogHelper_1 = require("../../helper/LogHelper");
class DeleteCommand extends BaseCommand_1.default {
    commandId = 'delete';
    ephemeral = true;
    defer = true;
    async handleCommand(interaction) {
        const guild = await this.guildRepository.createGuild(interaction.guild);
        const member = await this.guild.members.fetch(this.user.id);
        const targetUser = interaction.options.getUser("user");
        const dataUser = await this.userRepository.findOneByUserAndGuild(guild, targetUser);
        if (!member.permissions.has("Administrator", true)) {
            await interaction.editReply("Du hast nicht die Berechtigung dafür!");
            return;
        }
        if (!dataUser) {
            await interaction.editReply(`Der Benutzer ${targetUser.displayName} wurde nicht gefunden!`);
            return;
        }
        await this.userRepository.remove(dataUser);
        (0, LogHelper_1.logNotice)(`Deleted user ${dataUser.userId}`);
        await interaction.editReply(`Der Benutzer ${targetUser.displayName} wurde gelöscht!`);
    }
}
exports.default = DeleteCommand;
