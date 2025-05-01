"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const UserEntitiy_1 = require("../entity/UserEntitiy");
const DatabaseHelper_1 = require("../helper/DatabaseHelper");
const LogHelper_1 = require("../helper/LogHelper");
class UserRepository extends typeorm_1.Repository {
    constructor() {
        super(UserEntitiy_1.UserEntity, (0, DatabaseHelper_1.getConnection)().createEntityManager());
    }
    async createUser(guild, user) {
        const presentUser = await this.findOneBy({ userId: BigInt(user.id) });
        if (presentUser) {
            return presentUser;
        }
        const newUser = new UserEntitiy_1.UserEntity();
        newUser.userId = BigInt(user.id);
        newUser.guild = guild;
        await this.save(newUser);
        (0, LogHelper_1.logRegular)(`User created: ${newUser.userId}`);
        return newUser;
    }
    async getAll() {
        return await this.createQueryBuilder('user')
            .leftJoinAndSelect('user.guild', 'guild')
            .getMany();
    }
    async getByDayAndMonth(day, month) {
        return await this.createQueryBuilder('user')
            .leftJoinAndSelect('user.guild', 'guild')
            .where("DAY(user.birthdate) = :day", { day })
            .andWhere("MONTH(user.birthdate) = :month", { month })
            .getMany();
    }
    async getUsersByPage(page, itemsPerPage, guild) {
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
        }
        else {
            return await remainingQuery
                .skip((page * itemsPerPage) - 1)
                .take(itemsPerPage)
                .getMany();
        }
    }
    async countUsersByGuild(guild) {
        return await this.createQueryBuilder('user')
            .leftJoinAndSelect('user.guild', 'guild')
            .where("guild.id = :guildId", { guildId: guild.id })
            .getCount();
    }
}
exports.default = UserRepository;
