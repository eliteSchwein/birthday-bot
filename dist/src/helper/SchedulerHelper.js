"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduler = initScheduler;
const UserRepository_1 = require("../repository/UserRepository");
const App_1 = require("../App");
const DatabaseHelper_1 = require("./DatabaseHelper");
function initScheduler() {
    const userRepository = new UserRepository_1.default();
    const discordClient = (0, App_1.getDiscordClient)().getClient();
    setInterval(async () => {
        const time = new Date();
        await (0, DatabaseHelper_1.purgeLeftUsers)();
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
        const users = await userRepository.getByDayAndMonth(day, month);
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
