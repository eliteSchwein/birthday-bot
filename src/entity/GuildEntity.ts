import {Entity, Column, PrimaryColumn, OneToMany} from "typeorm"
import {UserEntity} from "./UserEntitiy";

@Entity()
export class GuildEntity {
    @PrimaryColumn({type: 'bigint'})
    id: bigint

    @Column({nullable: true, type: 'bigint'})
    notificationChannel: bigint|null

    @OneToMany(() => UserEntity, (user) => user.guild)
    users: UserEntity[]
}