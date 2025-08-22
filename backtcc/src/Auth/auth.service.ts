import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/User/user.service";
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService{
    constructor (
        private userService: UserService,
        private jwtService: JwtService,
    ){}

    async signIn(email: string, pass: string): Promise<{access_token: string}>{
        const user = await this.userService.findByEmail(email);
        if(!user) throw new UnauthorizedException("Credenciais invalidas")

        
        const isMach = await bcrypt.compare(pass, user.password)
        if(!isMach)throw new UnauthorizedException("credenciais invalidas") 


        const payload = {sub: user.id, email: user.email, role: user.role};
        return{
            access_token: await this.jwtService.signAsync(payload)
        }
        
    }
}