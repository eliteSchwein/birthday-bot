"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.getConnection = getConnection;
exports.isConnected = isConnected;
exports.disconnectDatabase = disconnectDatabase;
exports.purgeLeftUsers = purgeLeftUsers;
const ConfigHelper_1 = require("./ConfigHelper");
const typeorm_1 = require("typeorm");
const GuildEntity_1 = require("../entity/GuildEntity");
const UserEntitiy_1 = require("../entity/UserEntitiy");
const UserRepository_1 = require("../repository/UserRepository");
const LogHelper_1 = require("./LogHelper");
const App_1 = require("../App");
let connection;
async function connectDatabase() {
    const config = (0, ConfigHelper_1.getConfig)(/database/g)[0];
    const AppDataSource = new typeorm_1.DataSource({
        type: config.type,
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.password,
        database: config.database,
        entities: [GuildEntity_1.GuildEntity, UserEntitiy_1.UserEntity],
        synchronize: true
    });
    connection = await AppDataSource.initialize();
    await connection.synchronize();
}
function getConnection() {
    return connection;
}
function isConnected() {
    return connection.isInitialized;
}
async function disconnectDatabase() {
    await connection.destroy();
}
async function purgeLeftUsers() {
    const userRepository = new UserRepository_1.default();
    const users = await userRepository.getAll();
    (0, LogHelper_1.logRegular)('Purge missing users');
    for (const user of users) {
        try {
            const guild = user.guild;
            const guildServer = await (0, App_1.getDiscordClient)().getClient().guilds.fetch(`${guild.id}`);
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
}
