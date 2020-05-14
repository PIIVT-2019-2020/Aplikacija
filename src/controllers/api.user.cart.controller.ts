import { Controller, Get, UseGuards, Req, Post, Body, Patch } from "@nestjs/common";
import { CartService } from "src/services/cart/cart.service";
import { RoleCheckedGuard } from "src/misc/role.checker.guard";
import { AllowToRoles } from "src/misc/allow.to.roles.decorator";
import { Cart } from "src/entities/cart.entity";
import { Request } from "express";
import { AddArticleToCartDto } from "src/dtos/cart/add.article.to.cart.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { EditArticleInCartDto } from "src/dtos/cart/edit.article.in.cart.dto";

@Controller('api/user/cart/')
export class ApiUserCartController {
    constructor(
        private cartService: CartService,
    ) { }

    private async getCurrentCartForUser(userId: number): Promise<Cart> {
        let cart = await this.cartService.getLastActiveCartByUserId(userId);

        if (!cart) {
            cart = await this.cartService.createNewCartForUser(userId);
        }

        return await this.cartService.getById(cart.cartId);
    }

    // GET http://localhost:3000/api/user/cart/
    @Get()
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles("user")
    async getCurrentCart(@Req() req: Request): Promise<Cart> {
        return await this.getCurrentCartForUser(req.token.id);
    }

    // POST http://localhost:3000/api/user/cart/addToCart/
    @Post('addToCart')
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles("user")
    async addToCart(@Req() req: Request, @Body() data: AddArticleToCartDto): Promise<Cart | ApiResponse> {
        const cart = await this.getCurrentCartForUser(req.token.id);
        return await this.cartService.addArticleToCart(cart.cartId, data.articleId, data.quantity);
    }
    
    // PATCH http://localhost:3000/api/user/cart/
    @Patch()
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles("user")
    async changeQuantity(@Req() req: Request, @Body() data: EditArticleInCartDto): Promise<Cart | ApiResponse> {
        const cart = await this.getCurrentCartForUser(req.token.id);
        return await this.cartService.changeQuantity(cart.cartId, data.articleId, data.quantity);
    }
}
