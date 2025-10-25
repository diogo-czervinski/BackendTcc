import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateAdsDto {
    
    @IsString({ message: 'O título deve ser um texto.' })
    @IsNotEmpty({ message: 'O título não pode estar vazio.' })
    @MinLength(5, { message: 'O título deve ter no mínimo 5 caracteres.' })
    title: string;

    @IsString({ message: 'A descrição deve ser um texto.' })
    @IsNotEmpty({ message: 'A descrição não pode estar vazia.' })
    description: string;

    @IsNotEmpty({ message: 'não pode estar vazio.' })
    localizacao: string;
}