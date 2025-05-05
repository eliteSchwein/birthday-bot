import BaseCommand from "./BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";

export default class SetOtherCommand extends BaseCommand {
    commandId = 'set_other'
    ephemeral = true
    defer = true

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const guild = await this.guildRepository.createGuild(interaction.guild)
        const member = await this.guild.members.fetch(this.user.id)
        const targetUser = interaction.options.getUser("user")
        const input = interaction.options.getString("date")

        if(!member.permissions.has("Administrator", true)) {
            await interaction.editReply("Du hast nicht die Berechtigung dafür!")
            return
        }

        const dataUser = await this.userRepository.createUser(guild, targetUser)
        const parts = input.split(".")

        if (parts.length < 2) {
            await interaction.editReply("Das eingegebene Datum ist ungültig, bitte im Format TT.MM.JJJJ (Jahr ist optional).")
            return
        }

        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1
        let year = parts.length === 3 ? parseInt(parts[2], 10) : 1990
        let showYear = parts.length === 3

        if(isNaN(year)) {
            year = 1990
            showYear = false
        }

        if (isNaN(day) || isNaN(month)) {
            await interaction.editReply("Das eingegebene Datum ist ungültig, bitte im Format TT.MM.JJJJ (Jahr ist optional).")
            return
        }

        const date = new Date(Date.UTC(year, month, day, 0, 0, 0))

        dataUser.showYear = showYear
        dataUser.birthDate = date

        await this.userRepository.save(dataUser)

        await interaction.editReply(`Der Geburtstag (${input}) von ${targetUser.displayName} wurde eingetragen!.`)
    }
}