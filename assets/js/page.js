const Page = class Page {
    constructor() {
        // get lv tree
        var lvl = location.pathname.split('/').length;
        this.groupId = CommomFunction._getGroupIdFromPath();
        var constComic = Constants.galleryType.comic;
        switch (lvl) {
            case 3:
                // home
                new HomePage();
                break;
            case 5:
                // group
                new GroupPage();
                break;
            case 7:
                // content
                if (this.groupId == constComic) {
                    new ComicContentPage();
                } else {
                    new ContentPage();
                }
                break;
            case 9:
                // detail
                if (this.groupId == constComic) {
                    new ComicDetailPage();
                } else {
                    new DetailPage();
                }
                break;
            case 10:
                // chapter
                new ComicChapterPage();
                break;
        }
    }
}

const PageBase = class PageBase {
    constructor() {
        this.rootUrl = CommomFunction._domainPath();
        this.groupId = CommomFunction._getGroupIdFromPath();
        this.contentId = CommomFunction._getContentIdFromPath();
        this.detailId = CommomFunction._getContentDetailIdFromPath();

        this.loadGalleyTree = `${this.rootUrl}/assets/data/menu.json`;
        this.loadGalleyPath = `${this.rootUrl}/assets/data/master.json`;
        this.loadGroupPath = `${this.rootUrl}/assets/data/${this.groupId}/master.json`;
        this.loadContentPath = `${this.rootUrl}/assets/data/${this.groupId}/${this.contentId}/master.json`;
        this.loadDetailPath = `${this.rootUrl}/assets/data/${this.groupId}/${this.contentId}/${this.detailId}/master.json`;

        this.treeMenu = {};
        this.gallery = {};
        this.groups = {};
        this.contents = {};
        this.details = {};
        this.contentInfo = {};
        this.detailInfo = {};

        this.galleryShowCol = '';
        this.galleryColThumbs = '';
        this.galleryDisplayColHtml = '';

        this.filters = '';
        this.glightBox = {};
        this.lGalleryFilters = {};
    }

    async _init() {
        DomEventFuntion._backToTop();
        this.galleryDisplayColHtml = this._renderGalleryShowColumn();
        var dataGallery = await CommomFunction._loadJsonAsync(this.loadGalleyPath);
        if (!dataGallery) {
            history.back();
        }
        this.gallery = dataGallery;

        var dataGalleryMenu = await CommomFunction._loadJsonAsync(this.loadGalleyTree);
        this.treeMenu = dataGalleryMenu;
    }

    _initAnomationAfterRender() {
        return;
    }

    static _initGalleryAndFilter() {
        if (event) {
            if (!this.glightBox)
                this.glightBox = InitGalleryFuntion._initGLightbox('.portfolio-lightbox');

            if (!this.lGalleryFilters)
                this.lGalleryFilters = InitGalleryFuntion._initListFilters('portfolio', {
                    valueNames: [
                        { attr: 'data-filter', name: 'filter_name' }
                    ]
                })

            InitGalleryFuntion._eventfilterGallery(event.target, this.lGalleryFilters, this.glightBox);
        }

        return;
    }

    _renderPage() {
        var content = this._renderContent();
        var sideMenu = this._renderSideMenu();
        var leftMenu = this._renderLeftMenu();

        var html = `<div class="container-fluid">
                        <div id="side-menu-area">${sideMenu}</div>
                        <div id="left-menu-area">${leftMenu}</div>
                        <div class="content" id="group-content-area">${content}</div>
                    </div>
                    <div id="preloader"></div>
                    <a href="#" id="back-to-top" class="back-to-top d-flex align-items-center justify-content-center">
                        <i class="bi bi-arrow-up-short"></i>
                    </a>`;

        document.getElementById('container-area').innerHTML = html;
        return;
    }

    _renderSideMenu() {
        var menu = '';
        var treeMenu = this.treeMenu;
        treeMenu.children.forEach(item => {
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
                                            class="nav-link ps-4 text-capitalize scrollto ${this.detailId == dtl.id ? 'active' : ''}">
                                            ${dtl.name}
                                        </a>
                                    </li>`
                })
                subCntMenu = `<ul class='list-group list-group-flush'>${subCntMenu}</ul>`;

                subMenu += `<button type="button" class="btn px-3 btn-outline-secondary ${this.contentId == cnt.id ? 'active' : ''}" 
                                data-bs-toggle="collapse" href="#group-menu-${cnt.id}"
                                ondblclick="location.href='${this.rootUrl}/pages/${item.id}/content/${cnt.id}'">
                                <span class="fs-5 text-capitalize">${cnt.name}<span>
                            </button>
                            <div class="collapse multi-collapse p-0 ${this.contentId == cnt.id ? 'show' : ''}" id="group-menu-${cnt.id}">
                                <span class='fs-6 text-capitalize'>${subCntMenu}<span>
                            </div>`
            })

            menu += `<button type="button" class="btn px-3 text-end btn-outline-secondary ${this.groupId == item.id ? 'active' : ''}" 
                            data-bs-toggle="collapse" href="#main-menu-${item.id}"
                            ondblclick="location.href='${this.rootUrl}/pages/${item.id}'">
                            <span class="fs-3 text-capitalize">${item.name}<span>
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
                                <a href="${this.rootUrl}"><h3 id="offcanvasRightLabel" class="h3 p-0 my-0 text-uppercase text-muted">${Constants.pjName}</h3></a>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                            </div>
                            <div class="offcanvas-body px-0 pt-0">
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

    _renderGalleryShowColumn() {
        var viewType = localStorage.getItem(Constants.galleryCache.gridViewType);
        var colShow = '';
        var colThumbs = '';
        switch (viewType) {
            case '1':
                colShow = 'col-lg-12';
                colThumbs = 'thumbs-cover-height-1';
                break;
            case '2':
                colShow = 'col-lg-6';
                colThumbs = 'thumbs-cover-height-2';
                break;
            case '3':
                colShow = 'col-lg-4';
                colThumbs = 'thumbs-cover-height-3';
                break;
            case '4':
                colShow = 'col-lg-3';
                colThumbs = 'thumbs-cover-height-4';
                break;
            case '6':
                colShow = 'col-lg-2';
                colThumbs = 'thumbs-cover-height-6';
                break;
            default:
                colShow = 'col-lg-4';
                colThumbs = 'thumbs-cover-height-4';
        }

        this.galleryShowCol = colShow;
        this.galleryColThumbs = colThumbs;

        return ` <div class="row justify-content-center chapter-grid-view-style">
                    <div class="col-lg-12 text-end">
                        <div class="my-3 fs-4">
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(1);" class="p-2 mx-1 grid-style" data-type="1"><i class="bi bi-list navbar-toggler"></i></a>
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(2);" class="p-2 mx-1 grid-style" data-type="2"><i class="bi bi-grid navbar-toggler"></i></i></a>
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(3);" class="p-2 mx-1 grid-style" data-type="3"><i class="bi bi-grid-3x3-gap navbar-toggler"></i></a>
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(4);" class="p-2 mx-1 grid-style" data-type="4"><i class="bi bi-grid-3x3 navbar-toggler"></i></a>
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(6);" class="p-2 mx-1 grid-style" data-type="6"><i class="bi bi-bricks navbar-toggler"></i></a>
                        </div>
                    </div>
                </div>`;
    }

}

const HomePage = class HomePage extends PageBase {
    constructor() {
        super();
        this._init();
    }

    async _init() {
        await super._init();
        this._renderPage();
        this._initAnomationAfterRender();
    }

    _initAnomationAfterRender() {
        super._initAnomationAfterRender();
        DomEventFuntion._removePreload();
    }

    _renderContent() {
        super._renderContent();
        var background = ["#fbe4de", "#c8f0ee"];
        var galleryInfo = '';
        this.gallery.children.forEach((item, index) => {
            galleryInfo += `<div class="row my-5">
                        <div class="card" style="background-color: ${background[index]};">
                            <div class="card-body">
                                <h3 class="h3 text-capitalize"><a href="${this.rootUrl}/pages/${item.id}/">${item.name}</a></h3>
                                <p class="text-dark">
                                ${item.contents.join("")}
                                </p>
                            </div>
                        </div>
                    </div>`;
        })
        return `<div class="main__">
                    <section id="about" class="about">
                        <div class="section-title">
                            <h2>About</h2>
                        </div>
                        <div class="row justify-content-center">
                            <div class="col-lg-12 pt-4 content text-center">
                                <p>
                                ${this.gallery.contents.join("")}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section id="facts" class="facts">
                        <div class="section-title">
                            <h2>Facts</h2>
                            <p>${this.gallery.short}</p>
                        </div>
                        ${galleryInfo}
                    </section>
                </div>`;

    }
}

const GroupPage = class GroupPage extends PageBase {
    constructor() {
        super();
        this._init();
    }

    async _init() {
        await super._init();

        var dataGroup = await CommomFunction._loadJsonAsync(this.loadGroupPath);
        if (!dataGroup) {
            history.back();
        }

        this.groups = dataGroup;
        this._renderPage();
        this._initAnomationAfterRender();
    }

    _initAnomationAfterRender() {
        super._initAnomationAfterRender();
        DomEventFuntion._removePreload();
    }

    _renderContent() {
        super._renderContent();
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
        var _page = this;
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
                                    <img class="img-fluid thumbs" src="${item.thumbs}" alt="" onerror="this.src='${_page.rootUrl}/assets/img/error.png'">
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

        this.groups = {};
        this.contents = {};
        this.contentInfo = {};

        this._init();
    }

    async _init() {
        await super._init();

        var dataGroup = await CommomFunction._loadJsonAsync(this.loadGroupPath);
        var dataContent = await CommomFunction._loadJsonAsync(this.loadContentPath);
        if (!dataGroup || !dataContent) {
            history.back();
        }

        this.groups = dataGroup;
        this.contents = dataContent;
        this.contentInfo = this.groups.children.find(x => x.id == this.contentId);

        this._renderPage();
        this._initAnomationAfterRender();
    }

    _initAnomationAfterRender() {
        super._initAnomationAfterRender();
        InitGalleryFuntion._initGLightbox('.portfolio-lightbox');
        DomEventFuntion._removePreload();
    }

    _renderContent() {
        super._renderContent();
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
        var _page = this;
        this.contents.children.forEach(item => {
            var url = `${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${item.id}`
            area += `<div class="col-lg-3 portfolio-item">
                        <div class="portfolio-wrap">
                            <img src="${item.thumbs}" class="img-fluid thumbs" alt="" loading="lazy"  onerror="this.src='${_page.rootUrl}/assets/img/error.png'"/>
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

        this._init();
    }

    async _init() {
        await super._init();

        var dataGroup = await CommomFunction._loadJsonAsync(this.loadGroupPath);
        var dataContent = await CommomFunction._loadJsonAsync(this.loadContentPath);
        var dataDetail = await CommomFunction._loadJsonAsync(this.loadDetailPath);
        if (!dataGroup || !dataContent || !dataDetail) {
            history.back();
        }

        this.groups = dataGroup;
        this.contents = dataContent;
        this.details = dataDetail;
        this.contentInfo = this.groups.children.find(x => x.id == this.contentId);
        this.detailInfo = this.contents.children.find(x => x.id == this.detailId);

        this._renderPage();
        this._initAnomationAfterRender();
    }

    _initAnomationAfterRender() {
        super._initAnomationAfterRender();
        this.glightBox = InitGalleryFuntion._initGLightbox('.portfolio-lightbox');
        this.lGalleryFilters = InitGalleryFuntion._initListFilters('portfolio', {
            valueNames: [
                { attr: 'data-filter', name: 'filter_name' }
            ]
        })

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
        super._renderContent();
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
                    ${this.galleryDisplayColHtml}
                    <div id="content-detail-area" class="list row justify-content-center portfolio-container">${detail}</div>
                </section>`;
    }

    _renderContentDetails() {
        var area = '';
        var imgs = [];
        var _page = this;
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

            area += `<div class="${_page.galleryShowCol} portfolio-item filter_name ${filters}" data-filter="${filters}">
                    <a href="${item.path}" class="portfolio-lightbox" data-gallery="gallery" data-zoomable="true" data-draggable="true">
                        <img src="${item.path}" class="img-fluid" alt="" id="img-${index}" loading="lazy"  onerror="this.src='${_page.rootUrl}/assets/img/error.png'"/>
                    </a>
                </div>`;
        });

        return area;
    }

    _renderFilter() {
        super._renderFilter();
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
            html += `<button class="btn btn-primary portfolio-flters-item col-auto m-1" data-filter="${item}_filters" 
                    onclick="PageBase._initGalleryAndFilter()">
                        ${item.replace('_', ' ')}
                    </button>`;
        });

        return html;
    }
}

const ComicContentPage = class ComicContentPage extends ContentPage {
    constructor() {
        super();
    }

    _initAnomationAfterRender() {
        super._initAnomationAfterRender();
        this.glightBox = InitGalleryFuntion._initGLightbox('.portfolio-lightbox');
        this.lGalleryFilters = InitGalleryFuntion._initListFilters('portfolio', {
            valueNames: [
                { attr: 'data-filter', name: 'filter_name' }
            ]
        })

        DomEventFuntion._removePreload();
    }

    _renderContentDetails() {
        var area = '';
        var _page = this;
        this.contents.children.forEach(item => {
            var filters = '';
            item.hashtags.sort().forEach(val => {
                filters += val + '_filters ';
            });

            area += `<div class="col-lg-3 portfolio-item filter_name ${filters}" data-filter="${filters}">
                    <div class="portfolio-wrap">
                        <img src="${item.thumbs}" class="img-fluid thumbs" alt="" onerror="this.src='${_page.rootUrl}/assets/img/error.png'">
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
            html += `<button class="btn btn-primary portfolio-flters-item col-auto m-1" data-filter="${item}_filters" onclick="PageBase._initGalleryAndFilter()">${item.replace('_', ' ')}</button>`;
        });

        return html;
    }
}

const ComicDetailPage = class ComicDetailPage extends DetailPage {
    constructor() {
        super();
    }

    _initAnomationAfterRender() {
        super._initAnomationAfterRender();
        DomEventFuntion._removePreload();
    }

    _renderContentDetails() {
        var area = '';
        var _page = this;
        this.details.chapters.forEach((item, index) => {
            area += `<div class="${_page.galleryShowCol} mb-3 portfolio-item">
                        <a href="${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${this.detailId}/chapter/?ch=${item.id}" class="portfolio-lightbox" data-gallery="gallery" data-zoomable="true" data-draggable="true">
                            <img src="${item.thumbs}" class="img-fluid img-thumbnail thumbs-cover ${_page.galleryColThumbs}" alt="" loading="lazy" onerror="this.src='${_page.rootUrl}/assets/img/error.png'"/>
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

        var dataGroup = await CommomFunction._loadJsonAsync(this.loadGroupPath);
        var dataContent = await CommomFunction._loadJsonAsync(this.loadContentPath);
        var dataDetail = await CommomFunction._loadJsonAsync(this.loadDetailPath);
        if (!this.chapterId || !dataGroup || !dataContent || !dataDetail) {
            history.back();
        }

        this.groups = dataGroup;
        this.contents = dataContent;
        this.details = dataDetail;

        this.chapter = this.details.chapters.find(x => x.id === this.chapterId);
        this.contentInfo = this.groups.children.find(x => x.id == this.contentId);
        this.detailInfo = this.contents.children.find(x => x.id == this.detailId);

        this._renderPage();
        this._initAnomationAfterRender();
    }

    _initAnomationAfterRender() {
        super._initAnomationAfterRender();
        InitGalleryFuntion._initGLightbox('.portfolio-lightbox');
        DomEventFuntion._removePreload();
    }

    _renderLeftMenu() {
        super._renderLeftMenu();
        var menu = ``;
        this.details.chapters.forEach((item, index) => {
            menu += `<li>
                        <a href="${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${this.detailId}/chapter/?ch=${item.id}"
                            class="nav-link ps-4 scrollto ${item.id == this.chapterId ? 'active' : ''}">
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
                                        <div class="offcanvas-body p-0">
                                            <div class="offcanvas-body nav-menu">
                                            <ul>${menu}</ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
    }

    _renderContent() {
        super._renderContent();
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
                       ${this.galleryDisplayColHtml}
                    </div>

                    <div id="content-detail-area" class="row portfolio-container comic">${detail}</div>
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
        var _page = this;
        var renderImgs = this.chapter.renderImg;
        if (renderImgs && renderImgs.length > 3) {
            imgs = CommomFunction._createImgLinkLoop(renderImgs[0], renderImgs[1], parseInt(renderImgs[2]), parseInt(renderImgs[3]));
        }

        imgs.forEach((item, index) => {
            area += `<div class="${_page.galleryShowCol} portfolio-item filter_name">
                        <a href="${item}" class="portfolio-lightbox" data-gallery="gallery" data-zoomable="true" data-draggable="true">
                            <img src="${item}" class="img-fluid" alt="" onerror="this.src='${_page.rootUrl}/assets/img/error.png'" loading="lazy"/>
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