import { Controller, UseGuards } from "@nestjs/common";
import { CategoryService } from "src/services/category/category.service";
import { Crud } from "@nestjsx/crud";
import { Category } from "src/entities/category.entity";
import { RoleCheckedGuard } from "src/misc/role.checker.guard";
import { AllowToRoles } from "src/misc/allow.to.roles.decorator";

@Controller('api/category')
@Crud({
    model: { type: Category },
    params: {
        id: { field: 'categoryId', type: 'number', primary: true }
    },
    query: {
        join: {
            categories: { eager: true },
            parentCategory: { eager: true },
            features: { eager: true },
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
export class ApiCategoryController {
    constructor(public service: CategoryService) { }
}
