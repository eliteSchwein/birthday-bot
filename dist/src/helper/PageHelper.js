"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageHelper = void 0;
const UserRepository_1 = require("../repository/UserRepository");
const discord_js_1 = require("discord.js");
const App_1 = require("../App");
class PageHelper {
    userRepository = new UserRepository_1.default();
    entries = 6;
    async generatePage(pageNumber, guild) {
        const userCount = await this.userRepository.countUsersByGuild(guild);
        const maxPage = Math.ceil(userCount / this.entries);
        const discordClient = (0, App_1.getDiscordClient)();
        if (maxPage === 0) {
            return {
                content: "😥 keiner hat sein Geburtstag eingetragen."
            };
        }
        if (pageNumber > maxPage - 1)
            pageNumber = 0;
        if (pageNumber < 0)
            pageNumber = maxPage - 1;
        let entriesLimit = this.entries;
        const currentEntries = await this.userRepository.getUsersByPage(pageNumber, entriesLimit, guild);
        const container = new discord_js_1.ContainerBuilder();
        if (pageNumber === 0) {
            container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder()
                .setContent("## Die nächsten 3 Geburtstage:"));
        }
        let currentIndex = 0;
        for (const entry of currentEntries) {
            const user = await discordClient.getClient().users.fetch(`${entry.userId}`);
            const section = new discord_js_1.SectionBuilder();
            if (currentIndex === 3 && pageNumber === 0) {
                container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder()
                    .setContent("## Vergangene Geburtstage:"));
            }
            const thumbnailBuilder = new discord_js_1.ThumbnailBuilder()
                .setURL(user.avatarURL());
            let birthday = `${entry.birthDate.getDate()}.${entry.birthDate.getMonth() + 1}`;
            const textBuilder = new discord_js_1.TextDisplayBuilder()
                .setContent([
                `### ${user.displayName}`,
                `hat am ${birthday} Geburtstag`
            ].join('\n'));
            const seperator = new discord_js_1.SeparatorBuilder()
                .setDivider(true)
                .setSpacing(1);
            section.setThumbnailAccessory(thumbnailBuilder).addTextDisplayComponents(textBuilder);
            container.addSectionComponents(section);
            //container.addSeparatorComponents(seperator)
            currentIndex++;
        }
        const pagination = new discord_js_1.TextDisplayBuilder()
            .setContent(`Seite ${pageNumber + 1} von ${maxPage}`);
        container.addTextDisplayComponents(pagination);
        const row = new discord_js_1.ActionRowBuilder();
        const nextButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`page_${pageNumber + 1}`)
            .setLabel("Weiter")
            .setEmoji("➡️")
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const lastButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`page_${pageNumber - 1}`)
            .setLabel("Zurück")
            .setEmoji("⬅️")
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        row.addComponents(lastButton, nextButton);
        return {
            components: [container, row],
            flags: discord_js_1.MessageFlagsBitField.Flags.IsComponentsV2
        };
    }
}
exports.PageHelper = PageHelper;
