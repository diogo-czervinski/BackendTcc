import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Ad } from "./Entity/ads.entity";
import { Repository } from "typeorm";
import { Users } from "src/User/Entity/user.entity";
import { CreateAdsDto } from "./dto/createads.dto";
import { QuestionImage } from "src/questionsImage/Entity/image.entity";
import { promises } from "dns";
import { UpadateAdsDto } from "./dto/updateads.dto";

@Injectable()
export class AdsService {
    constructor(
        @InjectRepository(Ad) private adsRepo: Repository<Ad>,
        @InjectRepository(Users) private userRepo: Repository<Users>,
        @InjectRepository(QuestionImage) private imageRepo: Repository<QuestionImage>
    ) { }

    async create(id: number, dto: CreateAdsDto, imageFilenames: string[]): Promise<Ad> {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException("Usuário não encontrado");

        const newAd = this.adsRepo.create({
            ...dto,
            user,
        });
        const savedAd = await this.adsRepo.save(newAd);


        if (imageFilenames && imageFilenames.length > 0) {
            const images = imageFilenames.map((filename) =>
                this.imageRepo.create({
                    url: filename,
                    ad: savedAd,
                })
            );

            await this.imageRepo.save(images);
            savedAd.images = images;
        }

        return savedAd;
    }


    findAll() {
        return this.adsRepo.find({
            relations: ['user', "images"],
        })
    }

    async findByUser(userId: number) {
        const ads = await this.adsRepo.find({
            where: {
                user: { id: userId },
            },
            relations: ['user', 'images'],
        });
        return ads;
    }

    async update(adId: number, userId: number, dto: UpadateAdsDto, imageFilenames?: string[]): Promise<Ad> {
        const ad = await this.adsRepo.findOne({ where: { id: adId }, relations: ['user', 'images'] });
        if (!ad) throw new NotFoundException("Anúncio não encontrado");
        if (ad.user.id !== userId) throw new UnauthorizedException("Você não pode editar este anúncio");

        // Atualiza campos de texto (title, description, localizacao, address)
        // Certifique-se que seu DTO permita receber localizacao e address
        // Remova imagesToDelete do DTO antes de usar Object.assign se ele não for uma coluna do Ad
        const { imagesToDelete, ...updateData } = dto;
        Object.assign(ad, updateData);

        // 1. Processar imagens a serem deletadas
        if (imagesToDelete && imagesToDelete.length > 0 && ad.images) {
            // Converte os IDs recebidos (que podem ser strings) para números
            const idsToDelete = imagesToDelete.map(id => Number(id)).filter(id => !isNaN(id));

            // Filtra as imagens que devem ser removidas
            const imagesToRemove = ad.images.filter(img => idsToDelete.includes(img.id));

            if (imagesToRemove.length > 0) {
                await this.imageRepo.remove(imagesToRemove);
                // Atualiza a relação no objeto 'ad' para refletir a remoção
                ad.images = ad.images.filter(img => !idsToDelete.includes(img.id));
            }
        }

        // 2. Processar novas imagens a serem adicionadas
        if (imageFilenames && imageFilenames.length > 0) {
            const newImages = imageFilenames.map(filename =>
                this.imageRepo.create({ url: filename, ad }) // Associa a imagem ao anúncio 'ad'
            );
            await this.imageRepo.save(newImages);

            // Adiciona as novas imagens à lista existente (ou inicia a lista)
            ad.images = ad.images ? [...ad.images, ...newImages] : newImages;
        }

        // Salva o anúncio com todas as alterações (texto, imagens removidas, imagens adicionadas)
        return this.adsRepo.save(ad);
    }

    async delete(idAd: number, userId): Promise<{ message: string }> {
        const ads = await this.adsRepo.findOne({
            where: { id: idAd },
            relations: ["user"],
            select: {
                id: true,
                user: {
                    id: true
                }
            }
        });
        if (!ads) throw new NotFoundException("anuncio não encontrado");

        const isAuthor = ads.user.id === userId;
        if (!isAuthor) throw new UnauthorizedException("Você não tem permição para excluir esse anuncio")

        const deleteResult = await this.adsRepo.delete(idAd);
        if (deleteResult.affected === 0) {
            throw new NotFoundException(`Questão com ID ${idAd} não encontrada para exclusão.`);
        }
        return { message: "Questão excluída com sucesso." };
    }

}
