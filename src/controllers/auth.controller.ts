import { Controller, Post, Body, Req } from "@nestjs/common";
import { AdministratorService } from "src/services/administrator/administrator.service";
import { LoginAdministratorDto } from "src/dtos/auth/login.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import * as crypto from 'crypto';
import { LoginInformationAdministratorDto } from "src/dtos/auth/login.information.administrator.dto";
import * as jwt from 'jsonwebtoken';
import { JwtDataDto } from "src/dtos/auth/jwt.data.dto";
import { Request } from 'express';
import { SecretKey } from "config/secret.config";
import { UserRegistrationDto } from "src/dtos/user/user.registration.dto";
import { UserService } from "src/services/user/user.service";
import { LoginUserDto } from "src/dtos/auth/login.user.dto";
import { LoginInformationUserDto } from "src/dtos/auth/login.information.user.dto";

@Controller('auth') // http://localhost:3000/auth/
export class AuthController {
    constructor(
        public administratorService: AdministratorService,
        public userService: UserService,
    ) { }

    @Post('administrator/login') // POST http://localhost:3000/auth/administrator/login/
    async doAdministratorLogin(@Body() data: LoginAdministratorDto, @Req() req: Request): Promise<LoginInformationAdministratorDto | ApiResponse> {
        const admin = await this.administratorService.getByUsername(data.username);
        if (!admin) {
            return new ApiResponse('error', -3001);
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();
        if (passwordHashString !== admin.passwordHash) {
            return new ApiResponse('error', -3002);
        }

        const jwtData: JwtDataDto = new JwtDataDto();
        jwtData.role = "administrator";
        jwtData.id = admin.administratorId;
        jwtData.identity = admin.username;
        const sada = new Date();
        sada.setDate(sada.getDate() + 14); // + dve nedelje od sada
        jwtData.exp = sada.getTime() / 1000.;
        jwtData.ip = req.ip;
        jwtData.ua = req.headers['user-agent'];

        const token = jwt.sign(jwtData.toPlainObject(), SecretKey);

        return new LoginInformationAdministratorDto(
            admin.administratorId,
            admin.username,
            token,
        );
    }

    // POST http://localhost:3000/auth/user/register/
    @Post('user/register')
    async userRegister(@Body() data: UserRegistrationDto) {
        return await this.userService.register(data);
    }

    @Post('user/login') // POST http://localhost:3000/auth/user/login/
    async doUserLogin(@Body() data: LoginUserDto, @Req() req: Request): Promise<LoginInformationUserDto | ApiResponse> {
        const user = await this.userService.getByEmail(data.email);
        if (!user) {
            return new ApiResponse('error', -3001);
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();
        if (passwordHashString !== user.passwordHash) {
            return new ApiResponse('error', -3002);
        }

        const jwtData: JwtDataDto = new JwtDataDto();
        jwtData.role = "user";
        jwtData.id = user.userId;
        jwtData.identity = user.email;
        const sada = new Date();
        sada.setDate(sada.getDate() + 14); // + dve nedelje od sada
        jwtData.exp = sada.getTime() / 1000.;
        jwtData.ip = req.ip;
        jwtData.ua = req.headers['user-agent'];

        const token = jwt.sign(jwtData.toPlainObject(), SecretKey);

        return new LoginInformationUserDto(
            user.userId,
            user.email,
            token,
        );
    }
}
