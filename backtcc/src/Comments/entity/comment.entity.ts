import { Questions } from "src/Questions/entity/question.entity";
import { Users } from "src/User/Entity/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comment{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(()=> Users, (user) => user.comments)
    user: Users;

    @ManyToOne(()=> Questions, (question) => question.comments)
    question: Comment;
}