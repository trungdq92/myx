var lastScrollTop = 0;
var showStickTop = 0;
$(window).scroll(function (e) {
    var $el = $('.title-page');
    var st = $(this).scrollTop();
    if (st > lastScrollTop) {
        // down scroll code
        $el.removeClass('sticky-top');
    } else {
        // up scroll code
        showStickTop = showStickTop + lastScrollTop - st;
        if (showStickTop > 100) {
            $el.addClass('sticky-top');
            showStickTop = 0;
        }
    }
    lastScrollTop = st;
});

function renderGalleryImgHtml(item) {
    return `<div class="card card-pin border-0 bg-transparent mb-1">
                <div class="portfolio-wrap bg-transparent rounded-2 shadow-sm  d-flex justify-content-center">
                    <img src="${item.script}" class="img-fluid" alt="" loading="lazy" onerror="this.src='${item.rootUrl}/assets/img/default-image.png'" />
                    <div class="portfolio-info">
                        <div class="portfolio-links">
                            <a href="${item.script}" class="portfolio-lightbox" data-type="image"><i class="bi bi-plus-lg"></i></a>
                            <a href="#">
                                <i class="bi bi-link-45deg"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>`
}

function renderVideoHtml(item, index, total) {
    var col = 'col-md-3 col-6'
    if (index == 0 && total && total > 1) {
        col = 'col-md-6 col-12'
    }
    if (index == 1 && total && total > 2) {
        col = 'col-md-6 col-6'
    }
    return `<div class="${col} my-3 video-item">
                <div class="card border-0">
                    <div class="video-wrapper position-relative">
                        <a href="${item.rootUrl}/pages/video/viewer/?id=${item.id}&pid=${item.postId}">
                            <img src="${item.thumbnail}" class="img-fluid thumbs thumbs-cover rounded-3" alt="" onerror="this.src='${item.rootUrl}/assets/img/default-image.png'" loading="lazy" />
                        </a>
                    </div>
                    <div class="card-body px-0">
                        <div class="data-block-indicators">
                            <i class="bi bi-play-fill"></i> ${item.totalDue} min
                        </div>
                        <h5 class="card-title text-capitalize text-truncate">
                            <a class="color-unset" href="${this.rootUrl}/pages/video/viewer/?id=${item.id}&pid=${item.postId}">${item.name}</a>
                        </h5>
                        <h6 class="card-subtitle mb-2 text-muted text-truncate" style="font-size:smaller">
                            ${item.totalView} Views <span>・</span>  ${item.createdAt.slice(0, 16).replace('T', ' ')}
                        </h6>
                    </div>
                </div>
            </div>`
}

function renderComicBookHtml(item) {
    return `<div class="comic-book-card p-1 col-md-auto col-6">
                <div class="card border-0 my-1 shadow">
                    <img src="${item.thumbnail}" class="img-fluid w-100 rounded-0 rounded-top" alt="" loading="lazy" onerror="this.src='${item.rootUrl}/assets/img/default-image.png'" />
                    <div class="card-body">
                        <h5 class="card-title text-truncate" style="max-width:150px">${item.name}</h5>
                        <h6 class="card-subtitle mb-2 text-muted text-truncate" style="font-size: smaller;">
                                ${item.artistId.replace("_", " ")}
                                <br />
                                ${item.createdAt.slice(0, 10)}
                                <br />
                                ${item.totalView} Views <span>・</span> ${item.totalChap} Chaps
                        </h6>
                        <div class="card-text">
                            ${item.description.slice(0, 50)}
                        </div>
                        <a href="${item.rootUrl}/pages/comic/chapter/?id=${item.id}&pid=${item.postId}" class="card-link">Read</a>
                    </div>
                </div>
            </div>`
}

const Page = class Page {
    constructor(pageId) {
        this.pageId = pageId
        if (this.pageId === 'gallery') return new GalleryPage();
        if (this.pageId === 'gallery_post') return new GalleryPostPage();
        if (this.pageId === 'video') return new VideoPage();
        if (this.pageId === 'video_post') return new VideoPostPage();
        if (this.pageId === 'video_viewer') return new VideoViewerPage();
        if (this.pageId === 'comic') return new ComicPage();
        if (this.pageId === 'comic_post') return new ComicPostPage();
        if (this.pageId === 'comic_chapter') return new ComicChapterPage();
        if (this.pageId === 'comic_viewer') return new ComicViewerPage();
        if (this.pageId === 'advance') return new AdvancePage();
        return new PostPage();
    }
}

