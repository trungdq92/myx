const PageBase = class PageBase {
    constructor() {
        this.rootUrl = CommomFunction._domainPath();
        this.groupId = CommomFunction._getGroupIdFromPath();
        this.contentId = CommomFunction._getContentIdFromPath();
        this.detailId = CommomFunction._getContentDetailIdFromPath();

        this.cachGallery = Constants.galleryCache.details;
        this.cacheGroupKey = Constants.galleryType.comic == this.groupId ? Constants.galleryCache.comic.groups : Constants.galleryCache.photography.groups;
        this.cacheContentKey = Constants.galleryType.comic == this.groupId ? Constants.galleryCache.comic.contentPrefix : Constants.galleryCache.photography.contentPrefix;
        this.cacheContentKey += this.contentId;
        this.cacheContentDetailKey = Constants.galleryType.comic == this.groupId ? Constants.galleryCache.comic.contentBookPrefix : Constants.galleryCache.photography.contentDetailPrefix;
        this.cacheContentDetailKey += this.contentId + this.detailId;

        this.galleyDetailPath = `${this.rootUrl}/assets/data/master.json`;
        this.loadDataPath = this.galleyDetailPath;
        this.loadDataKey = this.cachGallery;

        this.gallery = {};
        this.groups = {};
        this.contents = {};
        this.details = {};
        this.contentInfo = {};
        this.detailInfo = {};

        this.filters = '';
        this.glightBox = {};
        this.lGalleryFilters = {};
    }

    async _init() {
        DomEventFuntion._backToTop();
        await this._loadData();
        var data = JSON.parse(sessionStorage.getItem(this.loadDataKey));
        if (!data) {
            history.back();
        }

        this.gallery = JSON.parse(sessionStorage.getItem(this.cachGallery));
        if (!this.gallery) {
            this.gallery = await CommomFunction._loadJsonAsync(this.loadDataPath)
            sessionStorage.setItem(this.cachGallery, JSON.stringify(this.gallery))
        }
    }

    _initGalleryAndFilter() {
        return;
    }

    async _loadData() {
        // check cache
        var cache = sessionStorage.getItem(this.loadDataKey);
        if (cache) {
            return JSON.parse(cache);
        }

        // set cache
        var data = await CommomFunction._loadJsonAsync(this.loadDataPath)
        sessionStorage.setItem(this.loadDataKey, JSON.stringify(data))
        return;
    }

    _renderPage() {
        var content = this._renderContent();
        var sideMenu = this._renderSideMenu();
        var leftMenu = this._renderLeftMenu();
        var html = `<div id="side-menu-area">${sideMenu}</div>
                    <div id="left-menu-area">${leftMenu}</div>
                    <div class="content" id="group-content-area">${content}</div>
                
                    <div id="preloader"></div>
                    <a href="#" id="back-to-top" class="back-to-top d-flex align-items-center justify-content-center">
                        <i class="bi bi-arrow-up-short"></i>
                    </a>`;
        document.getElementById('container-area').innerHTML = html;
        return;
    }

    _renderSideMenu() {
        var menu = '';
        var gallery = this.gallery;
        gallery.children.forEach(item => {
            var subMenu = '';
            var groups = item;
            if (!groups) {
                return;
            }

            groups.children.forEach((cnt, index) => {
                var subCntMenu = "";
                var contents = cnt;
                if (!contents) {
                    return;
                }

                contents.children.forEach(dtl => {
                    subCntMenu += `<li class="list-group-item">
                                        <a href="${this.rootUrl}/pages/${item.id}/content/${cnt.id}/detail/${dtl.id}" 
                                            class="nav-link scrollto ${this.detailId == dtl.id ? 'active' : ''}">
                                            ${dtl.name}
                                        </a>
                                    </li>`
                })
                subCntMenu = `<ul class='list-group list-group-flush'>${subCntMenu}</ul>`;

                subMenu += `<button type="button" class="btn btn-outline-secondary ${this.contentId == cnt.id ? 'active' : ''}" 
                                data-bs-toggle="collapse" href="#group-menu-${cnt.id}"
                                ondblclick="location.href='${this.rootUrl}/pages/${item.id}/content/${cnt.id}'">
                                <span class="fs-5">${cnt.name}<span>
                            </button>
                            <div class="collapse multi-collapse p-0 ${this.contentId == cnt.id ? 'show' : ''}" id="group-menu-${cnt.id}">
                                <span class='fs-6'>${subCntMenu}<span>
                            </div>`
            })

            menu += `<button type="button" class="btn text-end btn-outline-secondary ${this.groupId == item.id ? 'active' : ''}" 
                            data-bs-toggle="collapse" href="#main-menu-${item.id}"
                            ondblclick="location.href='${this.rootUrl}/pages/${item.id}'">
                            <span class="fs-3">${item.name}<span>
                        </button>
                        <div class="collapse p-0 multi-collapse ${this.groupId == item.id ? 'show' : ''}" id="main-menu-${item.id}">
                            ${subMenu}
                        </div>
                    `;
        });

        return `<div class="row">
                    <div class="col-12">
                        <button class="navbar-toggler collapsed position-fixed top-0 end-0 m-3" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
                            <i class="bi bi-list navbar-toggler"></i>
                        </button>

                        <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel" data-bs-scroll="false" data-bs-backdrop="static__">
                            <div class="offcanvas-header">
                                <h3 id="offcanvasRightLabel" class="h3 p-0 my-0 text-uppercase">${Constants.pjName}</h3>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                            </div>
                            <div class="offcanvas-body">
                                <div class="offcanvas-body nav-menu">
                                    ${menu}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>`
    }

    _renderLeftMenu() {
        return '';
    }

    _renderContent() {
        return '';
    }

    _renderFilter() {
        return '';
    }

}

