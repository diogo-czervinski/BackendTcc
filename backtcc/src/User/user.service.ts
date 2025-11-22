import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "./Entity/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/createuser.dto";
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from "./dto/updateuser.dto";

@Injectable()
export class UserService {

    constructor(@InjectRepository(Users) private userRepo: Repository<Users>) { }

    async create(dto: CreateUserDto) {
        const existing = await this.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('E-mail já cadastrado');
        }

        const sal = 10;
        const hashsenha = await bcrypt.hash(dto.password, sal);

        const user = this.userRepo.create({
            ...dto,
            password: hashsenha,
            avatarUrl: dto.avatarUrl,
        });

        return this.userRepo.save(user);
    }
    findAll() {
        return this.userRepo.find()
    }

    async findById(id: number) {
        const user = await this.userRepo.findOne({ where: { id } })
        if (!user) throw new NotFoundException("usuario não encontrado")

        return user;
    }

    async update(id: number, dto: UpdateUserDto, userFromTokem: any) {
        if (userFromTokem.userId !== id && userFromTokem.role !== "ADMIN") {
            throw new UnauthorizedException("Usuário não autorizado");
        }

        const user = await this.userRepo.preload({
            id,
            ...dto,
        });

        if (!user) {
            throw new NotFoundException("Usuário não encontrado");
        }

        return this.userRepo.save(user); // ← antes estava errado!
    }


    async delete(id: number, userFromToken: any) {
        if (userFromToken.userId !== id && userFromToken.role !== "ADMIN") {
            throw new UnauthorizedException("Usuário não autorizado");
        }

        await this.userRepo.delete(id);
        return { message: "Usuário deletado com sucesso" };
    }

    async findByEmail(email: string) {
        return await this.userRepo.findOne({ where: { email } });
    }


}