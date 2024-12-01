import {DataSource, EntityTarget, Repository} from "typeorm";
import {UserEntity} from "../entity/UserEntitiy";
import {getConnection} from "../helper/DatabaseHelper";
import {GuildEntity} from "../entity/GuildEntity";
import {Guild} from "discord.js";
import {logRegular} from "../helper/LogHelper";

export default class GuildRepository extends Repository<GuildEntity>{
    constructor() {
        super(GuildEntity, getConnection().createEntityManager());
    }

    public async createGuild(guild: Guild) {
        const presentGuild = await this.findOneBy({id: BigInt(guild.id)})

        if(presentGuild) {
            return presentGuild
        }

        const newGuild = new GuildEntity()

        newGuild.id = BigInt(guild.id)

        await this.save(newGuild)

        logRegular(`Guild created: ${newGuild.id}`)

        return newGuild
    }
}