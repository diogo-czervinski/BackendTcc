import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "src/User/user.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";

@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.register({
            global: true,
            secret: 'SEGREDO',
            signOptions: { expiresIn: '10h'}
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController]
})
export class AuthModule {}