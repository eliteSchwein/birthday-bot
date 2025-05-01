import {ActivityType, Client, GatewayIntentBits, Partials} from "discord.js";
import {logEmpty, logRegular, logSuccess} from "../helper/LogHelper";
import {REST} from "@discordjs/rest";
import {getConfig} from "../helper/ConfigHelper";
import {registerCommands} from "../helper/CommandHelper";
import {CommandInteraction} from "./interactions/CommandInteraction";
import {ButtonInteraction} from "./interactions/ButtonInteraction";

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
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
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
    }

    public async close() {
        if (typeof this.discordClient === 'undefined') {
            return
        }
        this.discordClient.removeAllListeners()
        await this.discordClient.destroy()
    }
}