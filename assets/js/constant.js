const Constants = class Constants {
    static pjName = 'myx';
    static pages = 'pages'
    static pageContent = 'content'
    static pageContentDetail = 'detail'
    static galleryType = {
        comic: 'comic',
        gallery: 'gallery'
    }

    static galleryCache = {
        details: 'galleryCache',
        gridViewType: 'galleryGridViewType',
        photography: {
            groups: 'galleryContents',
            contentPrefix: 'gallerySubContentPrefix_',
            contentDetailPrefix: 'galleryContentDetailPrefix_'
        },
        comic: {
            groups: 'comicGroups',
            contentPrefix: 'comicContentPrefix_',
            contentBookPrefix: 'comicContentBookPrefix_'
        }
    }
    constructor() { }
}
