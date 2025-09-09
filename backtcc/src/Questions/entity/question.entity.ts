import { Comment } from "src/Comments/entity/comment.entity";
import { Users } from "src/User/Entity/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Questions{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Users, (user) => user.questions) 
    user: Users;

    @OneToMany(()=> Comment, comments => comments.question)
    comments: Comment[];
}