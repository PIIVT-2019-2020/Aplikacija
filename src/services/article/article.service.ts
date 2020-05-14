import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Article } from "src/entities/article.entity";
import { EditArticleDto } from "src/dtos/article/edit.article.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { ArticlePrice } from "src/entities/article-price.entity";
import { ArticleFeature } from "src/entities/article-feature.entity";

@Injectable()
export class ArticleService extends TypeOrmCrudService<Article> {
    constructor(
        @InjectRepository(Article) private readonly article: Repository<Article>,
        @InjectRepository(ArticlePrice) private readonly articlePrice: Repository<ArticlePrice>,
        @InjectRepository(ArticleFeature) private readonly articleFeature: Repository<ArticleFeature>,
    ) {
        super(article);
    }

    async editById(id: number, data: EditArticleDto) {
        const existingArticle: Article = await this.article.findOne(id, {
            relations: [ 'articlePrices', 'articleFeatures' ],
        });

        if (!existingArticle) {
            return new ApiResponse('error', -6001, 'Article not found.');
        }

        existingArticle.name        = data.name;
        existingArticle.categoryId  = data.categoryId;
        existingArticle.excerpt     = data.excerpt;
        existingArticle.description = data.description;
        existingArticle.status      = data.status;
        existingArticle.isPromoted  = data.isPromoted;

        const savedArticle: Article = await this.article.save(existingArticle);
        if (!savedArticle) {
            return new ApiResponse('error', -6002, 'Could not save new article data.');
        }

        let prices = existingArticle.articlePrices;
        let lastArticlePrice = prices[prices.length-1];
        let lastPrice: number = lastArticlePrice.price;
        let lastPriceString: string = Number(lastPrice).toFixed(2); // 23   -> '23.00'
        let newPriceString: string = Number(data.price).toFixed(2); // 23.1 -> '23.10'

        if (lastPriceString !== newPriceString) {
            const newArticlePrice: ArticlePrice = new ArticlePrice();
            newArticlePrice.articleId = id;
            newArticlePrice.price = data.price;

            const savedArticlePrice = await this.articlePrice.save(newArticlePrice);
            if (!savedArticlePrice) {
                return new ApiResponse('error', -6003, 'Could not save the new article price.');
            }
        }

        if (data.features) {
            await this.articleFeature.remove(existingArticle.articleFeatures);

            for (let feature of data.features) {
                const newArticleFeature = new ArticleFeature();
                newArticleFeature.articleId = id;
                newArticleFeature.featureId = feature.featureId;
                newArticleFeature.value     = feature.value;

                await this.articleFeature.save(newArticleFeature);
            }
        }

        return await this.article.findOne(id, {
            relations: [
                'articlePrices',
                'articleFeatures',
                'features',
                'category',
                'photos',
            ],
        });
    }
}
