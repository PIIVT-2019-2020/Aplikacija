import { ArticleService } from "src/services/article/article.service";
import { Controller, Post, Param, UseInterceptors, UploadedFile, Req, Delete, Patch, Body, UseGuards } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Article } from "src/entities/article.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageConfig } from "config/storage.config";
import { diskStorage } from "multer";
import { ApiResponse } from "src/misc/api.response.class";
import { PhotoService } from "src/services/photo/photo.service";
import { Photo } from "src/entities/photo.entity";
import * as fileType from 'file-type';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { EditArticleDto } from "src/dtos/article/edit.article.dto";
import { RoleCheckedGuard } from "src/misc/role.checker.guard";
import { AllowToRoles } from "src/misc/allow.to.roles.decorator";

@Controller('api/article')
@Crud({
    model: { type: Article },
    params: { id: { field: 'articleId', type: 'number', primary: true } },
    query: {
        join: {
            category: { eager: true },
            articleFeatures: { eager: true },
            features: { eager: true },
            articlePrices: { eager: true },
            photos: { eager: true },
        }
    },
    routes: {
        only: [
            "getOneBase",
            "getManyBase",
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
    },
})
export class ApiArticleController {
    constructor(
        public service: ArticleService,
        public photoService: PhotoService,
    ) { }

    @Post(':id/uploadPhoto/') // POST http://localhost:3000/api/article/2/uploadPhoto/
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles("administrator")
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: StorageConfig.photo.destination,
                filename: (req, file, callback) => { // callback(err, filename)
                    let filename: string = file.originalname;          // "Neka-Datoteka  (11).jpg"
                    filename = filename.toLowerCase();                 // "neka-datoteka  (11).jpg"
                    filename = filename.replace(/\s+/g, '-');          // "neka-datoteka-(11).jpg"
                    filename = filename.replace(/[^a-z0-9\.\-]/g, ''); // "neka-datoteka-11.jpg"

                    const sada = new Date();
                    let prefiksDatuma = '';
                    prefiksDatuma += sada.getFullYear().toString();
                    prefiksDatuma += (sada.getMonth() + 1).toString();
                    prefiksDatuma += sada.getDate();

                    const prefixRandom: string = new Array(10).fill(' ').map(e => (Math.random() * 9).toFixed(0).toString()).join('');
                    const finalFilename = prefiksDatuma + '-' + prefixRandom + '-' + filename;

                    callback(null, finalFilename); // 2020430-1234567890-neka-datoteka-11.jpg
                }
            }),
            fileFilter: (req, file, callback) => { // callback(error, allow) allow: true/false
                // callback(null, true);                         // Prihvatamo datoteku
                // callback(new Error('Bad extension!'), false); // Ne prihvatamo iz razloga...

                if (!file.originalname.toLowerCase().match(/\.(jpg|png)$/)) {
                    req.fileFilterError = 'Bad extension!';
                    callback(null, false); // !!! daje error u konzoli!!!
                    return;
                }

                if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
                    req.fileFilterError = 'Bad file content!';
                    callback(null, false);
                    return;
                }

                callback(null, true);
            },
            limits: { files: 1, fileSize: StorageConfig.photo.fileSize },
        }),
    )
    async uploadPhoto(
        @Param('id') articleId: number,
        @UploadedFile() photo,
        @Req() req
    ): Promise<Photo | ApiResponse> {
        if (!photo) {
            return new ApiResponse('error', -5001);
        }

        if (req.fileFilterError !== undefined) {
            return new ApiResponse('error', -5003, req.fileFilterError);
        }

        const fileTypeResult = await fileType.fromFile(photo.path);
        if (!fileTypeResult) {
            fs.unlinkSync(photo.path);
            return new ApiResponse('error', -5003, 'Bad file content!');
        }

        const realMimeType: string = fileTypeResult.mime;
        if (!(realMimeType.includes('jpeg') || realMimeType.includes('png'))) {
            fs.unlinkSync(photo.path);
            return new ApiResponse('error', -5003, 'Bad file content!');
        }

        await this.createResizedImage(photo, StorageConfig.photo.resize.thumb);
        await this.createResizedImage(photo, StorageConfig.photo.resize.small);

        const newPhoto: Photo = new Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

        const savedPhoto = await this.photoService.add(newPhoto);
        if (!savedPhoto) {
            fs.unlinkSync(photo.path);
            return new ApiResponse('error', -5002);
        }

        return savedPhoto;
    }

    async createResizedImage(photo, resizeOptions) {
        const destination = StorageConfig.photo.destination + // ../storage/photos/
                            resizeOptions.directory +         // ../storage/photos/thumb/
                            photo.filename;                   // ../storage/photos/thumb/file.jpg

        await sharp(photo.path)
            .resize({
                fit: 'cover',
                width: resizeOptions.width,
                height: resizeOptions.height,
            })
            .toFile(destination);
    }

    // DELETE http://localhost:3000/api/article/1/deletePhoto/12/
    @Delete(':articleId/deletePhoto/:photoId')
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles("administrator")
    async deletePhoto(
        @Param('articleId') articleId: number,
        @Param('photoId') photoId: number
    ) {
        const photo = await this.photoService.findOne({
            photoId: photoId,
            articleId: articleId
        });

        if (!photo) {
            return new ApiResponse("error", -5004, 'Photo not found.');
        }

        try {
            fs.unlinkSync(StorageConfig.photo.destination + photo.imagePath);
            fs.unlinkSync(StorageConfig.photo.destination +
                          StorageConfig.photo.resize.thumb.directory +
                          photo.imagePath);
            fs.unlinkSync(StorageConfig.photo.destination +
                          StorageConfig.photo.resize.small.directory +
                          photo.imagePath);
        } catch (e) { /* ... */ }

        const deleteResult = await this.photoService.deleteById(photoId);
        if (!deleteResult.affected) {
            return new ApiResponse("error", -5004, 'Photo not found.');
        }

        return new ApiResponse("ok", 0, 'One photo has been deleted.');
    }

    // PATCH http://localhost:3000/api/article/3/
    @Patch(':id')
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles("administrator")
    async editById(@Param('id') id: number, @Body() data: EditArticleDto) {
        return await this.service.editById(id, data);
    }
}
