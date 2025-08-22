import { PartialType } from "@nestjs/mapped-types";
import { CreateAdsDto } from "./createads.dto";

export class UpadateAdsDto extends PartialType(CreateAdsDto){}