const GroupPage = class GroupPage extends PageBase {
    constructor() {
        super();
        this.loadDataPath = `${this.rootUrl}/assets/data/${this.groupId}/master.json`;
        this.loadDataKey = this.cacheGroupKey;
        this._init();
    }

    async _init() {
        await super._init();

        if (!JSON.parse(sessionStorage.getItem(this.cacheGroupKey))) {
            history.back();
        }
        this.groups = JSON.parse(sessionStorage.getItem(this.cacheGroupKey));
        this._renderPage();
        this._initGalleryAndFilter();
    }

    _initGalleryAndFilter() {
        DomEventFuntion._removePreload();
    }

    _renderContent() {
        var detail = this._renderContentDetails();
        return `<div class="row">
                    <h1 class="h1 text-capitalize">${this.groups.name}<hr /></h1>
                </div>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="${this.rootUrl}"><i class="bi bi-house-door-fill"></i></a></li>
                    <li class="breadcrumb-item text-capitalize" active aria-current="page">${this.groups.name}</li>
                    </ol>
                </nav>
                <div id="group-content-detail-area">${detail}</div>`;
    }

    _renderContentDetails() {
        var path = `${this.rootUrl}/pages/${this.groupId}`
        var html = '';
        this.groups.children.forEach(item => {
            html += `<section class="gallery-item">
                        <div class="section-title">
                            <h2>
                                <a href="${path}/content/${item.id}">${item.name}<a>
                            </h2>
                            <p class="fst-italic">${item.datetime}</p>
                        </div>
                        <div class="row">
                            <div class="col-lg-12">
                                <a href="${path}/content/${item.id}">
                                    <img class="img-fluid thumbs" src="${item.thumbs}" alt="">
                                <a>
                            </div>
                        </div>
                        <div class="row my-3 justify-content-center">
                            <div class="col-lg-12">${item.short}</div>
                        </div>
                    </section>`;
        });

        return html;
    }
}

