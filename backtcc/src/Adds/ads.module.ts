import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ad } from "./Entity/ads.entity";
import { Users } from "src/User/Entity/user.entity";
import { AdsService } from "./ads.service";
import { AdsController } from "./ads.controller";
import { QuestionImage } from "src/questionsImage/Entity/image.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Ad, Users, QuestionImage])],
    providers: [AdsService],
    controllers: [AdsController]
})
export class AdsModule {}