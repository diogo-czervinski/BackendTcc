import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Questions } from "./entity/question.entity";
import { Users } from "src/User/Entity/user.entity";
import { QuestionService } from "./question.service";
import { QuestionController } from "./question.controller";
import { QuestionImage } from "src/questionsImage/Entity/image.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Questions, Users, QuestionImage])],
    providers: [QuestionService],
    controllers: [QuestionController]
})
export class QuestionModule{}