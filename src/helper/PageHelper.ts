import UserRepository from "../repository/UserRepository";
import {GuildEntity} from "../entity/GuildEntity";
import {
    ActionRow, ActionRowBuilder, ButtonBuilder, ButtonComponent,
    ContainerBuilder,
    MessageFlagsBitField,
    SectionBuilder,
    SeparatorBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    ButtonStyle
} from "discord.js";
import {getDiscordClient} from "../App";

export class PageHelper {
    protected userRepository = new UserRepository()
    protected entries = 6

    public async generatePage(pageNumber: number, guild: GuildEntity) {
        const userCount = await this.userRepository.countUsersByGuild(guild)
        const maxPage = Math.ceil(userCount / this.entries)
        const discordClient = getDiscordClient()

        if(pageNumber > maxPage - 1) pageNumber = 0
        if(pageNumber < 0) pageNumber = maxPage - 1

        let entriesLimit = this.entries

        const currentEntries = await this.userRepository.getUsersByPage(pageNumber, entriesLimit, guild)

        const container = new ContainerBuilder()

        if(pageNumber === 0) {
            container.addTextDisplayComponents(new TextDisplayBuilder()
                .setContent("## Die nächsten 3 Geburtstage:")
            )
        }

        let currentIndex = 0

        for(const entry of currentEntries) {
            const user = await discordClient.getClient().users.fetch(`${entry.userId}`)
            const section = new SectionBuilder()

            if(currentIndex === 3 && pageNumber === 0) {
                container.addTextDisplayComponents(new TextDisplayBuilder()
                    .setContent("## Vergangene Geburtstage:")
                )
            }

            const thumbnailBuilder = new ThumbnailBuilder()
                .setURL(user.avatarURL())

            let birthday = `${entry.birthDate.getDate()}.${entry.birthDate.getMonth() + 1}`

            const textBuilder = new TextDisplayBuilder()
                .setContent(
                    [
                        `### ${user.displayName}`,
                        `hat am ${birthday} Geburtstag`
                    ].join('\n'),
                )

            const seperator = new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(1)

            section.setThumbnailAccessory(thumbnailBuilder).addTextDisplayComponents(textBuilder)

            container.addSectionComponents(section)
            //container.addSeparatorComponents(seperator)

            currentIndex++
        }

        const pagination = new TextDisplayBuilder()
            .setContent(`Seite ${pageNumber + 1} von ${maxPage}`)

        container.addTextDisplayComponents(pagination)

        const row = new ActionRowBuilder()

        const nextButton = new ButtonBuilder()
            .setCustomId(`page_${pageNumber + 1}`)
            .setLabel("Weiter")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Secondary)

        const lastButton = new ButtonBuilder()
            .setCustomId(`page_${pageNumber - 1}`)
            .setLabel("Zurück")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary)

        row.addComponents(lastButton, nextButton)

        return {
            components: [container, row],
            flags: MessageFlagsBitField.Flags.IsComponentsV2
        }
    }
}