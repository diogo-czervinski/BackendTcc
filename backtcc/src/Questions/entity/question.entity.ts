import { Users } from "src/User/Entity/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
}