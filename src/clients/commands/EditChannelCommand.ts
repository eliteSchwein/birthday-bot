import BaseCommand from "./BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";

export default class EditChannelCommand extends BaseCommand {
    commandId = 'editchannel'
    ephemeral = true
    defer = true

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const guild = await this.guildRepository.createGuild(interaction.guild)
        const member = await this.guild.members.fetch(this.user.id)
        const channel = interaction.options.getChannel("channel")

        if(!member.permissions.has("Administrator", true)) {
            await interaction.editReply("Du hast nicht die Berechtigung dafür!")
            return
        }

        guild.notificationChannel = BigInt(channel.id)

        await this.guildRepository.save(guild)

        await interaction.editReply(`Der Channel <#${channel.id}> wurde als neuer Benachrichtungs Channel gesetzt.`)
    }
}