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

    public async getAll() {
        return await this.createQueryBuilder(
            'user'
        )
            .leftJoinAndSelect('user.guild', 'guild')
            .getMany()
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
        const upcoming = await this.createQueryBuilder('user')
            .leftJoinAndSelect('user.guild', 'guild')
            .where('guild.id = :guildId', { guildId: guild.id })
            .andWhere(`
            (MONTH(user.birthDate) > MONTH(CURRENT_DATE)) OR
            (MONTH(user.birthDate) = MONTH(CURRENT_DATE) AND DAY(user.birthDate) >= DAY(CURRENT_DATE))
        `)
            .addSelect('MONTH(user.birthDate)', 'birthMonth')
            .addSelect('DAY(user.birthDate)', 'birthDay')
            .orderBy('birthMonth', 'ASC')
            .addOrderBy('birthDay', 'ASC')
            .take(3)
            .getMany();

        const remainingQuery = this.createQueryBuilder('user')
            .leftJoinAndSelect('user.guild', 'guild')
            .where('guild.id = :guildId', { guildId: guild.id })
            .addSelect(`
            CASE
                WHEN (MONTH(user.birthDate) > MONTH(CURRENT_DATE)) OR
                     (MONTH(user.birthDate) = MONTH(CURRENT_DATE) AND DAY(user.birthDate) >= DAY(CURRENT_DATE))
                THEN (MONTH(user.birthDate) * 100 + DAY(user.birthDate))  -- Upcoming: sort ascending
                ELSE (MONTH(user.birthDate) * 100 + DAY(user.birthDate)) * -1  -- Past: sort descending (negative)
            END`, 'sortableDate')
            .orderBy('sortableDate', 'ASC');

        if (upcoming.length > 0) {
            remainingQuery.andWhere('user.id NOT IN (:...upcomingIds)', {
                upcomingIds: upcoming.map(u => u.id)
            });
        }

        if (page === 0) {
            const remaining = await remainingQuery
                .take(itemsPerPage - upcoming.length)
                .getMany();
            return [...upcoming, ...remaining].slice(0, itemsPerPage);
        } else {
            return await remainingQuery
                .skip((page * itemsPerPage) - 3)
                .take(itemsPerPage)
                .getMany();
        }
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