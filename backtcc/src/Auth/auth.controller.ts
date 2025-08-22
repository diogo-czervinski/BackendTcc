import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";

@Controller('/login')
export class AuthController{
    constructor(private readonly authService: AuthService){}

    @Post()
    SignIn(@Body() dto: SignInDto){
        return this.authService.signIn(dto.email, dto.password)
    }


}