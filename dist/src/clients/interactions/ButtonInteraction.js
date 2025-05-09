"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonInteraction = void 0;
const GuildRepository_1 = require("../../repository/GuildRepository");
const PageHelper_1 = require("../../helper/PageHelper");
class ButtonInteraction {
    guildRepository = new GuildRepository_1.default();
    pageHelper = new PageHelper_1.PageHelper();
    async handleInteraction(interaction) {
        if (!interaction.isButton()) {
            return;
        }
        const guild = await this.guildRepository.createGuild(interaction.guild);
        const customId = interaction.customId;
        if (customId.startsWith("page_")) {
            const newPage = Number.parseInt(customId.replace("page_", ""));
            const message = await this.pageHelper.generatePage(newPage, guild);
            try {
                // @ts-ignore
                await interaction.update(message);
            }
            catch (e) {
            }
            return;
        }
    }
}
exports.ButtonInteraction = ButtonInteraction;
