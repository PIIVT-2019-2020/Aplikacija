import { NestMiddleware, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import * as jwt from 'jsonwebtoken';
import { SecretKey } from "config/secret.config";
import { JwtDataDto } from "src/dtos/auth/jwt.data.dto";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            throw new HttpException('The token does not exist!', HttpStatus.UNAUTHORIZED);
        }

        const tokenParts = req.headers.authorization.split(' ');
        if (tokenParts.length !== 2) {
            throw new HttpException('The token does not exist!', HttpStatus.UNAUTHORIZED);
        }

        const token = tokenParts[1];
        let jwtData: JwtDataDto;

        try {
            jwtData = jwt.verify(token, SecretKey);

            if (!jwtData) {
                throw new HttpException('The token is not valid!', HttpStatus.UNAUTHORIZED);
            }
        } catch (e) {
            throw new HttpException('The token is not valid!', HttpStatus.UNAUTHORIZED);
        }

        if (jwtData.ip !== req.ip) {
            throw new HttpException('The token is not valid!', HttpStatus.UNAUTHORIZED);
        }

        if (jwtData.ua !== req.headers['user-agent']) {
            throw new HttpException('The token is not valid!', HttpStatus.UNAUTHORIZED);
        }

        const sada = new Date();
        if (jwtData.exp < sada.getTime() / 1000.) {
            throw new HttpException('The token has expired!', HttpStatus.UNAUTHORIZED);
        }

        req.token = jwtData;

        next();
    }
}
