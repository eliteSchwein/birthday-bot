import {ChatInputCommandInteraction, Guild, GuildMember, MessageFlagsBitField, User} from "discord.js";
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
            if(this.ephemeral) {
                await interaction.deferReply({flags: [MessageFlagsBitField.Flags.Ephemeral]})
            } else {
                await interaction.deferReply()
            }
        }

        await this.handleCommand(interaction)
    }

    // here we handle the command. what did you expect?
    async handleCommand(interaction: ChatInputCommandInteraction) {

    }
}