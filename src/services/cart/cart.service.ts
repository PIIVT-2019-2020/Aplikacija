import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cart } from "src/entities/cart.entity";
import { Repository } from "typeorm";
import { CartArticle } from "src/entities/cart-article.entity";
import { ApiResponse } from "src/misc/api.response.class";

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart) private cart: Repository<Cart>,
        @InjectRepository(CartArticle) private cartArticle: Repository<CartArticle>,
    ) { }

    async getLastActiveCartByUserId(userId: number): Promise<Cart | null> {
        const carts = await this.cart.find({
            where: {
                userId: userId,
            },
            order: {
                createdAt: "DESC",
            },
            take: 1,
            relations: [
                "order",
            ],
        });

        if (!carts || carts.length === 0) {
            return null;
        }

        if (carts[0].order) {
            return null;
        }

        return carts[0];
    }

    async createNewCartForUser(userId: number): Promise<Cart> {
        const newCart = new Cart();
        newCart.userId = userId;
        return await this.cart.save(newCart);
    }

    async addArticleToCart(cartId: number, articleId: number, quantity: number): Promise<Cart | ApiResponse> {
        let record = await this.cartArticle.findOne({
            cartId: cartId,
            articleId: articleId,
        });

        if (!record) {
            record = new CartArticle();
            record.cartId = cartId;
            record.articleId = articleId;
            record.quantity = quantity;
        } else {
            record.quantity += quantity;
        }

        const savedCartArticle = await this.cartArticle.save(record);

        if (!savedCartArticle) {
            return new ApiResponse("error", -6101, "Could not add article to cart.");
        }

        return await this.getById(cartId);
    }

    async getById(cartId: number): Promise<Cart> {
        return await this.cart.findOne(cartId, {
            relations: [
                "user",
                "cartArticles",
                "cartArticles.article",
                "cartArticles.article.category",
                "cartArticles.article.articlePrices",
                "cartArticles.article.photos",
            ],
        });
    }

    async changeQuantity(cartId: number, articleId: number, newQuantity: number): Promise<Cart> {
        let record = await this.cartArticle.findOne({
            cartId: cartId,
            articleId: articleId,
        });

        if (record) {
            record.quantity = newQuantity;

            if (record.quantity === 0) {
                await this.cartArticle.delete(record.cartArticleId);
            } else {
                await this.cartArticle.save(record);
            }
        }

        return await this.getById(cartId);
    }
}
