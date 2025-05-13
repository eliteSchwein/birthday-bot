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
        const formatter = new Intl.DateTimeFormat('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Europe/Berlin'
        });
        if (formatter.format(time) !== '00:00') {
            return;
        }
        const dateFormatter = new Intl.DateTimeFormat('de-DE', {
            day: '2-digit',
            month: '2-digit',
            timeZone: 'Europe/Berlin'
        });
        const [dayStr, monthStr] = dateFormatter.format(time).split('.');
        const day = parseInt(dayStr, 10);
        const month = parseInt(monthStr, 10);
        users = await userRepository.getByDayAndMonth(day, month);
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
