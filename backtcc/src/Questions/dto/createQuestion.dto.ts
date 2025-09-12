import { IsString, IsUrl, isURL } from "class-validator";

export class CreateQuestionDto{
    @IsString()
    text: string;
}