const PageBase = class PageBase {
    constructor() {
        this.rootUrl = CommonFunction._domainPath();
        this._component = CommonFunction._getGroupIdFromPath();
    }

    async _init() {
        $('#container-area').append(this._renderMenu());
    }

    _renderMenu() {
        var html = `<button class="btn btn-primary btn-menu btn__moveable border-0 shadow rounded-circle m-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMenu">
                        <i class="bi bi-list"></i>
                    </button>
                    <div class="offcanvas offcanvas-start w-100" tabindex="-1" id="offcanvasMenu">
                        <div class="offcanvas-header">
                            <h5 class="offcanvas-title text-capitalize">${Constants.pjName}</h5>
                            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div class="offcanvas-body">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item ${this._component == 'gallery' ? "active" : ""}"> 
                                    <a class="w-100 d-flex" href="${rootUrl}/pages/gallery" style="color:unset;">Gallery</a>
                                </li>
                                <li class="list-group-item ${this._component == 'video' ? "active" : ""}">
                                    <a class="w-100 d-flex" href="${rootUrl}/pages/video" style="color:unset;">Video</a>
                                </li>
                                <li class="list-group-item ${this._component == 'comic' ? "active" : ""}">
                                    <a class="w-100 d-flex" href="${rootUrl}/pages/comic" style="color:unset;">Comic</a>
                                </li>
                                <li class="list-group-item ${this._component == 'advance' ? "active" : ""}">
                                    <a class="w-100 d-flex" href="${rootUrl}/pages/advance" style="color:unset;">Advance</a>
                                </li>
                            </ul>
                        </div>
                    </div>`;
        return html;
    }
}

class PostPage extends PageBase {
    constructor() {
        super();
        this._galleryGLightBox = null
        this._pageIndex = 0;
        this._totalCount = 0;
        this._totalPage = 0;
        this._pageSize = 20;
        this._sortBy = 'id=desc';
        this._cardColumnsGap = 'card-columns-gap-3';
        this._init();
    }

    async _init() {
        await super._init()
        var _page = this;
        $('#container-area').append(await this._renderContent());

        this._galleryGLightBox = _initGLightbox('.portfolio-lightbox');
        $('#show-more').click(() => { this.loadMore() });
        $('.btn-change-grid').click((e) => {
            var type = $(e.currentTarget).attr('data-type');
            this._changeViewPageStyle(type)
        });
        $('#btnFilter').click((e) => this._filter());
        $(".btnSort").click((e) => {
            var sort = $(e.currentTarget).attr('data-sort');
            _page._sortBy = sort;
            _page._filter();
        });
        await this._filter();
    }

    async _renderContent() {
        var html =
            `<div class="container">
                ${this._renderTitlePage()}
                ${await this._renderFilter()}
                ${await this._renderGallery()}
            </div>`
        return html;
    }

    _renderTitlePage() {
        return `<div class="title-page sticky-top">
                    <div class="container">
                        <div class="row">
                            <h5 class="h1 text-capitalize fw-bold">${this._component || Constants.pjName}</h5>
                        </div>
                        <div class="row text-mute" style="font-size:smaller">
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                    <li class="breadcrumb-item"><a href="/${Constants.pjName}" class="active"><i class="bi bi-house-fill"></i></a></li>
                                    <li class="breadcrumb-item text-capitalize active" aria-current="page">${this._component || Constants.pjName}</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>`
    }

    async _renderGallery() {
        var html =
            `<section id="portfolio" class="portfolio section-bg p-1" data-aos="fade-up">
                ${this._renderGridControl()}
                <div class="row my-3">
                    <div id="details-items-area" data-aos="fade-up" data-aos-delay="100">
                    </div>
                    <div class="my-5 text-center">
                        <button id="show-more" class="btn btn-outline-primary border-0 rounded shadow">
                            More <i class="bi bi-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </section>`
        return html;
    }

