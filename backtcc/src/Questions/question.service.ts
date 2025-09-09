import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Questions } from "./entity/question.entity";
import { Repository } from "typeorm";
import { Users } from "src/User/Entity/user.entity";
import { CreateQuestionDto } from "./dto/createQuestion.dto";

@Injectable()
export class QuestionService {
    constructor(
        @InjectRepository(Questions) private questionRepo: Repository<Questions>,
        @InjectRepository(Users) private userRepo: Repository<Users>
    ) { }

    async create(idUser: number, dto: CreateQuestionDto) {

        const user = await this.userRepo.findOne({ where: { id: idUser } })
        if (!user) throw new NotFoundException("Usuario não encontrado")

        const newQuestion = this.questionRepo.create({
            ...dto,
            user
        })

        return await this.questionRepo.save(newQuestion)
    }
}