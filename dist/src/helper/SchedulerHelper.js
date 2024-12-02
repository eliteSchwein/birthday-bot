"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduler = initScheduler;
const UserRepository_1 = require("../repository/UserRepository");
const App_1 = require("../App");
function initScheduler() {
    const userRepository = new UserRepository_1.default();
    const discordClient = (0, App_1.getDiscordClient)().getClient();
    setInterval(async () => {
        const time = new Date();
        if (time.getHours() !== 5 || time.getMinutes() !== 0) {
            return;
        }
        const users = await userRepository.getByDayAndMonth(time.getUTCDate(), time.getUTCMonth() + 1);
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
