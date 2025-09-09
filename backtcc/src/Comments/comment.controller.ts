import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { JwtAuthGuard } from "src/Auth/jwt-auth.guard";
import { CreateCommentDto } from "./dto/createComment.dto";

@Controller('comment')
export class CommenstController{
    constructor(private readonly commentService: CommentService){}

    @Post(":idQuestion")
    @UseGuards(JwtAuthGuard)
    create(
        @Param("idQuestion", ParseIntPipe) idQuestion: number,
        @Body() dto: CreateCommentDto,
        @Request() req
     ){
        const userId = req.user.sub
        return this.commentService.create(userId, idQuestion, dto)
    }

    @Get(":idQuestion")
    @UseGuards(JwtAuthGuard)
    findAllCommentsAllQuestion(@Param("idQuestion", ParseIntPipe) idQuestion: number){
        return this.commentService.findAllCommentsForQuestion(idQuestion)
    }
}