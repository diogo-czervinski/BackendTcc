import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Ad } from "./Entity/ads.entity";
import { Repository } from "typeorm";
import { Users } from "src/User/Entity/user.entity";
import { CreateAdsDto } from "./dto/createads.dto";

@Injectable()
export class AdsService {
    constructor(
        @InjectRepository(Ad) private adsRepo: Repository<Ad>,
        @InjectRepository(Users) private userRepo: Repository<Users>
    ) { }

    async create(id: number, dto: CreateAdsDto): Promise<Ad> {

        const user = await this.userRepo.findOne({ where: { id } })

        if (!user) throw new NotFoundException("Usuario não encontrado")

        const newAd = this.adsRepo.create({
            ...dto,
            user: user,
        })

        return this.adsRepo.save(newAd)
    }

    findAll() {
        return this.adsRepo.find({
            relations: ['user'],
        })
    }

    async findById(id: number) {
        const ad = await this.adsRepo.findOne({ where: { id }, relations: ['user'] })
        if (!ad) throw new NotFoundException("Anuncio não encontrado")

        return ad;
    }
}
