import BaseCommand from "./BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";

export default class SetCommand extends BaseCommand {
    commandId = 'set'
    ephemeral = true
    defer = true

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const guild = await this.guildRepository.createGuild(interaction.guild)
        const user = await this.userRepository.createUser(guild, this.user)
        const input = interaction.options.getString("date")

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

        user.showYear = showYear
        user.birthDate = date

        await this.userRepository.save(user)

        await interaction.editReply(`Dein Geburtstag (${input}) wurde eingetragen!.`)
    }
}