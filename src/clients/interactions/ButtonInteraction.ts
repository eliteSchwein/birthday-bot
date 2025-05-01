import {ChatInputCommandInteraction, Interaction} from "discord.js";
import SetCommand from "../commands/SetCommand";
import EditChannelCommand from "../commands/EditChannelCommand";
import ListCommand from "../commands/ListCommand";
import GuildRepository from "../../repository/GuildRepository";
import {PageHelper} from "../../helper/PageHelper";

export class ButtonInteraction {
    protected guildRepository = new GuildRepository();
    protected pageHelper = new PageHelper();

    public async handleInteraction(interaction: Interaction) {
        if (!interaction.isButton()) {
            return
        }
        const guild = await this.guildRepository.createGuild(interaction.guild)
        const customId = interaction.customId

        if(customId.startsWith("page_")) {
            const newPage = Number.parseInt(customId.replace("page_", ""))

            //await interaction.deferReply()

            const message = await this.pageHelper.generatePage(newPage, guild)

            // @ts-ignore
            await interaction.message.edit(message)

            //await interaction.deleteReply()
            return
        }
    }
}