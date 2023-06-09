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
                } else if (this.groupId == constGallery) {
                    new GalleryViewerPage();
                }
                else {
                    new VideoPlayerPage();
                }
                break;
        }
    }

    static _getPage() {
        var lvl = location.pathname.split('/').length;
        var groupId = CommomFunction._getGroupIdFromPath();
        var page = '';
        switch (lvl) {
            case 7:
                // content
                if (groupId == Constants.galleryType.comic) {
                    page = '_content_comic'
                } else if (groupId == Constants.galleryType.video) {
                    page = '_content_video'
                } else {
                    page = '_content'
                }
                break;
            case 9:
                // detail
                if (groupId == Constants.galleryType.comic) {
                    page = '_detail_comic'
                } else if (groupId == Constants.galleryType.video) {
                    page = '_detail_video'
                } else {
                    page = '_detail'
                }
                break;
            case 10:
                // chapter
                if (groupId == Constants.galleryType.comic) {
                    page = '_chapter_comic'
                } else if (groupId == Constants.galleryType.video) {
                    page = '_player_video'
                }
                else {
                    page = '_viewer_gallery'
                }
                break;
        }

        return page;
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
        this.gridViewType = '';
        this.gridColShow = '';

        this.filters = '';
        this.glightBox = {};
        this.lGalleryFilters = {};

        //scrolling
        this.scrolling = false;
        this.page = 1;
        this.itemsPerPage = 240;
        this.throttleTimer = 1000;
        this.isLoading = false;

        this.themes = 'theme-dark';
        this.DefaultGalleyViewer = 12;
    }

    async _init() {
        this.galleryDisplayColHtml = this._renderGalleryShowColumn();
        var dataGallery = await CommomFunction._loadJsonAsync(this.loadGalleyPath);
        if (!dataGallery) {
            history.back();
        }
        this.gallery = dataGallery;

        var dataGalleryMenu = await CommomFunction._loadJsonAsync(this.loadGalleyTree);
        this.treeMenu = dataGalleryMenu;

        // setting theme
        this.themes = localStorage.getItem(Constants.ThemeKey);
        if (!this.themes) this.themes = Constants.ThemeStyle.dark;
        document.body.className = this.themes;
    }

    _initAnomationAfterRender() {
        Constants.IsotopeLoading = false;
        Constants.ListFitersLoading = true;
        DomEventFuntion._backToTop();
        return;
    }

    _initGallery() {
        var _page = this;
        this.glightBox = InitGalleryFuntion._initGLightbox('.portfolio-lightbox');
        DomEventFuntion._removePreload();

        if (!Constants.ListFitersLoading) return false;

        this.lGalleryFilters = InitGalleryFuntion._initListFilters('portfolio', {
            pagination: true,
            page: _page.itemsPerPage,
            valueNames: [
                { attr: 'data-filter', name: 'filter_name' }
            ]
        })

        document.querySelectorAll('.portfolio-flters-item').forEach(item => {
            item.addEventListener('click', (e) => {
                InitGalleryFuntion._eventfilterGallery(e.target, _page.lGalleryFilters, _page.glightBox);
            })
        });
    }

    _loadIsotopeImg = () => {
        var _page = this;
        var loadImg = setInterval(function () {
            console.log("img loading")
            var images = document.querySelectorAll('img');
            if (images.length == 0) {
                clearInterval(loadImg);
                return false;
            }

            InitGalleryFuntion._initIsotope();
            _page.isLoading = true;
            var load = images[images.length - 1].complete;
            if (load) {
                console.log("img loaded")
                clearInterval(loadImg);
                _page.isLoading = false;
                if (document.getElementById('loader')) document.getElementById('loader').classList.remove('show');
            }
        }, this.throttleTimer / 5)

        DomEventFuntion._backToTop();
    };

    _paggingHandler = (callback, time) => {

        var _page = this;
        // if (_page.isLoading) return false;
        if (_page.scrolling) return false;
        _page.scrolling = true;
        setTimeout(() => {
            callback();
            _page.scrolling = false;
        }, time);
    };

    _scrollHandler() {
        // if (this.isLoading) return false;

        if (!this.lGalleryFilters)
            return false;

        setTimeout(() => {
            InitGalleryFuntion._initIsotope();
        }, this.throttleTimer / 5)

        var currentItems = this.page * this.itemsPerPage;
        console.log(currentItems + "/" + this.lGalleryFilters.items.length)
        if (currentItems >= this.lGalleryFilters.items.length)
            return false;
        else
            document.getElementById('loader').classList.add('show');


        var _page = this;
        this._paggingHandler(() => {
            var endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
            if (endOfPage) {
                _page.page++;
                _page.lGalleryFilters.show(0, _page.page * _page.itemsPerPage);
                _page.glightBox.reload();
                _page._loadIsotopeImg();

            }
        }, this.throttleTimer);
    }


    _renderPage() {
        var content = this._renderContent();
        var sideMenu = this._renderSideMenu();
        var leftMenu = this._renderLeftMenu();

        var html = `<div class="container-fluid__">
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

                        <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel" data-bs-scroll="true" data-bs-backdrop="static__">
                            <div class="offcanvas-header">
                                <a href="${this.rootUrl}"><h3 id="offcanvasRightLabel" class="h3 p-0 my-0 text-uppercase text-muted">${Constants.pjName}</h3></a>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                            </div>
                            <div class="offcanvas-body px-0 pt-0 nav-menu">
                                ${menu}
                                <div class="change-theme px-5 py-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input mt-1" type="checkbox" id="change-theme-style" 
                                            ${this.themes == Constants.ThemeStyle.dark ? 'checked' : ''}
                                            onchange="DomEventFuntion._changeThemeStyle()">
                                        <label class="form-check-label" for="change-theme-style">Dark Theme</label>
                                    </div>
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
        var pageNane = Page._getPage();
        var viewType = localStorage.getItem(Constants.galleryCache.gridViewType + pageNane);
        var colShow = '';
        var colThumbs = '';
        var isMobile = CommomFunction._isMobile();
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
                colShow = 'col-md-3';
                colThumbs = 'thumbs-cover-height-4';
                break;
            case '6':
                colShow = 'col-md-2';
                colThumbs = 'thumbs-cover-height-6';
                break;
            default:
                colShow = isMobile ? 'col-6' : 'col-4';
                colThumbs = 'thumbs-cover-height-4';
        }

        this.galleryShowCol = colShow;
        this.galleryColThumbs = colThumbs;

        var isMobileShow = isMobile ? 'd-none' : '';
        return ` <div class="chapter-grid-view-style">
                    <div class="row justify-content-center text-end">
                        <div class="col-lg-12 my-3 fs-4 px-0">
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(1,'${pageNane}');" class="p-2 mx-1 grid-style" data-type="1"><i class="bi bi-list navbar-toggler"></i></a>
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(2,'${pageNane}');" class="p-2 mx-1 grid-style" data-type="2"><i class="bi bi-grid navbar-toggler"></i></i></a>
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(3,'${pageNane}');" class="p-2 mx-1 grid-style" data-type="3"><i class="bi bi-grid-3x3-gap navbar-toggler"></i></a>
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(4,'${pageNane}');" class="p-2 mx-1 grid-style ${isMobileShow} ${this.gridColShow}" data-type="4"><i class="bi bi-grid-3x3 navbar-toggler"></i></a>
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(6,'${pageNane}');" class="p-2 mx-1 grid-style ${isMobileShow} ${this.gridColShow}" data-type="6"><i class="bi bi-bricks navbar-toggler"></i></a>
                        </div>
                    </div>
                </div>`;
    }

    _renderVideoObject(playerInfo, subfix) {
        if (!subfix) {
            subfix = '';
        }
        var videoObject = '';
        var poster = `${this.rootUrl}/assets/img/default-video.png`;
        // poster = playerInfo.thumbs = '' ? poster : playerInfo.thumbs;

        var video = ''
        switch (playerInfo.scpType) {
            case Constants.videoScpType.video:
                video = `<video id="video_${playerInfo.id}_${subfix}" name='media' poster="${poster}">
                            <source src='${playerInfo.scpt}' type='video/mp4'>
                        </video>`;
                break;
            case Constants.videoScpType.iframe:
                video = `<iframe frameborder="0" src="${playerInfo.scpt}" allowfullscreen ></iframe>`
                break;
        }

        videoObject = `<div class ="video-wrapper" onclick="document.getElementById('video_${playerInfo.id}_${subfix}').controls = true;"> 
                        ${video}
                    </div>`;

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
        var background = Constants.BackGroundColor;
        var galleryInfo = '';
        this.gallery.children.forEach((item, index) => {
            galleryInfo += `<div class="py-5 ${background[index % 2]}">
                                <div class="card border-0 bg-transparent">
                                    <div class="card-body container">
                                        <h3 class="h3 text-capitalize"><a href="${this.rootUrl}/pages/${item.id}/">${item.name}</a></h3>
                                        <div class="text-muted">
                                            ${item.contents.join("")}
                                        </div>
                                    </div>
                                </div>
                            </div>`;
        })
        return `<div class="container__">
                    <div class="container"> 
                        <div class="row">
                            <h1 class="h1 text-capitalize pb-0 fw-bold">MYX<hr></h1>
                        </div>
                    </div>
                    <section id="about" class="about container_">
                        <div class="section-title">
                            <h2>About</h2>
                        </div>
                        <div class="container">
                            <div class="row pt-4 content text-center">
                                <div class="col-lg-12 text-muted">
                                    ${this.gallery.contents.join("")}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="facts" class="facts container__">
                        <div class="section-title">
                            <h2>Facts</h2>
                            <div class="container text-muted">${this.gallery.short}</div>
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
        var background = Constants.BackGroundColor;
        this.groups.children.forEach((item, index) => {
            html += `<section class="gallery-item py-5 ${background[index % 2]}">
                        <div class="section-title">
                            <h2 class="">
                                <a href="${path}/content/${item.id}">${item.name}<a>
                            </h2>
                        </div>
                        <div class="container">
                            <div class="row justify-content-center align-items-center">
                                <div class="col-lg-12 text-muted">${item.short}</div>
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
        Constants.ListFitersLoading = false;
        this._initGallery();
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
                
                    <section id="about" class="about row">
                        <div class="section-title">
                            <h2>About</h2>
                            <div class="fst-italic text-muted" id="content-short"></div>
                        </div>
                        <div class="col-12">
                            <div class="row">
                                <div id="content-description" class=" text-muted">${description}</div>
                            </div>
                        </div>
                    </section>
                
                    <section id="portfolio" class="portfolio section-bg gallery-content row">
                        <div class="section-title">
                            <h2> Gallery </h2>
                        </div>
                        <div class="col-12">
                            <div class="row justify-content-center">
                                <div id="portfolio-flters" class="portfolio-flters my-3">${filters}</div>
                            </div>
                        </div>
                        ${this._renderGalleryShowColumn()}
                        <div id="items-container">
                            <div id="content-detail-area" class="list row portfolio-container">${detail}</div>
                            <div class="loader" id="loader">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <div class="pagination" hidden></div>
                        </div>
                    </section>
                </div>`;
    }

    _renderContentDetails() {
        var area = '';
        var _page = this;
        this.contents.children.forEach(item => {
            var url = `${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${item.id}`
            area += `<div class="${_page.galleryShowCol} portfolio-item filter_name p-1">
                        <div class="portfolio-wrap">
                            <img src="${item.thumbs}" class="img-fluid thumbs bg-transparent border-0 rounded-4 ${_page.galleryColThumbs}" alt="" loading="lazy"  onerror="this.src='${_page.rootUrl}/assets/img/default-image.png'"/>
                            <div class="portfolio-info">
                                <h4>
                                    <a href="${url}" class="text-muted text-capitalize fw-bold">
                                        ${item.name}
                                    </a>
                                </h4>
                                <div class="text-muted text-capitalize">${item.short}</div>
                                <div class="portfolio-links">
                                    <a href="${item.thumbs}" class="portfolio-lightbox" data-type="image">
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
        Constants.IsotopeLoading = false;
        Constants.ListFitersLoading = false;

        this._initGallery();
        this._loadIsotopeImg();
    }

    _renderContent() {
        super._renderContent();
        var detail = this._renderContentDetails();
        var short = this.detailInfo.short;
        var description = this.detailInfo.contents.join('');
        var detailName = this.detailInfo.name;
        var contentName = this.contentInfo.name;
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

                    <section id="about" class="about row">
                        <div class="section-title">
                            <h2>About</h2>
                            <div class="fst-italic text-muted" id="content-short">${short}</div>
                        </div>
                        <div class="col-12">
                            <div class="row">
                                <div id="content-description" class="text-muted">${description}</div>
                            </div>
                        </div>
                    </section>

                    <section id="portfolio" class="portfolio section-bg row">
                        <div class="section-title">
                            <h2>Gallery</h2>
                        </div>
                        ${this.galleryDisplayColHtml}
                        <div id="items-container">
                            <div id="content-detail-area" class="list row portfolio-container">${detail}</div>
                            <div class="loader" id="loader">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <div class="pagination" hidden></div>
                        </div>
                    </section>
                
                </div>`;
    }

    _renderContentDetails() {
        var area = '';
        var _page = this;
        this.details.viewer.forEach((viewer, vIndex) => {
            var countHash = viewer.hashtags.length;
            var defaultGalleyImgs = [];
            var imgInLines = [];
            var imgHtml = '';
            var imgIndicators = '';

            // get imgs list
            viewer.hashtags.forEach((item) => {
                var renderImgs = item.renderImg;
                var imgRenders = [];
                if (renderImgs && renderImgs.length > 3) {
                    imgRenders = CommomFunction._createImgLinkLoop(renderImgs[0], renderImgs[1], parseInt(renderImgs[2]), parseInt(renderImgs[3]));
                }

                var renders = [...item.imgs, ...imgRenders];
                renders.forEach((path, index) => {
                    if (index > (_page.DefaultGalleyViewer / countHash) && Constants.galleryType.gallery == _page.groupId)
                        return;

                    defaultGalleyImgs.push(path);
                });
            })

            var colsplit = _page.galleryShowCol.split('-');
            var intCol = parseInt(_page.galleryShowCol.split('-')[colsplit.length - 1]);
            intCol = 12 / intCol;
            var inlineLegth = defaultGalleyImgs.length % intCol == 0 ? defaultGalleyImgs.length / intCol : defaultGalleyImgs.length / intCol + 1;
            imgInLines = Array.from({ length: inlineLegth }, () => defaultGalleyImgs.splice(0, intCol));

            imgInLines.forEach((arr, index) => {
                imgIndicators += `<button type="button" data-bs-target="#carousel-${vIndex}" data-bs-slide-to="${index}" class=" ${index == 0 ? 'active' : ''}" aria-current="true" aria-label="Slide ${index}"></button>`;
                var lines = '';
                arr.forEach((path, aIndex) => {
                    lines += `<div class="${_page.galleryShowCol} portfolio-item p-0 px-1 filter_name gallery">
                                            <div class="video-wrapper">
                                                <a href="${path}" class="portfolio-lightbox" data-zoomable="true" data-draggable="true" data-type="image">
                                                    <img src="${path}" class="img-fluid rounded-3 thumbs-cover" alt="" id="img-${aIndex}" loading="lazy"  onerror="this.src='${_page.rootUrl}/assets/img/default-image.png'"/>
                                                </a>
                                            </div>
                                        </div>`;
                })

                imgHtml += `<div class="carousel-item ${index == 0 ? 'active' : ''}">
                                    <div class="row">${lines}</div>
                                </div>`;

            })

            area += `<div class="col-12">
                        <div class="row">
                            <a href="${_page.rootUrl}/pages/${_page.groups.id}/content/${_page.contentId}/detail/${_page.detailId}/viewer/?v=${viewer.id}">
                                <h3 class="h2 pb-0 text-end text-capitalize">${viewer.name}</h3>
                            </a>
                        </div>
                        <div class="row">
                            <div id="carousel-${vIndex}" class="carousel slide" data-bs-ride="carousel">
                                <div class="carousel-indicators">
                                    ${imgIndicators}
                                </div>
                                <div class="carousel-inner">
                                    ${imgHtml}
                                </div>
                                <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${vIndex}" data-bs-slide="prev">
                                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span class="visually-hidden">Previous</span>
                                </button>
                                <button class="carousel-control-next" type="button" data-bs-target="#carousel-${vIndex}" data-bs-slide="next">
                                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span class="visually-hidden">Next</span>
                                </button>
                            </div>
                        </div>
                    </div>`;
        });

        return area;
    }

    _renderFilter() {
        return '';
    }
}

const GalleryViewerPage = class GalleryViewerPage extends PageBase {
    constructor() {
        super();
        this.viewerId = CommomFunction._getUrlParameter('v');
        this.viewer = {};
        this._init();
    }

    async _init() {
        await super._init();
        var dataGroup = await CommomFunction._loadJsonAsync(this.loadGroupPath);
        var dataContent = await CommomFunction._loadJsonAsync(this.loadContentPath);
        var dataDetail = await CommomFunction._loadJsonAsync(this.loadDetailPath);
        if (!this.viewerId || !dataGroup || !dataContent || !dataDetail) {
            history.back();
        }

        this.groups = dataGroup;
        this.contents = dataContent;
        this.details = dataDetail;
        this.contentInfo = this.groups.children.find(x => x.id == this.contentId);
        this.detailInfo = this.contents.children.find(x => x.id == this.detailId);
        this.viewer = this.details.viewer.find(x => x.id === this.viewerId);

        this._renderPage();
        this._initAnomationAfterRender();
    }

    _initAnomationAfterRender() {
        super._initAnomationAfterRender();
        Constants.IsotopeLoading = true;
        Constants.ListFitersLoading = true;

        this._initGallery();
        this._loadIsotopeImg();
        document.body.onscroll = () => { this._scrollHandler() };
    }

    _renderContent() {
        super._renderContent();
        var detail = this._renderContentDetails();
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
                            <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}/content/${this.contentId}/detail/${this.detailId}">${detailName}</i></a></li>
                            <li class="breadcrumb-item text-capitalize" active aria-current="page">${this.viewer.name}</li>
                            </ol>
                        </nav>
                    </div>
                   
                    <section id="portfolio" class="portfolio section-bg row">
                        <div class="section-title">
                            <h2>Gallery</h2>
                        </div>
                        <div class="col-lg-12">
                            <div class="row justify-content-center">
                                <div id="portfolio-flters" class="portfolio-flters my-3">${filters}</div>
                            </div>
                        </div>
                        ${this.galleryDisplayColHtml}
                        <div id="items-container">
                            <div id="content-detail-area" class="list row portfolio-container">${detail}</div>
                            <div class="loader" id="loader">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <div class="pagination" hidden></div>
                        </div>
                    </section>
                
                </div>`;
    }

    _renderContentDetails() {
        var area = '';
        var imgs = [];
        var _page = this;
        this.viewer.hashtags.forEach(item => {
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

            area += `<div class="${_page.galleryShowCol} portfolio-item p-1 filter_name ${filters}" data-filter="${filters}">
                    <a href="${item.path}" class="portfolio-lightbox" data-zoomable="true" data-draggable="true" data-type="image">
                        <img src="${item.path}" class="img-fluid rounded-3" alt="" id="img-${index}" loading="lazy"  onerror="this.src='${_page.rootUrl}/assets/img/default-image.png'"/>
                    </a>
                </div>`;
        });

        return area;
    }

    _renderFilter() {
        super._renderFilter();
        var tags = [];
        this.viewer.hashtags.forEach(item => {
            item.tags.forEach(val => {
                if (tags.includes(val)) {
                    return;
                }
                tags.push(val);
            });
        });

        var html = ''
        tags.sort().forEach((item, index) => {
            html += `<button class="btn btn-primary portfolio-flters-item col-auto m-1" data-filter="${item}_filters" id="btn-filter-detail-"${index}
                    onclick="">
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
        Constants.IsotopeLoading = false;
        Constants.ListFitersLoading = true;
        this._initGallery();
    }

    _renderContentDetails() {
        var area = '';
        var _page = this;
        this.contents.children.forEach(item => {
            var filters = '';
            item.hashtags.sort().forEach(val => {
                filters += val + '_filters ';
            });

            var url = `${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${item.id}`;
            area += `<div class="${_page.galleryShowCol} portfolio-item filter_name p-0 ${filters}" data-filter="${filters}">
                        <div class="portfolio-wrap">
                            <img src="${item.thumbs}" class="img-fluid img-thumbnail bg-transparent border-0 rounded-4 thumbs-cover ${_page.galleryColThumbs}" alt="" onerror="this.src='${_page.rootUrl}/assets/img/default-image.png'">
                            <div class="portfolio-info">
                                <h4 class="text-muted text-capitalize fw-bold">
                                    ${item.name}
                                </h4>
                                <div class="text-muted text-capitalize">${item.short}</div>
                                <div class="portfolio-links">
                                    <a href="${item.thumbs}" class="portfolio-lightbox" data-type="image">
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
            html += `<button class="btn btn-primary portfolio-flters-item col-auto m-1" data-filter="${item}_filters">${item.replaceAll('_', ' ')}</button>`;
        });

        return html;
    }
}

const ComicDetailPage = class ComicDetailPage extends DetailPage {
    constructor() {
        super();
    }

    _initAnomationAfterRender() {
        Constants.IsotopeLoading = false;
        Constants.ListFitersLoading = false;
        super._initAnomationAfterRender();
    }

    _renderContentDetails() {
        var area = '';
        var _page = this;
        this.details.chapters.forEach((item, index) => {

            var url = `${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${this.detailId}/chapter/?ch=${item.id}`;
            area += `<div class="${_page.galleryShowCol} portfolio-item filter_name p-0">
                        <div class="portfolio-wrap">
                            <img src="${item.thumbs}" class="img-fluid img-thumbnail bg-transparent border-0 rounded-4 thumbs-cover ${_page.galleryColThumbs}" alt="" onerror="this.src='${_page.rootUrl}/assets/img/default-image.png'">
                            <div class="portfolio-info">
                                <h4 class="text-muted text-capitalize truncate-overflow fw-bold px-4">
                                    ${item.name}
                                </h4>
                                <div class="portfolio-links">
                                    <a href="${item.thumbs}" class="portfolio-lightbox" data-type="image">
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

    _renderFilter() {
        return '';
    }
}

const ComicChapterPage = class ComicChapterPage extends PageBase {
    constructor() {
        super();
        this.chapterId = CommomFunction._getUrlParameter('ch');
        this.itemsPerPage = 300;
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
        this._initGallery();
        document.body.onscroll = () => { this._scrollHandler() };
    }

    _renderLeftMenu() {
        super._renderLeftMenu();
        var menu = ``;
        this.details.chapters.forEach((item, index) => {
            menu += `<li>
                        <a href="${this.rootUrl}/pages/${this.groupId}/content/${this.contentId}/detail/${this.detailId}/chapter/?ch=${item.id}"
                            class="nav-link ps-4 scrollto text-capitalize ${item.id == this.chapterId ? 'active' : ''}">
                            ${item.name}
                        </a>
                    </li>`;
        });

        return `<div class="row">
                    <div class="col-12"> 
                        <div class="offcanvas offcanvas-start" tabindex="-1" id="menuChapters" aria-labelledby="menuChapters" data-bs-scroll="true" data-bs-backdrop="static__">
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
                    

                    <section id="portfolio" class="portfolio section-bg row">
                        ${chapterName}
                        ${this.galleryDisplayColHtml}
                        <div id="items-container">
                            <div id="content-detail-area" class="list row portfolio-container comic">${detail}</div>
                            <div class="loader" id="loader">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <div class="pagination" hidden></div>
                        </div>
                        
                    </section>

                    <section>
                        ${chapterName}
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

        var renderGroupImgs = [];
        if (this.chapter.renderGroupImgs)
            this.chapter.renderGroupImgs.forEach(item => {
                var group = CommomFunction._createImgLinkLoop(item.prefix, item.subfix, parseInt(item.start), parseInt(item.end));
                renderGroupImgs = [...renderGroupImgs, ...group];
            })

        var imgs = [...this.chapter.imgs, ...imgRenders];
        imgs = [...imgs, ...renderGroupImgs]
        imgs.forEach((item, index) => {
            area += `<div class="${_page.galleryShowCol} portfolio-item filter_name p-1">
                        <a href="${item}" class="portfolio-lightbox" data-zoomable="true" data-draggable="true" data-type="image">
                            <img src="${item}" class="img-fluid" alt="" onerror="this.src='${_page.rootUrl}/assets/img/default-image.png'" loading="lazy"/>
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

        return `<div class="section-title pb-0">
                    <h2 id="chapter-name">
                        <a class="${clssPrev}" href="?c=${this.groupId}&d=${this.detailId}&ch=${prevChap}">
                            <i class="bi bi-arrow-left-short"></i>
                        </a>
                        <span class="text-capitalize fs-3">${this.chapter.name}</span>
                        <a class="${clssNext}" href="?c=${this.detailId}&d=${this.detailId}&ch=${nextChap}">
                            <i class="bi bi-arrow-right-short"></i>
                        </a>
                    </h2>
                    <div class="row justify-content-center">
                        <button class="navbar-toggler collapsed" type="button" data-bs-toggle="offcanvas" data-bs-target="#menuChapters">
                            <i class="bi bi-list navbar-toggler"></i>
                        </button>
                    </div>
                </div>
                `;
    }
}

const VideoDetailPage = class VideoDetailPage extends DetailPage {
    constructor() {
        super();
    }
    async _init() {
        this.gridColShow = 'd-none';
        this.gridViewType = localStorage.getItem(Constants.galleryCache.gridViewType + '_detail_video');
        await super._init();
    }

    _initAnomationAfterRender() {
        Constants.IsotopeLoading = false;
        Constants.ListFitersLoading = true;

        this._initGallery();
        this._loadIsotopeImg();
        document.body.onscroll = () => { this._scrollHandler() };
    }

    _renderContent() {
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
                   

                    <section id="about" class="about row">
                        <div class="section-title">
                            <h2>About</h2>
                            <div class="fst-italic text-muted" id="content-short">${short}</div>
                        </div>
                        <div class="col-12">
                            <div class="row">
                                <div id="content-description" class="text-muted">${description}</div>
                            </div>
                        </div>
                    </section>

                    <section id="portfolio" class="portfolio section-bg row">
                        <div class="section-title">
                            <h2>Gallery</h2>
                        </div>
                        <div class="col-lg-12">
                            <div class="row justify-content-center">
                                <div id="portfolio-flters" class="portfolio-flters my-3">${filters}</div>
                            </div>
                        </div>
                        ${this.galleryDisplayColHtml}
                        <div id="items-container" class="">
                            <div id="content-detail-area" class="list row portfolio-container px-2">${detail}</div>
                            <div class="loader" id="loader">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <div class="pagination" hidden></div>
                        </div>
                    </section>
                
                </div>`;
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
        var timelineKey = timelineKey.sort((a, b) => Date.parse(b) - Date.parse(a));

        var sizeChange = '';
        var background = Constants.BackGroundColor[1];
        var isMobile = CommomFunction._isMobile();
        var wrapperGallery = 'gallery';
        switch (this.gridViewType) {
            case '1':
                sizeChange = isMobile ? "col-4" : "col-2";
                background = Constants.BackGroundColor[0];
                break;
            case '2':
                sizeChange = 'col-md-12';
                wrapperGallery = isMobile ? 'gallery' : '';
                break;
            case '3':
                sizeChange = 'col-md-12';
                _page.galleryShowCol = isMobile ? "col-6" : "col-4";
                break;
        }

        timelineKey.forEach((line, index) => {
            var htmlLine = '';
            var linehash = '';
            timelines[line].forEach(item => {
                var filters = '';
                item.tags.sort().forEach(val => {
                    filters += val + '_filters ';
                });

                item.hashs.sort().forEach(val => {
                    filters += val + '_filters ';
                });

                linehash += ' ' + filters;
                var glightBoxDataType = 'external';
                if (item.scpType == Constants.videoScpType.video) {
                    glightBoxDataType = 'video';
                }

                var url = `${_page.rootUrl}/pages/${_page.groups.id}/content/${_page.contentId}/detail/${_page.detailId}/player/?vs=${item.id}`;
                if (this.gridViewType == '1') {
                    htmlLine += `
                                <div class="${_page.galleryShowCol} portfolio-item filter_name ${filters} videos p-0 mb-1 rounded-4 ${background}" id="timeline-${index}">
                                    <div class="row ${wrapperGallery}">
                                        <div class="${sizeChange}">
                                            <div class="video-wrapper">
                                                <a href="${item.scpt}" class="portfolio-lightbox" data-zoomable="true" data-draggable="true" data-type="${glightBoxDataType}">
                                                    <img src="${item.thumbs}" class="img-fluid thumbs thumbs-cover" alt="" onerror="this.src='${_page.rootUrl}/assets/img/default-image.png'" loading="lazy"/>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="col m-auto px-0">
                                            <div class="lh-sm m-2 pb-0 text-start truncate-overflow">
                                                <a class="text-capitalize h2 fs-5" href="${_page.rootUrl}/pages/${_page.groups.id}/content/${_page.contentId}/detail/${_page.detailId}/player/?vs=${item.id}">${item.name}</a>
                                            </div>
                                            <div class="text-capitalize fs-6 lh-sm m-2 truncate-overflow text-start">
                                                ${item.short}
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                } else {
                    htmlLine += `
                                <div class="${_page.galleryShowCol} portfolio-item ${filters} filter_name p-1" id="timeline-${index}1">
                                    <div class="portfolio-wrap ${wrapperGallery}">
                                        <div class="video-wrapper">
                                            <img src="${item.thumbs}" class="img-fluid thumbs thumbs-cover bg-transparent border-0 rounded-4 ${_page.galleryColThumbs}" alt="" loading="lazy"  onerror="this.src='${_page.rootUrl}/assets/img/default-image.png'"/>
                                        </div>
                                        <div class="portfolio-info">
                                            <h4 class="text-capitalize fw-bold truncate-overflow-one px-4">
                                                ${item.name}
                                            </h4>
                                            <div class="text-muted text-capitalize lh-sm truncate-overflow px-4">${item.short}</div>
                                            <div class="portfolio-links">
                                                <a href="${item.scpt}" class="portfolio-lightbox" data-type="${glightBoxDataType}">
                                                    <i class="bi bi-plus-lg"></i>
                                                </a>
                                                <a href="${url}" class="portfolio-details-lightbox" title="${item.name}">
                                                    <i class="bi bi-link-45deg"></i>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                }
            });

            area += `<div class="col-12 px-1 ${linehash}"  data-bs-toggle="collapse" data-bs-target="#timeline-${index}" aria-expanded="false">
                        <h3 class="h3 text-end fs-5 pb-0 mt-5">${new Date(line).toDateString()}<hr/></h3>
                    </div>
                    ${htmlLine}
                    `;
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

            item.videos.forEach(videos => {
                videos.hashs.forEach(val => {
                    if (tags.includes(val)) {
                        return;
                    }
                    tags.push(val);
                });
            });
        });

        var html = ''
        tags.sort().forEach(item => {
            html += `<button class="btn btn-primary portfolio-flters-item col-auto m-1 text-capitalize" data-filter="${item}_filters">
                        ${item.replace('_', ' ')}
                    </button>`;
        });

        return html;
    }
}

const VideoPlayerPage = class VideoPlayerPage extends PageBase {
    constructor() {
        super();
        this.playerId = CommomFunction._getUrlParameter('vs');
        this.players = [];
        this.playerInfo = {};
        this.galleryColRelationThumbs = '';
        this.gridViewType = localStorage.getItem(Constants.galleryCache.gridViewType + '_player_video');
        if (!this.gridViewType) {
            this.gridViewType = '2';
        }
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
        Constants.ListFitersLoading = false;
        this._initGallery();
    }

    _renderContent() {
        super._renderContent();
        var detailName = this.detailInfo.name;
        var contentName = this.contentInfo.name;
        var detailInfo = this._renderContentDetails();

        var sizeContainerChange = (this.gridViewType && parseInt(this.gridViewType) > 1) ? 'container' : 'container-fluid';

        return `<div class="container">
                    <div class="row">
                        <h1 class="h1 px-2 text-capitalize pb-0">${detailName}<hr/></h1>
                    </div>
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="${this.rootUrl}"><i class="bi bi-house-door-fill"></i></a></li>
                            <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}">${this.groups.name}</i></a></li>
                            <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}/content/${this.contentId}">${contentName}</i></a></li>
                            <li class="breadcrumb-item text-capitalize"><a href="${this.rootUrl}/pages/${this.groups.id}/content/${this.contentId}/detail/${this.detailId}">${detailName}</i></a></li>
                        </ol>
                    </nav>
                </div>
                
                <div class="${sizeContainerChange}">
                    <div class="row">
                        <div class="${this.galleryShowCol}">
                            <div class="row portfolio-container">
                                <div class="col-12">
                                    ${this._renderVideoObject(this.playerInfo)}
                                </div>
                            </div>
                           
                        </div>
                    </div>
                </div>

                <div class="container">
                    ${detailInfo}
                    ${this._renderRelationVideo()}
                </div>`;
    }

    _renderContentDetails() {
        return `
                ${this._renderGalleryShowColumn()}
                <div class="row">
                    <h2 class="text-start h2 text-capitalize">${this.playerInfo.name}</h2>
                    <div class="col-12 fst-italic text-capitalize">
                        ${this.playerInfo.short}
                    </div>
                    <div class="col-12 fw-bold py-2">
                        ${this.playerInfo.hashs.join(" ")}
                    </div>
                    <div class="col-12 py-5">
                        ${this.playerInfo.contents.join(" ")}
                    </div>
                </div>`;
    }

    _renderRelationVideo() {
        var html = '';
        var _page = this;
        this.players.forEach(item => {
            if (item.id == _page.playerId) {
                return;
            }

            var glightBoxDataType = 'external';
            if (item.scpType == Constants.videoScpType.video) {
                glightBoxDataType = 'video';
            }

            var isMobile = CommomFunction._isMobile();
            var background = Constants.BackGroundColor[0];

            var url = `${_page.rootUrl}/pages/${_page.groups.id}/content/${_page.contentId}/detail/${_page.detailId}/player/?vs=${item.id}`;
            if (this.gridViewType == '1') {
                html += `<div class="portfolio-item filter_name p-0 mb-1 rounded-4 ${background}">
                            <div class="row gallery">
                                <div class="${isMobile ? 'col-4' : 'col-2'}">
                                    <div class="video-wrapper">
                                        <a href="${item.scpt}" class="portfolio-lightbox" data-zoomable="true" data-draggable="true" data-type="${glightBoxDataType}">
                                            <img src="${item.thumbs}" class="img-fluid thumbs thumbs-cover" alt="" onerror="this.src='${_page.rootUrl}/assets/img/default-image.png'" loading="lazy"/>
                                        </a>
                                    </div>
                                </div>
                                <div class="col m-auto px-0">
                                    <div class="lh-sm m-2 pb-0 text-start truncate-overflow">
                                        <a class="text-capitalize h2 fs-5" href="${url}">${item.name}</a>
                                    </div>
                                    <div class="text-capitalize fs-6 lh-sm m-2 truncate-overflow text-start">
                                        ${item.short}
                                    </div>
                                </div>
                            </div>
                        </div>`;
            } else {
                var colShowR = isMobile ? 'col-6' : 'col-xl-2 col-lg-3 col-md-6 col-6';
                html += `<div class="${colShowR} portfolio-item video-relation filter_name p-1" >
                            <div class="portfolio-wrap gallery">
                                <div class="video-wrapper">
                                    <a href="${item.scpt}"
                                        class="portfolio-lightbox" data-zoomable="true" data-draggable="true" data-type="${glightBoxDataType}">
                                        <img src="${item.thumbs}" class="img-fluid thumbs thumbs-cover bg-transparent border-0 rounded-4" alt="" onerror="this.src='${_page.rootUrl}/assets/img/default-image.png'" loading="lazy" />
                                    </a>
                                </div>
                                <div class="portfolio-info">
                                    <h4 class="text-capitalize fw-bold truncate-overflow px-4 fs-6">
                                        ${item.name}
                                    </h4>
                                    <div class="portfolio-links">
                                        <a href="${item.scpt}" class="portfolio-lightbox" data-type="${glightBoxDataType}">
                                            <i class="bi bi-plus-lg"></i>
                                        </a>
                                        <a href="${url}" class="portfolio-details-lightbox" title="${item.name}">
                                            <i class="bi bi-link-45deg"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div> `;
            }
        })

        return `<div class="row">
                    <div class="col-md-12">
                        <h3 class="h3 fs-3 py-0">Relations<hr /></h3>
                    </div>
                </div>
                <div class="container"><div class="row portfolio">${html}</div></div>`;
    }

    _renderGalleryShowColumn() {
        var viewType = this.gridViewType;
        this.galleryShowCol = 'col-md-12';

        return ` <div class="col-12">
                    <div class="row justify-content-center chapter-grid-view-style">
                        <div class="col-lg-12 text-end">
                            <div class="my-1 fs-4">
                                <a href="javascript:DomEventFuntion._changeViewPageStyle(2,'_player_video');" class="p-2 mx-1 grid-style ${viewType == 2 ? 'd-none' : ''}" data-type="2"><i class="bi bi-fullscreen-exit navbar-toggler"></i></i></a>
                            <a href="javascript:DomEventFuntion._changeViewPageStyle(1,'_player_video');" class="p-2 mx-1 grid-style ${viewType == 1 ? 'd-none' : ''}" data-type="1"><i class="bi bi-fullscreen navbar-toggler"></i></a>
                            </div>
                        </div>
                    </div >
                </div > `;
    }
}