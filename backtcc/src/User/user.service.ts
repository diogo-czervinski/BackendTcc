import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
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
        if (userFromTokem.role !== "ADIMIN" && userFromTokem.userId !== id) {
            throw new ForbiddenException("Voce não tem permição para atualizar esse perfil")
        }

        const user = await this.userRepo.preload({
            id: id,
            ...dto,
        })

        if (!user) {
            throw new NotFoundException("Usuario não encontrado")
        }

        return this.userRepo.save(user) + ("Usuario " + user.name + "atualizado com sucesso");
    }

    async delete(id: number) {
        const user = await this.userRepo.findOne({ where: { id } })
        if (!user) throw new NotFoundException("Usuario não encontrado")

        await this.userRepo.remove(user)
        return ("Usuario removido com sucesso")
    }

    async findByEmail(email: string) {
        return await this.userRepo.findOne({ where: { email } });
    }


}