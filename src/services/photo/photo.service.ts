import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Photo } from "src/entities/photo.entity";

@Injectable()
export class PhotoService extends TypeOrmCrudService<Photo> {
    constructor(@InjectRepository(Photo) private readonly photo: Repository<Photo>) {
        super(photo);
    }

    async add(photo: Photo) {
        return await this.photo.save(photo);
    }

    async deleteById(id: number) {
        return await this.photo.delete(id);
    }
}
