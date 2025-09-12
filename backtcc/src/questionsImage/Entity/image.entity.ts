import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Questions } from "../../Questions/entity/question.entity";

@Entity()
export class QuestionImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string; // caminho no servidor ou S3

  @ManyToOne(() => Questions, (question) => question, { onDelete: "CASCADE" })
  question: Questions;
}
