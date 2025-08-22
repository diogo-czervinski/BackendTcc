
import { Users } from 'src/User/Entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Ad { 
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string; 

  @Column()
  description: string; 

  @ManyToOne(() => Users, (user) => user.ads) 
  user: Users;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}