import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Questions } from "src/Questions/entity/question.entity";
import { Users } from "src/User/Entity/user.entity";
import { CommentService } from "./comment.service";
import { CommenstController } from "./comment.controller";
import { Comment } from "./entity/comment.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Comment, Questions, Users])],
    providers:[CommentService],
    controllers: [CommenstController]
})
export class CommentModule{}