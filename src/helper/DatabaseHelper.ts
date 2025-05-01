import {getConfig} from "./ConfigHelper";
import {DataSource} from "typeorm";
import {GuildEntity} from "../entity/GuildEntity";
import {UserEntity} from "../entity/UserEntitiy";

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