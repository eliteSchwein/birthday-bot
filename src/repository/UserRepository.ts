import {Repository} from "typeorm";
import {UserEntity} from "../entity/UserEntitiy";
import {getConnection} from "../helper/DatabaseHelper";
import {User} from "discord.js";
import {GuildEntity} from "../entity/GuildEntity";
import {logRegular} from "../helper/LogHelper";

export default class UserRepository extends Repository<UserEntity>{
    constructor() {
        super(UserEntity, getConnection().createEntityManager());
    }

    public async createUser(guild: GuildEntity, user: User) {
        const presentUser = await this.findOneBy({userId: BigInt(user.id)})

        if(presentUser) {
            return presentUser
        }

        const newUser = new UserEntity();

        newUser.userId = BigInt(user.id)
        newUser.guild = guild

        await this.save(newUser)

        logRegular(`User created: ${newUser.userId}`)

        return newUser
    }

    public async getByDayAndMonth(day: number, month: number) {
        return await this.createQueryBuilder(
                'user'
            )
            .leftJoinAndSelect('user.guild', 'guild')
            .where("DAY(user.birthdate) = :day", { day })
            .andWhere("MONTH(user.birthdate) = :month", { month })
            .getMany()
    }

    public async getUsersByPage(page: number, itemsPerPage: number, guild: GuildEntity) {
        return await this.createQueryBuilder('user')
            .leftJoinAndSelect('user.guild', 'guild')
            .where('guild.id = :guildId', { guildId: guild.id })
            .addSelect(`
            CASE
                WHEN DAYOFYEAR(DATE(CONCAT(YEAR(CURDATE()), '-', MONTH(user.birthDate), '-', DAY(user.birthDate)))) >= DAYOFYEAR(CURDATE())
                THEN DAYOFYEAR(DATE(CONCAT(YEAR(CURDATE()), '-', MONTH(user.birthDate), '-', DAY(user.birthDate))))
                ELSE DAYOFYEAR(DATE(CONCAT(YEAR(CURDATE())+1, '-', MONTH(user.birthDate), '-', DAY(user.birthDate))))
            END`, 'nextBirthdayDayOfYear')
            .orderBy('nextBirthdayDayOfYear', 'ASC')
            .skip(page * itemsPerPage)
            .take(itemsPerPage)
            .getMany();
    }

    public async countUsersByGuild(guild: GuildEntity) {
        return await this.createQueryBuilder(
            'user'
        )
            .leftJoinAndSelect('user.guild', 'guild')
            .where("guild.id = :guildId", { guildId: guild.id })
            .getCount()
    }
}