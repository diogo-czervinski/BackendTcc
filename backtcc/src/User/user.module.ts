import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "./Entity/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { Questions } from "src/Questions/entity/question.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Users, Questions])
    ],
    providers: [UserService],
    controllers: [UserController],
    exports:[UserService]
})
export class UserModule{}
