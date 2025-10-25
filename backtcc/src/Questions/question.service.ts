import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Questions } from "./entity/question.entity";
import { Repository } from "typeorm";
import { Users } from "src/User/Entity/user.entity";
import { CreateQuestionDto } from "./dto/createQuestion.dto";
import { QuestionImage } from "../questionsImage/Entity/image.entity";

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Questions) private questionRepo: Repository<Questions>,
    @InjectRepository(Users) private userRepo: Repository<Users>,
    @InjectRepository(QuestionImage) private imageRepo: Repository<QuestionImage>, // nova tabela
  ) { }

  async create(idUser: number, dto: CreateQuestionDto, imagePaths: string[]) {
    const user = await this.userRepo.findOne({ where: { id: idUser } });
    if (!user) throw new NotFoundException("Usuario não encontrado");

    const newQuestion = this.questionRepo.create({
      ...dto,
      user,
    });
    const savedQuestion = await this.questionRepo.save(newQuestion);

    if (imagePaths && imagePaths.length > 0) {
      const images = imagePaths.map((url) =>
        this.imageRepo.create({ url, question: savedQuestion }),
      );
      await this.imageRepo.save(images);
      savedQuestion.images = images;
    }

    return savedQuestion;
  }

  findall() {
    return this.questionRepo.find({
      relations: ["user", "images"],
    });
  }

  async findMyQuestions(idUser: number) {
    const questions = await this.questionRepo.find({
      where: {
        user: { id: idUser }
      },
      relations: ['user', 'images'],
    })
    return questions
  }

  async delete(idQuestion: number, userId: number): Promise<{ message: string }> {
    const question = await this.questionRepo.findOne({
      where: { id: idQuestion },
      relations: ["user"],
      select: {
        id: true,
        user: { id: true },
      },
    });
    if (!question) {
      throw new NotFoundException(`Questão com ID ${idQuestion} não encontrada.`);
    }

    const isAuthor = question.user.id === userId;
    if (!isAuthor) {
      throw new UnauthorizedException("Você não tem permissão para excluir esta questão.");
    }

    const deleteResult = await this.questionRepo.delete(idQuestion);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Questão com ID ${idQuestion} não encontrada para exclusão.`);
    }
    return { message: "Questão excluída com sucesso." };
  }

}
