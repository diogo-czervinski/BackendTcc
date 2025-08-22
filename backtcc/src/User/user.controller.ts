import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/createuser.dto";
import { UpdateUserDto } from "./dto/updateuser.dto";
import { JwtAuthGuard } from "src/Auth/jwt-auth.guard";

@Controller('/user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.userService.create(dto)
    }

    @Get()
    findAll() {
        return this.userService.findAll()
    }

    @Get(':id')
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findById(id)
    }

    // ROTA PARA O ADMIN (ou casos genéricos)
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    updateUserById(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserDto,
        @Request() req,
    ) {
        return this.userService.update(id, dto, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch()
    update(@Request() req, @Body() dto: UpdateUserDto) {
        const userIdFromTokem = req.user.userId;
        return this.userService.update(userIdFromTokem, dto, req.user)
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.userService.delete(id)
    }
}