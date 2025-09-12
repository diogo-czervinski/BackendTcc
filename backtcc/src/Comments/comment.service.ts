import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Questions } from "src/Questions/entity/question.entity";
import { Users } from "src/User/Entity/user.entity";
import { Repository } from "typeorm";
import { CreateCommentDto } from "./dto/createComment.dto";
import { Comment } from "./entity/comment.entity";

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment) private commentRepo: Repository<Comment>,
        @InjectRepository(Users) private userRepo: Repository<Users>,
        @InjectRepository(Questions) private questionRepo: Repository<Questions>
    ) { }


    async create(idUser: number, idQuestion: number, dto: CreateCommentDto) {

        const user = await this.userRepo.findOne({ where: { id: idUser } })
        if (!user) throw new NotFoundException("Usuario não encontrado")

        const question = await this.questionRepo.findOne({ where: { id: idQuestion } })
        if (!question) throw new NotFoundException("Questão não encontrada");

        const newComment = this.commentRepo.create({
            ...dto,
            user,
            question
        })

        return await this.commentRepo.save(newComment)
    }

    async findQuestionWithComments(idQuestion: number) {
        return this.questionRepo.findOne({
            where: { id: idQuestion },
            relations: ["user", "comments", "comments.user","images"],
        });
    }
}