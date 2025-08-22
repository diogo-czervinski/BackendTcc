import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "./Entity/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { AuthModule } from "src/Auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Users])
    ],
    providers: [UserService],
    controllers: [UserController],
    exports:[UserService]
})
export class UserModule{}
