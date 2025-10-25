import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { AdsService } from "./ads.service";
import { CreateAdsDto } from "./dto/createads.dto";
import { JwtAuthGuard } from "src/Auth/jwt-auth.guard";
import { RolesGuard } from "src/Auth/roles.guard";
import { Roles } from "src/Auth/roles.decorator";
import { TipoUser } from "src/Enuns/TipoUser.enum";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from 'path';
import { UpadateAdsDto } from "./dto/updateads.dto";

@Controller('ads')
export class AdsController {
    constructor(private readonly adsService: AdsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(TipoUser.PRODUTOR)
    @UseInterceptors(
        FilesInterceptor('images', 5, {
            storage: diskStorage({
                destination: './uploads/ads', // pasta para anúncios
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
        @Body() dto: CreateAdsDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req,
    ) {
        const userId = req.user.userId;
        const imagePaths = files.map((file) => file.filename); // pega os nomes dos arquivos
        return this.adsService.create(userId, dto, imagePaths); // chama o service adaptado
    }


    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('TAREFEIRO')
    findAll() {
        return this.adsService.findAll()
    }
    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMyAds(@Request() req) {
        const userId = req.user.userId;
        return this.adsService.findByUser(userId);
    }

    @Patch(':idAd')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(TipoUser.PRODUTOR)
    @UseInterceptors(
        FilesInterceptor('images', 5, {
            storage: diskStorage({
                destination: './uploads/ads',
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
        })
    )
    async update(
        @Param('idAd', ParseIntPipe) idAd: number,
        @Request() req,
        @Body() dto: UpadateAdsDto,
        @UploadedFiles() files?: Express.Multer.File[]
    ) {
        const userId = req.user.userId;
        const imagePaths = files?.map(f => f.filename) || [];
        return this.adsService.update(idAd, userId, dto, imagePaths);
    }

    @Delete(":idAd")
    @UseGuards(JwtAuthGuard)
    delete(
        @Param("idAd", ParseIntPipe) idAd: number,
        @Request() req
    ) {
        const userId = req.user.userId;
        return this.adsService.delete(idAd, userId)
    }
}