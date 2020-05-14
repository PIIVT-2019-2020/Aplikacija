import { Injectable } from "@nestjs/common";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { UserRegistrationDto } from "src/dtos/user/user.registration.dto";
import * as crypto from 'crypto';
import { ApiResponse } from "src/misc/api.response.class";

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
    constructor(@InjectRepository(User) private readonly user: Repository<User>) {
        super(user);
    }

    async register(data: UserRegistrationDto) {
        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        const newUser: User = new User();
        newUser.email         = data.email;
        newUser.passwordHash  = passwordHashString;
        newUser.forename      = data.forename;
        newUser.surname       = data.surname;
        newUser.phoneNumber   = data.phoneNumber;
        newUser.postalAddress = data.postalAddress;

        try {
            const savedUser = await this.user.save(newUser);

            if (!savedUser) {
                return new ApiResponse('error', -7001, 'Cannot register this user.');
            }

            return new ApiResponse('ok', 0, 'User account created!');
        } catch (e) {
            return new ApiResponse('error', -7001, 'Cannot register this user.');
        }
    }

    async getByEmail(email: string) {
        return await this.user.findOne({
            email: email
        });
    }
}