    _renderGridControl() {
        var html = `<div class="grid-view-style">
                        <div class="row justify-content-center my-3">
                            <div class="col-auto fst-italic text-muted" id="filter-result-cal">
                                <div class="input-group">
                                    <span class="input-group-text border-0 text-muted">
                                        <span id="total-count-result">${this._totalCount}</span> <span class="px-1"><i class="bi bi-collection-fill"></i></span>
                                    </span>
                                    <input type="hidden" id="sortby" value="${this._sortBy}"/>
                                    <div class="btn-group">
                                        <button id="btn-choose-sort" type="button" class="btn btn-outline-secondary dropdown-toggle border-0 text-capitalize " data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">
                                            ${this._renderSort()}
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-lg-start">
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="id=asc" href="#">id <i class="bi bi-sort-down"></i></a></li>
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="id=desc"  href="#">id <i class="bi bi-sort-up"></i></a></li>
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="name=asc" href="#">name <i class="bi bi-sort-down"></i></a></li>
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="name=desc"  href="#">name <i class="bi bi-sort-up"></i></a></li>
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="createdAt=asc" href="#">created <i class="bi bi-sort-down"></i></a></li>
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="createdAt=desc"  href="#">created <i class="bi bi-sort-up"></i></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="col text-end">
                                <a class="btn btnFilter btn-outline-primary border-0 rounded shadow" data-bs-toggle="modal" data-bs-target="#filterModal" ><i class="bi bi-funnel-fill"></i></a>
                                <a class="btn btn-change-grid btn-outline-primary border-0 rounded shadow" data-type="1"><i class="bi bi-view-list"></i></a>
                                <a class="btn btn-change-grid btn-outline-primary border-0 rounded shadow" data-type="5"><i class="bi bi-grid-1x2-fill"></i></a>
                            </div>
                        </div>
                    </div>`;
        return html;
    }

    _renderSort() {
        var sort = this._sortBy.split('=')[1]
        var order = this._sortBy.split('=')[0]
        var sortByHtml = ''
        if (sort === 'asc')
            sortByHtml = `${order} <i class="bi bi-sort-down"></i>`
        else
            sortByHtml = `${order} <i class="bi bi-sort-up"></i>`

        $('#total-count-result').html(this._totalCount)
        $('#btn-choose-sort').html(sortByHtml)
        $('#sortby').val(this._sortBy)
        return sortByHtml;
    }

    async _renderDetails() {
        var filterAnd = [];
        var filterOr = [];
        var searchFilter = {}
        var componentId = getUrlParameter('com') || this._component;
        if (componentId) {
            filterAnd.push((x) => x.componentId.includes(componentId))
        }

        var filterName = $('#filter-name').val();
        if (filterName !== '')
            filterAnd.push((x) => x.name.includes(filterName))

        $('#category-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('active'))
                filterOr.push(x => x.categoryIds.includes(code))
        });

        if (filterOr.length > 0) {
            searchFilter = { and: [{ or: filterOr }, { and: filterAnd }] }
        } else {
            searchFilter = { and: filterAnd }
        }

        var searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
        var result = await readData(`${this.rootUrl}/assets/data/post/master.csv`, searchData);
        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        this._renderSort();

