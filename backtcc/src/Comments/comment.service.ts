import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Questions } from "src/Questions/entity/question.entity";
import { Users } from "src/User/Entity/user.entity";
import { Repository } from "typeorm";
import { CreateCommentDto } from "./dto/createComment.dto";
import { Comment } from "./entity/comment.entity";
import { CommentGateway } from "./comment.gateway";

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment) private commentRepo: Repository<Comment>,
        @InjectRepository(Users) private userRepo: Repository<Users>,
        @InjectRepository(Questions) private questionRepo: Repository<Questions>,
        private readonly commentGateway: CommentGateway
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

        const savedComment = await this.commentRepo.save(newComment);

        if (question.user && question.user.id !== idUser) {
            this.commentGateway.sendNotificationToUser(
                question.user.id.toString(),
                {
                    title: 'Novo comentário!',
                    body: `${user.name} comentou na sua pergunta: ${dto.text}`,
                },
            );
        }



        return savedComment;
    }

    async findQuestionWithComments(idQuestion: number) {
        return this.questionRepo.findOne({
            where: { id: idQuestion },
            relations: ["user", "comments", "comments.user", "images"],
        });
    }


    async delete(commentId: number, userId: number): Promise<{ message: string }> {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
            relations: ["user", "question", "question.user"],
            select: {
                id: true,
                user: true,
                question: {
                    id: true,
                    user: true,
                }
            }
        });

        if (!comment) {
            throw new NotFoundException(`Comentário com ID ${commentId} não encontrado.`);
        }

        const isCommentAuthor = comment.user.id === userId;
        const isQuestionAuthor = comment.question?.user.id === userId;

        if (!isCommentAuthor && !isQuestionAuthor) {
            throw new UnauthorizedException("Você não tem permissão para excluir este comentário.");
        }

        const deleteResult = await this.commentRepo.delete(commentId);

        if (deleteResult.affected === 0) {
            throw new NotFoundException(`Comentário com ID ${commentId} não encontrado para exclusão.`);
        }

        return { message: "Comentário excluído com sucesso." };
    }
}