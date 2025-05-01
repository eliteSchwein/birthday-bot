import UserRepository from "../repository/UserRepository";
import {getDiscordClient} from "../App";
import GuildRepository from "../repository/GuildRepository";

export function initScheduler() {
    const userRepository = new UserRepository()
    const discordClient = getDiscordClient().getClient()

    setInterval(async () => {
        const time = new Date()

        let users = await userRepository.getAll()

        for(const user of users) {
            const guild = user.guild
            const guildServer = await discordClient.guilds.fetch(`${guild.id}`)
            const guildUser = await guildServer.members.fetch(`${user.userId}`)

            if(guildUser) {
                continue
            }

            await userRepository.delete(user)
        }

        if(time.getHours() !== 5 || time.getMinutes() !== 0) {
            return
        }

        users = await userRepository.getByDayAndMonth(
            time.getUTCDate(),
            time.getUTCMonth() + 1,
        )

        for(const user of users) {
            const guild = user.guild

            if(!guild.notificationChannel) continue

            const channel = await discordClient.channels.fetch(`${guild.notificationChannel}`)

            if(!channel.isSendable()) continue

            await channel.sendTyping()

            const birthDate = user.birthDate

            if(!user.showYear) {
                await channel.send(`<@${user.userId}> hat heute Geburtstag! 🎂`)
                continue
            }

            await channel.send(`<@${user.userId}> wird heute ${time.getFullYear() - birthDate.getFullYear()}! 🎂`)
        }
    }, 60_000)
}