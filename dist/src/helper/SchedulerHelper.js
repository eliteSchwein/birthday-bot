"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduler = initScheduler;
const UserRepository_1 = require("../repository/UserRepository");
const App_1 = require("../App");
const LogHelper_1 = require("./LogHelper");
function initScheduler() {
    const userRepository = new UserRepository_1.default();
    const discordClient = (0, App_1.getDiscordClient)().getClient();
    setInterval(async () => {
        const time = new Date();
        let users = await userRepository.getAll();
        for (const user of users) {
            try {
                const guild = user.guild;
                const guildServer = await discordClient.guilds.fetch(`${guild.id}`);
                try {
                    await guildServer.members.fetch(`${user.userId}`);
                }
                catch (error) {
                    if (error.code === 10007) {
                        await userRepository.remove(user);
                        await userRepository.delete(user);
                        (0, LogHelper_1.logNotice)(`Deleted user ${user.userId} (not found in guild)`);
                    }
                    else {
                        (0, LogHelper_1.logWarn)(`Error fetching member ${user.userId}: ${JSON.stringify(error)}`);
                    }
                }
            }
            catch (guildError) {
                (0, LogHelper_1.logWarn)(`Error processing guild: ${JSON.stringify(guildError)}`);
            }
        }
        if (time.getHours() !== 5 || time.getMinutes() !== 0) {
            return;
        }
        users = await userRepository.getByDayAndMonth(time.getUTCDate(), time.getUTCMonth() + 1);
        for (const user of users) {
            const guild = user.guild;
            if (!guild.notificationChannel)
                continue;
            const channel = await discordClient.channels.fetch(`${guild.notificationChannel}`);
            if (!channel.isSendable())
                continue;
            await channel.sendTyping();
            const birthDate = user.birthDate;
            if (!user.showYear) {
                await channel.send(`<@${user.userId}> hat heute Geburtstag! 🎂`);
                continue;
            }
            await channel.send(`<@${user.userId}> wird heute ${time.getFullYear() - birthDate.getFullYear()}! 🎂`);
        }
    }, 60_000);
}
