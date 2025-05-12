import UserRepository from "../repository/UserRepository";
import {getDiscordClient} from "../App";
import GuildRepository from "../repository/GuildRepository";
import {logNotice, logWarn} from "./LogHelper";

export function initScheduler() {
    const userRepository = new UserRepository()
    const discordClient = getDiscordClient().getClient()

    setInterval(async () => {
        const time = new Date()

        let users = await userRepository.getAll()

        for (const user of users) {
            try {
                const guild = user.guild;
                const guildServer = await discordClient.guilds.fetch(`${guild.id}`);

                try {
                    await guildServer.members.fetch(`${user.userId}`);
                } catch (error) {
                    if (error.code === 10007) {
                        await userRepository.remove(user)
                        await userRepository.delete(user)
                        logNotice(`Deleted user ${user.userId} (not found in guild)`)
                    } else {
                        logWarn(`Error fetching member ${user.userId}: ${JSON.stringify(error)}`);
                    }
                }
            } catch (guildError) {
                logWarn(`Error processing guild: ${JSON.stringify(guildError)}`);
            }
        }

        const formatter = new Intl.DateTimeFormat('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Europe/Berlin'
        })

        if(formatter.format(time) !== '00:00') {
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