import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/createuser.dto";
import { UpdateUserDto } from "./dto/updateuser.dto";
import { JwtAuthGuard } from "src/Auth/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from 'path';

@Controller('/user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './uploads/avatars',
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
        @Body() dto: CreateUserDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const avatarUrl = file ? `/uploads/avatars/${file.filename}` : undefined; // <-- path completo!
        return this.userService.create({ ...dto, avatarUrl });
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.userService.findAll()
    }

    @Get(':id')
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findById(id)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    updateUserById(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserDto,
        @Request() req,
    ) {
        return this.userService.update(id, dto, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch()
    update(@Request() req, @Body() dto: UpdateUserDto) {
        const userIdFromTokem = req.user.userId;
        return this.userService.update(userIdFromTokem, dto, req.user)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.userService.delete(id)
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile/me')
    getProfile(@Request() req) {
        const userId = req.user.userId;
        return this.userService.findById(userId);
    }
}