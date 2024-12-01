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
}