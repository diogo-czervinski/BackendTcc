import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/User/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private userService: UserService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'SEGREDO'
        })
    }

    async validate(payload: any){
        return{userId: payload.sub, role: payload.role}
        console.log(payload)
    }
}