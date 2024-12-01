import {ChatInputCommandInteraction, Guild, GuildMember, User} from "discord.js";
import UserRepository from "../../repository/UserRepository";
import GuildRepository from "../../repository/GuildRepository";

export default class BaseCommand {
    commandId: string
    ephemeral = false
    defer = true
    protected guild: Guild|undefined
    protected user: User|undefined
    protected userRepository = new UserRepository()
    protected guildRepository = new GuildRepository()

    public async executeCommand(interaction: ChatInputCommandInteraction, commandId: string) {
        if (commandId !== this.commandId) {
            return
        }

        if(!interaction.guild) return

        this.guild = interaction.guild
        this.user = interaction.user

        if (this.defer) {
            await interaction.deferReply({ephemeral: this.ephemeral})
        }

        await this.handleCommand(interaction)
    }

    // here we handle the command. what did you expect?
    async handleCommand(interaction: ChatInputCommandInteraction) {

    }
}