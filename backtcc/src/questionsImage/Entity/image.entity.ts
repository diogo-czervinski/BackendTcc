import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Questions } from "../../Questions/entity/question.entity";
import { Ad } from "src/Adds/Entity/ads.entity";

@Entity()
export class QuestionImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string; 

  @ManyToOne(() => Questions, (question) => question, { onDelete: "CASCADE" })
  question: Questions;

  @ManyToOne(() => Ad, (ad) => ad, { onDelete: "CASCADE" })
  ad: Ad;
  
}
