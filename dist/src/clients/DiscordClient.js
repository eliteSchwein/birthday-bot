"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordClient = void 0;
const discord_js_1 = require("discord.js");
const LogHelper_1 = require("../helper/LogHelper");
const rest_1 = require("@discordjs/rest");
const ConfigHelper_1 = require("../helper/ConfigHelper");
const CommandHelper_1 = require("../helper/CommandHelper");
const CommandInteraction_1 = require("./interactions/CommandInteraction");
const ButtonInteraction_1 = require("./interactions/ButtonInteraction");
const UserRepository_1 = require("../repository/UserRepository");
class DiscordClient {
    discordClient;
    restClient;
    async connect() {
        const config = (0, ConfigHelper_1.getConfig)(/^discord$/g)[0];
        (0, LogHelper_1.logEmpty)();
        (0, LogHelper_1.logSuccess)('Load Discord Client...');
        await this.close();
        this.discordClient = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.GuildMembers
            ],
            partials: [
                discord_js_1.Partials.Message,
                discord_js_1.Partials.Channel,
                discord_js_1.Partials.GuildMember,
                discord_js_1.Partials.User
            ],
        });
        (0, LogHelper_1.logRegular)('Connect to Discord...');
        this.restClient = new rest_1.REST({ version: '10' }).setToken(config.token);
        await this.discordClient.login(config.token);
        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${this.discordClient.user.id}&permissions=2147535872&scope=bot%20applications.commands`;
        (0, LogHelper_1.logSuccess)('Discordbot Connected');
        (0, LogHelper_1.logSuccess)(`Name: ${(this.discordClient.user.tag)}`);
        (0, LogHelper_1.logSuccess)(`Invite: ${inviteUrl}`);
        await (0, CommandHelper_1.registerCommands)(this);
        this.registerEvents();
    }
    isConnected() {
        return this.discordClient.isReady();
    }
    getClient() {
        return this.discordClient;
    }
    getRest() {
        return this.restClient;
    }
    unregisterEvents() {
        (0, LogHelper_1.logRegular)('Unregister Events...');
        this.discordClient.removeAllListeners();
    }
    registerEvents() {
        this.discordClient.on('interactionCreate', async (interaction) => {
            if (interaction.applicationId !== this.discordClient.application.id) {
                return;
            }
            await (new CommandInteraction_1.CommandInteraction()).handleInteraction(interaction);
            await (new ButtonInteraction_1.ButtonInteraction()).handleInteraction(interaction);
        });
        this.discordClient.on('guildMemberRemove', async (member) => {
            const userRepository = new UserRepository_1.default();
            const userEntries = await userRepository.findByUserId(Number.parseInt(member.id));
            if (!userEntries)
                return;
            (0, LogHelper_1.logNotice)(`Deleted user ${member.id} (left guild)`);
            for (const user of userEntries) {
                await userRepository.remove(user);
                await userRepository.delete(user);
            }
        });
    }
    async close() {
        if (typeof this.discordClient === 'undefined') {
            return;
        }
        this.discordClient.removeAllListeners();
        await this.discordClient.destroy();
    }
}
exports.DiscordClient = DiscordClient;
