import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';
import { CreateQuestionDto } from './dto/createQuestion.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/questions',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(new Error('Apenas imagens são permitidas!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async create(
    @Body() dto: CreateQuestionDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const userId = req.user.userId;
    const imagePaths = files.map((file) => file.filename);
    return this.questionService.create(userId, dto, imagePaths);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.questionService.findall();
  }

  @Get("/me")
  @UseGuards(JwtAuthGuard)
  findMyQuestions(@Request() req) {
    const userId = req.user.userId;
    return this.questionService.findMyQuestions(userId)
  }

  @Delete(":idQuestion")
  @UseGuards(JwtAuthGuard)
  delete(
    @Param("idQuestion", ParseIntPipe) idQuestion: number,
    @Request() req
  ){
    const userId = req.user.userId;
    return this.questionService.delete(idQuestion, userId)
  }
}
