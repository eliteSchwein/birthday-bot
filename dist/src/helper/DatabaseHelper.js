"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.getConnection = getConnection;
exports.isConnected = isConnected;
exports.disconnectDatabase = disconnectDatabase;
const ConfigHelper_1 = require("./ConfigHelper");
const typeorm_1 = require("typeorm");
const GuildEntity_1 = require("../entity/GuildEntity");
const UserEntitiy_1 = require("../entity/UserEntitiy");
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
