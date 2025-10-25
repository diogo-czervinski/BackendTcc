import { PartialType } from "@nestjs/mapped-types";
import { CreateAdsDto } from "./createads.dto";
import { IsArray, IsNumberString, IsOptional } from "class-validator";

export class UpadateAdsDto extends PartialType(CreateAdsDto) {
    
    @IsOptional()
    @IsArray()
    @IsNumberString({}, { each: true }) 
    imagesToDelete?: string[];
}