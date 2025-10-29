import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { TipoUser } from "src/Enuns/TipoUser.enum";

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    tel: string;

    @IsEnum(TipoUser)
    role: TipoUser;

    @IsOptional()
    avatarUrl?: string;
}