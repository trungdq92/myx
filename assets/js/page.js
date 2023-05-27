const Page = class Page {
    constructor() {
        // get lv tree
        var lvl = location.pathname.split('/').length;
        this.groupId = CommomFunction._getGroupIdFromPath();
        var constComic = Constants.galleryType.comic;
        var constGallery = Constants.galleryType.gallery;
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
                } else if (this.groupId == constGallery) {
                    new DetailPage();
                } else {
                    new VideoDetailPage();
                }
                break;
            case 10:
                // chapter
                if (this.groupId == constComic) {
                    new ComicChapterPage();
                } else {
                    new VideoPlayerPage();
                }
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
        Constants.IsotopeLoading = false;
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
                colShow = 'col-12';
                colThumbs = 'thumbs-cover-height-1';
                break;
            case '2':
                colShow = 'col-6';
                colThumbs = 'thumbs-cover-height-2';
                break;
            case '3':
                colShow = 'col-4';
                colThumbs = 'thumbs-cover-height-3';
                break;
            case '4':
                colShow = 'col-3';
                colThumbs = 'thumbs-cover-height-4';
                break;
            case '6':
                colShow = 'col-2';
                colThumbs = 'thumbs-cover-height-6';
                break;
            default:
                colShow = 'col-4';
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

    _renderVideoObject(playerInfo) {
        var videoObject = '';
        if (playerInfo.scpType == Constants.videoScpType.video) {
            videoObject = `<div class ="video-wrapper" onclick="document.getElementById('video_${playerInfo.id}').controls = true;"> 
                                <video id="video_${playerInfo.id}" name='media' poster="https://www.keytechinc.com/wp-content/uploads/2022/01/video-thumbnail.jpg">
                                    <source src='${playerInfo.scpt}' type='video/mp4'>
                                </video>
                            </div>`;
        }

        return videoObject;
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
        var background = ["#272829", "transparent"];
        var galleryInfo = '';
        this.gallery.children.forEach((item, index) => {
            galleryInfo += `<div class="row py-5" style="background: ${background[index % 2]}">
                                <div class="card border-0 bg-transparent">
                                    <div class="card-body container">
                                        <h3 class="h3 text-capitalize"><a href="${this.rootUrl}/pages/${item.id}/">${item.name}</a></h3>
                                        <p class="text-muted">
                                        ${item.contents.join("")}
                                        </p>
                                    </div>
                                </div>
                            </div>`;
        })
        return `<div class="container__">
                    <section id="about" class="about container">
                        <div class="section-title">
                            <h2>About</h2>
                        </div>
                        <div class="row justify-content-center container">
                            <div class="col-lg-12 pt-4 content text-center">
                                <p>
                                ${this.gallery.contents.join("")}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section id="facts" class="facts container__">
                        <div class="section-title">
                            <h2>Facts</h2>
                            <p class="container">${this.gallery.short}</p>
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
        return `<div class="container"> 
                    <div class="row">
                        <h1 class="h1 text-capitalize pb-0">${this.groups.name}<hr /></h1>
                    </div>
                    <div class="">
                        <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="${this.rootUrl}"><i class="bi bi-house-door-fill"></i></a></li>
                        <li class="breadcrumb-item text-capitalize" active aria-current="page">${this.groups.name}</li>
                        </ol>
                    </nav>
                    </div>
                </div>
                <div id="group-content-detail-area">${detail}</div>`;
    }

    _renderContentDetails() {
        var path = `${this.rootUrl}/pages/${this.groupId}`
        var html = '';
        var _page = this;
        var background = ["#272829", "transparent"];
        this.groups.children.forEach((item, index) => {
            html += `<section class="gallery-item p-5" style="background: ${background[index % 2]}">
                        <div class="section-title">
                            <h2 class="bg-transparent">
                                <a href="${path}/content/${item.id}">${item.name}<a>
                            </h2>
                        </div>
                        <div class="container">
                            <div class="row justify-content-center align-items-center">
                                <div class="col-lg-12">${item.short}</div>
                            </div>
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
        return `<div class="container">
                    <div class="row">
                        <h1 class="h1 text-capitalize pb-0">${contentName}<hr /></h1>
                    </div>
                   <div>
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="${this.rootUrl}"><i class="bi bi-house-door-fill"></i></a></li>
                            <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}">${this.groups.name}</i></a></li>
                            <li class="breadcrumb-item text-capitalize" active aria-current="page">${contentName}</li>
                            </ol>
                        </nav>
                   </div>
                
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
                        ${this._renderGalleryShowColumn()}
                        <div id="content-detail-area" class="portfolio-container row list">${detail}</div>
                    </section>
                </div>`;
    }

    _renderContentDetails() {
        var area = '';
        var _page = this;
        this.contents.children.forEach(item => {
            var url = `${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${item.id}`
            area += `<div class="${_page.galleryShowCol} portfolio-item">
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
        Constants.IsotopeLoading = true;
        this.glightBox = InitGalleryFuntion._initGLightbox('.portfolio-lightbox');
        this.lGalleryFilters = InitGalleryFuntion._initListFilters('portfolio', {
            valueNames: [
                { attr: 'data-filter', name: 'filter_name' }
            ]
        })

        var loadImg = setInterval(function () {
            console.log("img loading")
            var images = document.querySelectorAll('img');
            if (images.length == 0) {
                clearInterval(loadImg);
                return false;
            }

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
        return `<div class="container">
                    <div class="row">
                        <h1 class="h1 text-capitalize pb-0">${contentName}<hr /></h1>
                    </div>
                    <div class="row">
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="${this.rootUrl}"><i class="bi bi-house-door-fill"></i></a></li>
                            <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}">${this.groups.name}</i></a></li>
                            <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}/content/${this.contentId}">${contentName}</i></a></li>
                            <li class="breadcrumb-item text-capitalize" active aria-current="page">${detailName}</li>
                            </ol>
                        </nav>
                    </div>
                   

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
                        <div id="content-detail-area" class="list row portfolio-container">${detail}</div>
                    </section>
                
                </div>`;
    }

    _renderContentDetails() {
        var area = '';
        var imgs = [];
        var _page = this;
        this.details.hashtags.forEach(item => {
            var renderImgs = item.renderImg;
            var imgRenders = [];
            if (renderImgs && renderImgs.length > 3) {
                imgRenders = CommomFunction._createImgLinkLoop(renderImgs[0], renderImgs[1], parseInt(renderImgs[2]), parseInt(renderImgs[3]));
            }

            var renders = [...item.imgs, ...imgRenders];
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

            area += `<div class="${_page.galleryShowCol} portfolio-item filter_name ${filters}" data-filter="${filters}">
                    <div class="portfolio-wrap">
                        <img src="${item.thumbs}" class="img-fluid img-thumbnail thumbs-cover ${_page.galleryColThumbs}" alt="" onerror="this.src='${_page.rootUrl}/assets/img/error.png'">
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
        Constants.IsotopeLoading = false;
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
        return `<div class="container">
                    <div class="row">
                        <h1 class="h1 text-capitalize pb-0">${detailName}<hr /></h1>
                    </div>
                    <div class="row">
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="${this.rootUrl}"><i class="bi bi-house-door-fill"></i></a></li>
                            <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}">${this.groups.name}</i></a></li>
                            <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}/content/${this.contentId}">${contentName}</i></a></li>
                            <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}/content/${this.contentId}/detail/${this.detailId}">${detailName}</i></a></li>
                            <li class="breadcrumb-item text-capitalize" active aria-current="page">${this.chapter.name}</li>
                            </ol>
                        </nav>
                    </div>
                    

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
                    </section>
                </div>`;
    }

    _renderContentDetails() {
        var area = '';
        var _page = this;

        var imgRenders = [];
        var renderImgs = this.chapter.renderImg;
        if (renderImgs && renderImgs.length > 3) {
            imgRenders = CommomFunction._createImgLinkLoop(renderImgs[0], renderImgs[1], parseInt(renderImgs[2]), parseInt(renderImgs[3]));
        }

        var imgs = [...this.chapter.imgs, ...imgRenders];
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

const VideoDetailPage = class VideoDetailPage extends DetailPage {
    constructor() {
        super();
    }

    _initAnomationAfterRender() {
        super._initAnomationAfterRender();
        Constants.IsotopeLoading = false;
        DomEventFuntion._removePreload();
    }

    _renderContentDetails() {
        var area = '';
        var timelines = [];
        var links = [];
        var _page = this;
        this.details.hashtags.forEach(item => {
            item.videos.forEach(info => {
                info.tags = item.tags;
                links.push(info);
            });
        });

        //timeline
        timelines = CommomFunction._groupBy(links, 'times');
        var timelineKey = Object.keys(timelines);

        timelineKey.forEach(line => {
            var htmlLine = `<div class="row"><div class="col"><h3 class="h3 text-start fs-5">${line}<hr/></h3></div></div>`;
            timelines[line].forEach((item, index) => {
                var filters = '';
                item.tags.sort().forEach(val => {
                    filters += val + '_filters ';
                });

                var videoObject = this._renderVideoObject(item);

                htmlLine += `<div class="${_page.galleryShowCol} portfolio-item filter_name ${filters} videos" data-filter="${filters}">
                                <div class="row">
                                    <div class="col-4">
                                        ${videoObject}
                                    </div>
                                    <div class="col">
                                        <div class="text-capitaliz fs-6 lh-sm truncate-overflow ps-0 pe-3">
                                            <a href="${_page.rootUrl}/pages/${_page.groups.id}/content/${_page.contentId}/detail/${_page.detailId}/player/?vs=${item.id}">${item.name}</a>
                                        </div>
                                        <div class="text-capitaliz fs-6 lh-sm truncate-overflow ps-0 pe-3 pt-2">
                                            ${item.short}
                                        </div>
                                    </div>
                                </div>
                                
                                
                            </div>`;
            });

            area += `${htmlLine}`
        });



        return area;
    }
}

const VideoPlayerPage = class VideoPlayerPage extends PageBase {
    constructor() {
        super();
        this.playerId = CommomFunction._getUrlParameter('vs');
        this.players = [];
        this.playerInfo = {};
        this.thumbsLeftDisplay = '';
        this.thumbsFooterDisplay = '';
        this._init();
    }

    async _init() {
        await super._init();

        var dataGroup = await CommomFunction._loadJsonAsync(this.loadGroupPath);
        var dataContent = await CommomFunction._loadJsonAsync(this.loadContentPath);
        var dataDetail = await CommomFunction._loadJsonAsync(this.loadDetailPath);
        if (!this.playerId || !dataGroup || !dataContent || !dataDetail) {
            history.back();
        }

        this.groups = dataGroup;
        this.contents = dataContent;
        this.details = dataDetail;

        var _page = this;
        this.details.hashtags.forEach(item => {
            item.videos.forEach(info => {
                info.tags = item.tags;
                _page.players.push(info);
            });
        });

        this.playerInfo = this.players.find(x => x.id == this.playerId);
        this.contentInfo = this.groups.children.find(x => x.id == this.contentId);
        this.detailInfo = this.contents.children.find(x => x.id == this.detailId);

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
        var detailName = this.detailInfo.name;
        var contentName = this.contentInfo.name;
        var relationVideo = this._renderRelationVideo();
        var showCol = this._renderGalleryShowColumn();
        return `<div class="container">
                    <div class="row">
                        <h1 class="h1 px-2 text-capitalize">${detailName}</h1>
                    </div>

                    <div class="row">
                        <div class="${this.galleryShowCol}">
                            <div id="content-detail-area" class="row portfolio-container">${detail}</div>
                        
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                    <li class="breadcrumb-item"><a href="${this.rootUrl}"><i class="bi bi-house-door-fill"></i></a></li>
                                    <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}">${this.groups.name}</i></a></li>
                                    <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}/content/${this.contentId}">${contentName}</i></a></li>
                                    <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}/content/${this.contentId}/detail/${this.detailId}">${detailName}</i></a></li>
                                </ol>
                            </nav>

                            ${showCol}
                            
                            <h2 class="text-start h2 text-capitalize">${this.playerInfo.name}</h2>
                            <div class="row">
                                <div class="col-12 fst-italic">
                                    ${this.playerInfo.short}
                                </div>
                            </div>
                            <div class="row py-2">
                                <div class="col-12 fw-bold">
                                    ${this.playerInfo.hashs.join(" ")}
                                </div>
                            </div>
                            <div class="row py-5">
                                <div class="col-12">
                                    ${this.playerInfo.contents.join(" ")}
                                </div>
                            </div>
                            
                        </div>
                        <div class="col ${this.galleryColThumbs} ${this.thumbsLeftDisplay}">
                            <div class="row"><div class="col-md-12"><h3 class="h3 py-0">Relations<hr/></h3></div></div>
                            ${relationVideo}
                        </div>
                        <div class="col-12 ${this.thumbsFooterDisplay}">
                            <div class="row"><div class="col-md-12"><h3 class="h3 py-0">Relations<hr/></h3></div></div>
                            <div class="row">${this._renderFooterRelationVideo()}</div>
                        </div>
                    </div>
                </div>`;
    }

    _renderContentDetails() {
        var videoObject = this._renderVideoObject(this.playerInfo);
        return `<div class="col-12">
                    ${videoObject}
                </div>`;
    }

    _renderRelationVideo() {
        var html = '';
        var _page = this;
        this.players.forEach(item => {
            if (item.id == _page.playerId) {
                return;
            }
            html += `<div class="row pb-2">
                        <div class="col-5">
                            ${_page._renderVideoObject(item)}
                        </div>
                        <div class="col ps-0">
                            <div class="text-capitaliz fs-6 lh-sm truncate-overflow">${item.name}</div>
                        </div>
                    </div>`;
        })

        return html;
    }
    _renderFooterRelationVideo() {
        var html = '';
        var _page = this;
        this.players.forEach(item => {
            if (item.id == _page.playerId) {
                return;
            }
            html += `<div class="col-4">
                        <div class="row pb-4">
                            <div class="col-5">
                                ${_page._renderVideoObject(item)}
                            </div>
                            <div class="col ps-0">
                                <div class="text-capitaliz fs-6 lh-sm truncate-overflow">${item.name}</div>
                            </div>
                        </div>
                    </div>`;
        })

        return html;
    }

    _renderGalleryShowColumn() {
        var viewType = localStorage.getItem(Constants.galleryCache.gridViewType);
        var colShow = 'col-md-9';
        var colThumbs = 'col-md-3';
        this.thumbsLeftDisplay = '';
        this.thumbsFooterDisplay = '';
        switch (viewType) {
            case '1':
                colShow = 'col-md-12';
                colThumbs = 'offset-md-9 col';
                this.thumbsLeftDisplay = 'd-none';
                this.thumbsFooterDisplay = '';
                break;
            case '2':
                colShow = 'col-md-9';
                colThumbs = 'col-md-3';
                this.thumbsLeftDisplay = '';
                this.thumbsFooterDisplay = 'd-none';
                break;
        }

        this.galleryShowCol = colShow;
        this.galleryColThumbs = colThumbs;

        return ` <div class="row justify-content-center chapter-grid-view-style">
                    <div class="col-lg-12 text-end">
                        <div class="my-3 fs-4">
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(1);" class="p-2 mx-1 grid-style" data-type="1"><i class="bi bi-list navbar-toggler"></i></a>
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(2);" class="p-2 mx-1 grid-style" data-type="2"><i class="bi bi-grid navbar-toggler"></i></i></a>
                        </div>
                    </div>
                </div>`;
    }
}