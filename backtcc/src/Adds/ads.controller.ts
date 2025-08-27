import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { AdsService } from "./ads.service";
import { CreateAdsDto } from "./dto/createads.dto";
import { JwtAuthGuard } from "src/Auth/jwt-auth.guard";
import { RolesGuard } from "src/Auth/roles.guard";
import { Roles } from "src/Auth/roles.decorator";
import { TipoUser } from "src/Enuns/TipoUser.enum";

@Controller('ads')
export class AdsController{
    constructor(private readonly adsService: AdsService){}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(TipoUser.PRODUTOR)
    create(@Body() dto: CreateAdsDto, @Request() req){
        const userId = req.user.userId;
        return this.adsService.create(userId, dto)
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('TAREFEIRO')
    findAll(){
        return this.adsService.findAll()
    }
}