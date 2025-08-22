import { TipoUser } from "src/Enuns/TipoUser.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Users{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column()
    tel: string;

    @Column({
        type: "enum",
        enum: TipoUser,
        default: TipoUser.PRODUTOR
    })
    role: TipoUser;

}