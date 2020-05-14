import { Injectable } from "@nestjs/common";
import { Feature } from "src/entities/feature.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

@Injectable()
export class FeatureService extends TypeOrmCrudService<Feature> {
    constructor(@InjectRepository(Feature) private readonly feature: Repository<Feature>) {
        super(feature);
    }
}
