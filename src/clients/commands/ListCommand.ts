import BaseCommand from "./BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {PageHelper} from "../../helper/PageHelper";

export default class ListCommand extends BaseCommand {
    commandId = 'list'
    defer = true

    protected pageHelper = new PageHelper()

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const guild = await this.guildRepository.createGuild(interaction.guild)

        if(!guild) {
            await interaction.editReply("Der Befehl ist nur auf Server Verfügbar!")
            return
        }

        const message = await this.pageHelper.generatePage(0, guild)

        // @ts-ignore
        await interaction.editReply(message)
    }
}