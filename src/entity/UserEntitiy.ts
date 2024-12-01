import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, ManyToOne} from "typeorm"
import {GuildEntity} from "./GuildEntity";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: 'bigint'})
    userId: bigint

    @ManyToOne(() => GuildEntity, (guild) => guild.users)
    guild: GuildEntity

    @Column({nullable: true})
    birthDate: Date|null

    @Column()
    showYear: boolean = false
}