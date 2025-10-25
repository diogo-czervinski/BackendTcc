
import { QuestionImage } from 'src/questionsImage/Entity/image.entity';
import { Users } from 'src/User/Entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
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

  @Column()
  localizacao: string;

  @ManyToOne(() => Users, (user) => user.ads) 
  user: Users;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => QuestionImage, (image) => image.ad, { cascade: true })
  images: QuestionImage[];
}