const ContentPage = class ContentPage extends PageBase {
    constructor() {
        super();
        this.loadDataPath = `${this.rootUrl}/assets/data/${this.groupId}/${this.contentId}/master.json`;
        this.loadDataKey = this.cacheContentKey;

        this.groups = {};
        this.contents = {};
        this.contentInfo = {};

        this._init();
    }

    async _init() {
        await super._init();
        if (!JSON.parse(sessionStorage.getItem(this.cacheContentKey))
            || !JSON.parse(sessionStorage.getItem(this.cacheGroupKey))) {
            history.back();
        }

        this.groups = JSON.parse(sessionStorage.getItem(this.cacheGroupKey));
        this.contents = JSON.parse(sessionStorage.getItem(this.cacheContentKey));
        this.contentInfo = this.groups.children.find(x => x.id == this.contentId);

        this._renderPage();
        this._initGalleryAndFilter();
    }

    _initGalleryAndFilter() {
        InitGalleryFuntion._initGLightbox('.portfolio-lightbox');
        DomEventFuntion._removePreload();
    }

    _renderContent() {
        var detail = this._renderContentDetails();
        var short = this.contentInfo.short;
        var description = this.contentInfo.contents.join('');
        var contentName = this.contentInfo.name;
        var filters = this._renderFilter();
        return `<div class="row">
                    <h1 class="h1 text-capitalize">${contentName}<hr /></h1>
                </div>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="${this.rootUrl}"><i class="bi bi-house-door-fill"></i></a></li>
                    <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}">${this.groups.name}</i></a></li>
                    <li class="breadcrumb-item text-capitalize" active aria-current="page">${contentName}</li>
                    </ol>
                </nav>

                <section id="about" class="about">
                    <div class="section-title">
                        <h2>About</h2>
                        <p class="fst-italic" id="content-short">${short}</p>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <p id="content-description">${description}</p>
                        </div>
                    </div>
                </section>

                <section id="portfolio" class="portfolio section-bg gallery-content">
                    <div class="section-title">
                        <h2> Gallery </h2>
                    </div>
                    <div class="row justify-content-center">
                        <div class="col-lg-12">
                            <div id="portfolio-flters" class="portfolio-flters my-3">${filters}</div>
                        </div>
                    </div>
                    <div id="content-detail-area" class="portfolio-container row list">${detail}</div>
                </section>`;
    }

    _renderContentDetails() {
        var area = '';
        this.contents.children.forEach(item => {
            var url = `${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${item.id}`
            area += `<div class="col-lg-3 portfolio-item">
                        <div class="portfolio-wrap">
                            <img src="${item.thumbs}" class="img-fluid thumbs" alt="" loading="lazy" />
                            <div class="portfolio-info">
                                <h4>${item.name}</h4>
                                <p>${item.short}</p>
                                <div class="portfolio-links">
                                    <a href="${item.thumbs}" class="portfolio-lightbox" data-gallery="portfolioGallery" title="">
                                        <i class="bi bi-plus-lg"></i>
                                    </a>
                                    <a href="${url}" class="portfolio-details-lightbox" data-glightbox="type: external" title="${item.name}">
                                        <i class="bi bi-link-45deg"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>`;
        });

        return area;
    }
}

