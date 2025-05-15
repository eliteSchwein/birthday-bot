import {getConfig} from "./ConfigHelper";
import {DataSource} from "typeorm";
import {GuildEntity} from "../entity/GuildEntity";
import {UserEntity} from "../entity/UserEntitiy";
import UserRepository from "../repository/UserRepository";
import {logNotice, logRegular, logWarn} from "./LogHelper";
import {getDiscordClient} from "../App";

let connection: DataSource

export async function connectDatabase() {
    const config = getConfig(/database/g)[0]

    const AppDataSource = new DataSource({
        type: config.type,
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.password,
        database: config.database,
        entities: [GuildEntity, UserEntity],
        synchronize: true
    })

    connection = await AppDataSource.initialize()
    await connection.synchronize()
}

export function getConnection() {
    return connection
}

export function isConnected() {
    return connection.isInitialized
}

export async function disconnectDatabase() {
    await connection.destroy()
}

export async function purgeLeftUsers() {
    const userRepository = new UserRepository()

    const users = await userRepository.getAll()

    for (const user of users) {
        try {
            const guild = user.guild;
            const guildServer = await getDiscordClient().getClient().guilds.fetch(`${guild.id}`);

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
}