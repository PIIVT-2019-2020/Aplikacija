import { Controller, UseGuards } from "@nestjs/common";
import { FeatureService } from "src/services/feature/feature.service";
import { Crud } from "@nestjsx/crud";
import { Feature } from "src/entities/feature.entity";
import { RoleCheckedGuard } from "src/misc/role.checker.guard";
import { AllowToRoles } from "src/misc/allow.to.roles.decorator";

@Controller('api/feature')
@Crud({
    model: { type: Feature },
    params: {
        id: { field: 'featureId', type: 'number', primary: true }
    },
    query: {
        join: {
            category: { eager: true },
            articleFeatures: { eager: false },
            articles: { eager: false },
        },
    },
    routes: {
        only: [
            "getOneBase",
            "getManyBase",
            "createOneBase",
            "updateOneBase",
        ],
        getOneBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles("administrator", "user"),
            ],
        },
        getManyBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles("administrator", "user"),
            ],
        },
        createOneBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles("administrator"),
            ],
        },
        updateOneBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles("administrator"),
            ],
        },
    },
})
export class ApiFeatureController {
    constructor(public service: FeatureService) { }
}
