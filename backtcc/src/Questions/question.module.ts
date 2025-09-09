import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Questions } from "./entity/question.entity";
import { Users } from "src/User/Entity/user.entity";
import { QuestionService } from "./question.service";
import { QuestionController } from "./question.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Questions, Users])],
    providers: [QuestionService],
    controllers: [QuestionController]
})
export class QuestionModule{}