        var details = '';
        var data = result.data;
        data.forEach(item => {
            var category = '';
            item.categoryIds.split(',').forEach(cat => {
                var prefix = '';
                if (category !== '')
                    prefix = '<span>・</span>'

                category += ` ${prefix} ${cat.replace('_', ' ')}`
            });

            details +=
                `<div class="card my-2 border-0 shadow">
                    <a href="${item.thumbnail}" class="portfolio-lightbox" data-type="image">
                        <img src="${item.thumbnail}" class="img-fluid card-img-top" alt="" loading="lazy" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" />
                    </a>
                    <div class="card-body">
                        <h5 class="card-title text-capitalize">
                            ${item.name}
                        </h5>
                        <h6 class="card-subtitle mb-2 text-muted text-capitalize text-truncate" style="font-size: smaller;">
                            <span class="text-truncate ">
                            ${category}
                            </span>
                            <br />
                            <span class="text-truncate">
                                ${item.totalView} Views <span>・</span> ${item.createdAt.slice(0, 10)}
                            </span>
                        </h6>
                        <p class="card-text">
                            ${item.description.slice(0, 100)}
                        </p>
                        <a class="card-link text-capitalize" href="${this.rootUrl}/pages/${item.componentId}/post/?id=${item.id}">Read</a>
                    </div>
                </div>`
        })
        return `<div class="card-columns ${this._cardColumnsGap}">
                    ${details}
                </div>`;
    }

    async _renderFilter() {
        var filter = [];
        filter.push(x => x.componentIds.includes(this._component) || x.componentIds === "");
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(Constants.maxPageSize, this._pageIndex, searchFilter, this._sortBy);
        var tags = await readData(`${this.rootUrl}/assets/data/master/hash_tag/master.csv`, searchData);
        var tagHtml = '';
        tags.data.forEach(item => {
            tagHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
        })

        var searchData = new BaseCriteria(Constants.maxPageSize, this._pageIndex, {}, this._sortBy);
        var categories = await readData(`${this.rootUrl}/assets/data/master/category/master.csv`, searchData);
        var categoryHtml = '';
        categories.data.forEach(item => {
            if (item.parentId === '')
                categoryHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="category_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
        })

        var html = `<div class="modal fade" id="filterModal" tabindex="-1"  aria-hidden="true">
                        <div class="modal-dialog modal-fullscreen">
                            <div class="modal-content">
                                <div class="modal-body">
                                    <fieldset class="reset" id="category-filter-section">
                                        <legend class="fs-3 fw-bold text-muted"> Categories </legend>
                                        <div class="row my-2 filter-section">
                                            <div class="col-12">
                                                ${categoryHtml}
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset class="reset" id="other-filter-section">
                                        <legend class="fs-3 fw-bold text-muted"> Other </legend>
                                        <div class="row my-2 filter-section">
                                            <div class="col-auto">
                                                <div class="form-floating mb-3">
                                                    <input type="text" class="form-control" id="filter-name">
                                                    <label for="filter-name">Name</label>
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                                <div class="modal-footer border-0">
                                    <div class="col-12 text-end">
                                        <button type="button" class="btn btn-outline-secondary border-0 shadow" data-bs-dismiss="modal">Close <i class="bi bi-x-lg"></i></button>
                                        <button id="btnFilter" class="btn btn-outline-info border-0 shadow">Apply <i class="bi bi-check-circle-fill"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`
        return html;
    }

    _changeViewPageStyle(type) {
        if (type === '1') {
            $('.card-columns').removeClass(this._cardColumnsGap)
            $('.card-columns').addClass('card-columns-gap-1')
            return;
        }

        $('.card-columns').addClass(this._cardColumnsGap)
        $('.card-columns').removeClass('card-columns-gap-1')
        return;
    }

    async loadMore() {
        this._pageIndex++;
        var data = await this._renderDetails();
        $('#details-items-area').append(data);
        if (this._galleryGLightBox !== null) this._galleryGLightBox.reload();
        this._hiddenLoadMoreBtn();
        return true;
    }

    _hiddenLoadMoreBtn() {
        if ((this._pageIndex + 1) * this._pageSize >= this._totalCount) {
            $('#show-more').css("visibility", "hidden");
        } else {
            $('#show-more').css("visibility", "visible");
        }
    }

    async _filter() {
        this._pageIndex = 0;
        var data = await this._renderDetails();
        $('#details-items-area').html(data);
        if (this._galleryGLightBox !== null) this._galleryGLightBox.reload();
        this._hiddenLoadMoreBtn();

        var modal = $('#filterModal');
        if (modal && modal !== undefined) modal.modal('hide');
        return true;
    }

    _addFilter(e) {
        var selection = $(e).closest('div.input-group').find('select');
        var code = selection.val();
        var dataPrefix = selection.attr('data-prefix');
        var name = selection.find(":selected").text();
        if (code === '') return true;

        var btnHtml = `<button class="btn btn-outline-info border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="${dataPrefix}" data-code='${code}' type="button" onclick="this.remove()">${name} <i class="bi bi-x-lg"></i></button>`;
        var isExist = false;
        var container = $(e).closest('div.modal-dialog').find('div.filter-result-area');
        container.find('button').each((i, elm) => {
            var btnCode = $(elm).attr('data-code');
            if (btnCode === code) isExist = true;
        })

        selection.val('');
        if (isExist) return true;
        container.append(btnHtml);
    }
}