const DetailPage = class DetailPage extends PageBase {
    constructor() {
        super();
        this.loadDataPath = `${this.rootUrl}/assets/data/${this.groupId}/${this.contentId}/${this.detailId}/master.json`;
        this.loadDataKey = this.cacheContentDetailKey;
        this._init();
    }

    async _init() {
        await super._init();
        if (!JSON.parse(sessionStorage.getItem(this.cacheGroupKey))
            || !JSON.parse(sessionStorage.getItem(this.cacheContentKey))
            || !JSON.parse(sessionStorage.getItem(this.cacheContentDetailKey))) {
            history.back();
        }

        this.groups = JSON.parse(sessionStorage.getItem(this.cacheGroupKey));
        this.contents = JSON.parse(sessionStorage.getItem(this.cacheContentKey));
        this.details = JSON.parse(sessionStorage.getItem(this.cacheContentDetailKey));
        this.contentInfo = this.groups.children.find(x => x.id == this.contentId);
        this.detailInfo = this.contents.children.find(x => x.id == this.detailId);

        this._renderPage();
        this._initGalleryAndFilter();
    }

    _initGalleryAndFilter() {
        var glightBox = InitGalleryFuntion._initGLightbox('.portfolio-lightbox');
        var lGalleryFilters = InitGalleryFuntion._initListFilters('portfolio', {
            valueNames: [
                { attr: 'data-filter', name: 'filter_name' }
            ]
        })

        document.querySelectorAll('.portfolio-flters-item').forEach(elm => {
            elm.addEventListener('click', function () {
                InitGalleryFuntion._eventfilterGallery(this, lGalleryFilters, glightBox)
            });
        });

        var loadImg = setInterval(function () {
            console.log("img loading")
            var images = document.querySelectorAll('img');
            var load = images[images.length - 1].complete;
            if (load) {
                console.log("img loaded")
                InitGalleryFuntion._initIsotope();
                clearInterval(loadImg);
            }
        }, 500);

        DomEventFuntion._removePreload();
    }

    _renderContent() {
        var detail = this._renderContentDetails();
        var short = this.detailInfo.short;
        var description = this.detailInfo.contents.join('');
        var detailName = this.detailInfo.name;
        var contentName = this.contentInfo.name;
        var filters = this._renderFilter();
        return `<div class="row">
                    <h1 class="h1 text-capitalize">${contentName}<hr /></h1>
                </div>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="${this.rootUrl}"><i class="bi bi-house-door-fill"></i></a></li>
                    <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}">${this.groups.name}</i></a></li>
                    <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}/content/${this.contentId}">${contentName}</i></a></li>
                    <li class="breadcrumb-item text-capitalize" active aria-current="page">${detailName}</li>
                    </ol>
                </nav>

                <section id="about" class="about">
                    <div class="section-title">
                        <h2>About</h2>
                        <p class="fst-italic" id="content-short">${short}</p>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <p id="content-description">${description}</p>
                        </div>
                    </div>
                </section>

                <section id="portfolio" class="portfolio section-bg">
                    <div class="section-title">
                        <h2>Gallery</h2>
                    </div>
                    <div class="row justify-content-center">
                        <div class="col-lg-12">
                            <div id="portfolio-flters" class="portfolio-flters my-3">${filters}</div>
                        </div>
                    </div>
                    <div id="content-detail-area" class="list row justify-content-center portfolio-container">${detail}</div>
                </section>`;
    }

    _renderContentDetails() {
        var area = '';
        var imgs = [];
        this.details.hashtags.forEach(item => {
            var renderImgs = item.renderImg;
            var renders = item.imgs;
            if (renderImgs && renderImgs.length > 3) {
                renders = CommomFunction._createImgLinkLoop(renderImgs[0], renderImgs[1], parseInt(renderImgs[2]), parseInt(renderImgs[3]));
            }

            renders.forEach(path => {
                imgs.push(
                    {
                        path: path,
                        tags: item.tags
                    }
                );
            });
        });

        imgs.forEach((item, index) => {
            var filters = '';
            item.tags.sort().forEach(val => {
                filters += val + '_filters ';
            });

            area += `<div class="col-lg-3 col-md-4 portfolio-item filter_name ${filters}" data-filter="${filters}">
                    <a href="${item.path}" class="portfolio-lightbox" data-gallery="gallery" data-zoomable="true" data-draggable="true">
                        <img src="${item.path}" class="img-fluid" alt="" id="img-${index}" loading="lazy"/>
                    </a>
                </div>`;
        });

        return area;
    }

    _renderFilter() {
        var tags = [];
        this.details.hashtags.forEach(item => {
            item.tags.forEach(val => {
                if (tags.includes(val)) {
                    return;
                }
                tags.push(val);
            });
        });

        var html = ''
        tags.sort().forEach(item => {
            html += `<button class="btn btn-primary portfolio-flters-item col-auto m-1" data-filter="${item}_filters">${item.replace('_', ' ')}</button>`;
        });

        return html;
    }
}

