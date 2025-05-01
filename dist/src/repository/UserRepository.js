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
    async getByDayAndMonth(day, month) {
        return await this.createQueryBuilder('user')
            .leftJoinAndSelect('user.guild', 'guild')
            .where("DAY(user.birthdate) = :day", { day })
            .andWhere("MONTH(user.birthdate) = :month", { month })
            .getMany();
    }
    async getUsersByPage(page, itemsPerPage, guild) {
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
    async countUsersByGuild(guild) {
        return await this.createQueryBuilder('user')
            .leftJoinAndSelect('user.guild', 'guild')
            .where("guild.id = :guildId", { guildId: guild.id })
            .getCount();
    }
}
exports.default = UserRepository;
