import {ActivityType, Client, GatewayIntentBits, Partials} from "discord.js";
import {logEmpty, logNotice, logRegular, logSuccess} from "../helper/LogHelper";
import {REST} from "@discordjs/rest";
import {getConfig} from "../helper/ConfigHelper";
import {registerCommands} from "../helper/CommandHelper";
import {CommandInteraction} from "./interactions/CommandInteraction";
import {ButtonInteraction} from "./interactions/ButtonInteraction";
import UserRepository from "../repository/UserRepository";
import GuildRepository from "../repository/GuildRepository";

export class DiscordClient {
    protected discordClient: Client
    protected restClient: REST

    public async connect() {
        const config = getConfig(/^discord$/g)[0]

        logEmpty()
        logSuccess('Load Discord Client...')

        await this.close()

        this.discordClient = new Client({
            intents: [
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.GuildMember,
                Partials.User
            ],
        })

        logRegular('Connect to Discord...')

        this.restClient = new REST({version: '10'}).setToken(config.token)

        await this.discordClient.login(config.token)

        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${this.discordClient.user.id}&permissions=2147535872&scope=bot%20applications.commands`

        logSuccess('Discordbot Connected')
        logSuccess(`Name: ${(this.discordClient.user.tag)}`)
        logSuccess(`Invite: ${inviteUrl}`)

        await registerCommands(this)

        this.registerEvents()
    }

    public isConnected() {
        return this.discordClient.isReady()
    }

    public getClient() {
        return this.discordClient
    }

    public getRest() {
        return this.restClient
    }

    public unregisterEvents() {
        logRegular('Unregister Events...')
        this.discordClient.removeAllListeners()
    }

    private registerEvents() {
        this.discordClient.on('interactionCreate', async interaction => {
            if (interaction.applicationId !== this.discordClient.application.id) {
                return
            }

            await (new CommandInteraction()).handleInteraction(interaction)
            await (new ButtonInteraction()).handleInteraction(interaction)
        })
        this.discordClient.on('guildMemberRemove', async (member) => {
            const userRepository = new UserRepository()
            const guildRepository = new GuildRepository()

            const guild = await guildRepository.findOneBy({id: BigInt(member.guild.id)})

            const user = await userRepository.findOneByUserAndGuild(guild, member.user)

            if(!user) return

            logNotice(`Deleted user ${member.id} (left guild)`)

            await userRepository.remove(user)
            await userRepository.delete(user)
        })
    }

    public async close() {
        if (typeof this.discordClient === 'undefined') {
            return
        }
        this.discordClient.removeAllListeners()
        await this.discordClient.destroy()
    }
}