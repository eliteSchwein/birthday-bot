"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseCommand_1 = require("./BaseCommand");
const PageHelper_1 = require("../../helper/PageHelper");
class ListCommand extends BaseCommand_1.default {
    commandId = 'list';
    defer = true;
    pageHelper = new PageHelper_1.PageHelper();
    async handleCommand(interaction) {
        const guild = await this.guildRepository.createGuild(interaction.guild);
        if (!guild) {
            await interaction.editReply("Der Befehl ist nur auf Server Verfügbar!");
            return;
        }
        const message = await this.pageHelper.generatePage(0, guild);
        // @ts-ignore
        await interaction.editReply(message);
    }
}
exports.default = ListCommand;
