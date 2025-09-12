import { Ad } from "src/Adds/Entity/ads.entity";
import { Comment } from "src/Comments/entity/comment.entity";
import { TipoUser } from "src/Enuns/TipoUser.enum";
import { Questions } from "src/Questions/entity/question.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
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

    @OneToMany(() => Ad, (ads) => ads.user)
    ads: Ad[];

    @OneToMany(() => Questions, questions => questions.user)
    questions: Questions[];

    @OneToMany(() => Comment, comments => comments.user)
    comments: Comment[];



}