const ComicContentPage = class ComicContentPage extends ContentPage {
    constructor() {
        super();
    }

    _initGalleryAndFilter() {
        var glightBox = InitGalleryFuntion._initGLightbox('.portfolio-lightbox');
        var lGalleryFilters = InitGalleryFuntion._initListFilters('portfolio', {
            valueNames: [
                { attr: 'data-filter', name: 'filter_name' }
            ]
        })

        document.querySelectorAll('.portfolio-flters-item').forEach(elm => {
            elm.addEventListener('click', function () {
                InitGalleryFuntion._eventfilterGallery(this, lGalleryFilters, glightBox)
            });
        });

        DomEventFuntion._removePreload();
    }

    _renderContentDetails() {
        var area = '';
        this.contents.children.forEach(item => {
            var filters = '';
            item.hashtags.sort().forEach(val => {
                filters += val + '_filters ';
            });

            area += `<div class="col-lg-3 portfolio-item filter_name ${filters}" data-filter="${filters}">
                    <div class="portfolio-wrap">
                        <img src="${item.thumbs}" class="img-fluid thumbs" alt="">
                        <div class="portfolio-info">
                            <h4>${item.name}</h4>
                            <p>${item.short}</p>
                            <div class="portfolio-links">
                                <a href="${item.thumbs}" class="portfolio-lightbox" data-gallery="portfolioGallery" title="">
                                    <i class="bi bi-plus-lg"></i>
                                </a>
                                <a href="${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${item.id}" class="portfolio-details-lightbox" data-glightbox="type: external" title="${item.name}">
                                    <i class="bi bi-link-45deg"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

        return area;
    }

    _renderFilter() {
        var tags = [];
        this.contents.children.forEach(item => {
            item.hashtags.forEach(val => {
                if (tags.includes(val)) {
                    return;
                }
                tags.push(val);
            });
        });

        var html = ''
        tags.sort().forEach(item => {
            html += `<button class="btn btn-primary portfolio-flters-item col-auto m-1" data-filter="${item}_filters">${item.replace('_', ' ')}</button>`;
        });

        return html;
    }
}

const ComicDetailPage = class ComicDetailPage extends DetailPage {
    constructor() {
        super();
    }

    _initGalleryAndFilter() {
        DomEventFuntion._removePreload();
    }

    _renderContentDetails() {
        var area = '';
        this.details.chapters.forEach((item, index) => {
            area += `<div class="col-lg-2 col-md-3 mb-3 portfolio-item">
                        <a href="${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${this.detailId}/chapter/?ch=${item.id}" class="portfolio-lightbox" data-gallery="gallery" data-zoomable="true" data-draggable="true">
                            <img src="${item.thumbs}" class="img-fluid img-thumbnail thumbs" alt="" loading="lazy"/>
                        </a>
                        <a href="${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${this.detailId}/chapter/?ch=${item.id}">
                            <h5 class="text-center fw-bold my-3">${item.name}<h5>
                        </a>
                    </div>`;
        });

        return area;

    }

    _renderFilter() {
        return '';
    }
}

const ComicChapterPage = class ComicChapterPage extends PageBase {
    constructor() {
        super();
        this.chapterId = CommomFunction._getUrlParameter('ch');
        this.chapter = {};
        this._init();
    }

    async _init() {
        await super._init();
        if (!this.chapterId
            || !JSON.parse(sessionStorage.getItem(this.cacheGroupKey))
            || !JSON.parse(sessionStorage.getItem(this.cacheContentKey))
            || !JSON.parse(sessionStorage.getItem(this.cacheContentDetailKey))) {
            history.back();
        }

        this.groups = JSON.parse(sessionStorage.getItem(this.cacheGroupKey));
        this.contents = JSON.parse(sessionStorage.getItem(this.cacheContentKey));
        this.details = JSON.parse(sessionStorage.getItem(this.cacheContentDetailKey));

        this.chapter = this.details.chapters.find(x => x.id === this.chapterId);
        this.contentInfo = this.groups.children.find(x => x.id == this.contentId);
        this.detailInfo = this.contents.children.find(x => x.id == this.detailId);

        this._renderPage();
        this._initGalleryAndFilter();
    }

    _initGalleryAndFilter() {
        InitGalleryFuntion._initGLightbox('.portfolio-lightbox');

        document.querySelectorAll('.grid-style').forEach(elm => {
            elm.addEventListener('click', function () {
                var girdType = elm.getAttribute('data-type');
                DomEventFuntion._changeViewPageStyle(girdType);
            });
        });

        DomEventFuntion._removePreload();
    }

    _renderLeftMenu() {
        var menu = ``;
        this.details.chapters.forEach((item, index) => {
            menu += `<li>
                        <a href="${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${this.detailId}/chapter/?ch=${item.id}"
                            class="nav-link scrollto ${item.id == this.chapterId ? 'active' : ''}">
                            ${item.name}
                        </a>
                    </li>`;
        });

        return `<div class="row">
                                <div class="col-12"> 
                                    <div class="offcanvas offcanvas-start" tabindex="-1" id="menuChapters" aria-labelledby="menuChapters" data-bs-scroll="false" data-bs-backdrop="static__">
                                        <div class="offcanvas-header">
                                            <h3 class="h3 p-0 my-0 text-uppercase">Chapters</h3>
                                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                                        </div>
                                        <div class="offcanvas-body">
                                            <div class="offcanvas-body nav-menu">
                                            <ul class="p-2">${menu}</ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
    }

    _renderContent() {
        var detail = this._renderContentDetails();
        var detailName = this.detailInfo.name;
        var contentName = this.contentInfo.name;
        var chapterName = this._renderChapterInfo();
        return `<div class="row">
                    <h1 class="h1 text-capitalize">${detailName}<hr /></h1>
                </div>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="${this.rootUrl}"><i class="bi bi-house-door-fill"></i></a></li>
                    <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}">${this.groups.name}</i></a></li>
                    <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}/content/${this.contentId}">${contentName}</i></a></li>
                    <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}/content/${this.contentId}/detail/${this.detailId}">${detailName}</i></a></li>
                    <li class="breadcrumb-item text-capitalize" active aria-current="page">${this.chapter.name}</li>
                    </ol>
                </nav>

                <section id="portfolio" class="portfolio section-bg">
                    <div class="section-title">
                        <h2 id="chapter-name">${chapterName}</h2>
                        <div class="row justify-content-center">
                            <button class="navbar-toggler collapsed" type="button" data-bs-toggle="offcanvas" data-bs-target="#menuChapters">
                                <i class="bi bi-list-task navbar-toggler"></i>
                            </button>
                        <div>
                        <div class="row justify-content-center chapter-grid-view-style">
                            <div class="col-lg-12 text-end">
                                <div class="my-3 fs-4">
                                    <a href="#" class="p-2 mx-1 grid-style" data-type="1"><i class="bi bi-list navbar-toggler"></i></a>
                                    <a href="#" class="p-2 mx-1 grid-style" data-type="4"><i class="bi bi-grid navbar-toggler"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="content-detail-area" class="row portfolio-container">${detail}</div>
                </section>

                <section>
                    <div class="section-title">
                        <h2 id="chapter-name-footer">${chapterName}</h2>
                    </div>
                </section>`;
    }

    _renderContentDetails() {
        var area = '';
        var imgs = this.chapter.imgs;
        var renderImgs = this.chapter.renderImg;
        if (renderImgs && renderImgs.length > 3) {
            imgs = CommomFunction._createImgLinkLoop(renderImgs[0], renderImgs[1], parseInt(renderImgs[2]), parseInt(renderImgs[3]));
        }

        var viewType = localStorage.getItem(Constants.galleryCache.gridViewType);
        var colShow = 'col-lg-3 col-md-4';
        if (viewType == '1') {
            colShow = 'col-lg-12';
        }

        imgs.forEach((item, index) => {
            area += `<div class="${colShow} portfolio-item filter_name">
                        <a href="${item}" class="portfolio-lightbox" data-gallery="gallery" data-zoomable="true" data-draggable="true">
                            <img src="${item}" class="img-fluid" alt="" loading="lazy"/>
                        </a>
                    </div>`;
        });

        return area;
    }

    _renderChapterInfo() {
        var chapters = this.details.chapters;
        var currentChap = this.chapterId;
        var prevChap = this.chapterId;
        var nextChap = this.chapterId;
        var clssPrev = '';
        var clssNext = '';
        chapters.forEach((item, index) => {
            if (item.id == currentChap) {
                var next = index + 1;
                var prev = index - 1;
                if (index == 0) {
                    prev = index;
                    clssPrev = 'd-none';
                }

                if (index == chapters.length - 1) {
                    next = index;
                    clssNext = 'd-none';
                }

                prevChap = chapters[prev].id;
                nextChap = chapters[next].id;
                return false;
            }
        });


        return `<a class="${clssPrev}" href="?c=${this.groupId}&d=${this.detailId}&ch=${prevChap}">
                        <i class="bi bi-arrow-left-short"></i>
                    </a>
                    ${this.chapter.name}
                    <a class="${clssNext}" href="?c=${this.detailId}&d=${this.detailId}&ch=${nextChap}">
                        <i class="bi bi-arrow-right-short"></i>
                    </a>`;
    }
}
