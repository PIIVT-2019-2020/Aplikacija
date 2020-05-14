export const StorageConfig = {
    photo: {
        destination: '../storage/photos/',
        urlPrefix: '/assets/photos',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dana u ms
        fileSize: 2.5 * 1024 * 1024,
        resize: {
            thumb: {
                directory: 'thumb/',
                width: 150,
                height: 100,
            },
            small: {
                directory: 'small/',
                width: 320,
                height: 240,
            },
        },
    },
};
