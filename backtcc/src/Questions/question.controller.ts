import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { QuestionService } from "./question.service";
import { JwtAuthGuard } from "src/Auth/jwt-auth.guard";
import { CreateQuestionDto } from "./dto/createQuestion.dto";

@Controller('questions')
export class QuestionController{
    constructor(private readonly questionService: QuestionService){}

    @Post()
    @UseGuards(JwtAuthGuard)
    crete(@Body() dto: CreateQuestionDto, @Request() req){
        const userId = req.user.sub
        return this.questionService.create(userId, dto)
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(){
        return this.questionService.findall()
    }
}