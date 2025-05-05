import BaseCommand from "./BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {logNotice, logRegular} from "../../helper/LogHelper";

export default class DeleteCommand extends BaseCommand {
    commandId = 'delete'
    ephemeral = true
    defer = true

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const guild = await this.guildRepository.createGuild(interaction.guild)
        const member = await this.guild.members.fetch(this.user.id)
        const targetUser = interaction.options.getUser("user")
        const dataUser = await this.userRepository.findOneByUserAndGuild(guild, targetUser)

        if(!member.permissions.has("Administrator", true)) {
            await interaction.editReply("Du hast nicht die Berechtigung dafür!")
            return
        }

        if(!dataUser) {
            await interaction.editReply(`Der Benutzer ${targetUser.displayName} wurde nicht gefunden!`)
            return
        }

        await this.userRepository.remove(dataUser)
        logNotice(`Deleted user ${dataUser.userId}`)
        await interaction.editReply(`Der Benutzer ${targetUser.displayName} wurde gelöscht!`)
    }
}