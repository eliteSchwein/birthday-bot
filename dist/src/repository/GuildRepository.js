"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const DatabaseHelper_1 = require("../helper/DatabaseHelper");
const GuildEntity_1 = require("../entity/GuildEntity");
const LogHelper_1 = require("../helper/LogHelper");
class GuildRepository extends typeorm_1.Repository {
    constructor() {
        super(GuildEntity_1.GuildEntity, (0, DatabaseHelper_1.getConnection)().createEntityManager());
    }
    async createGuild(guild) {
        const presentGuild = await this.findOneBy({ id: BigInt(guild.id) });
        if (presentGuild) {
            return presentGuild;
        }
        const newGuild = new GuildEntity_1.GuildEntity();
        newGuild.id = BigInt(guild.id);
        await this.save(newGuild);
        (0, LogHelper_1.logRegular)(`Guild created: ${newGuild.id}`);
        return newGuild;
    }
}
exports.default = GuildRepository;
