var coorA;
var coorB;
var btn = null;
var lastMouseX;
var lastMouseY;
var timerHold = false;
var timer = 0;

function mousedown(event) {
    if (event.target.className.indexOf("btn-moveable") > -1) {
        btn = event.target;
    }

    if (btn == null) return;
    btn = event.target;
    if (btn.style.top === "" || btn.style.left === "") {
        btn.style.position = "absolute";
        btn.style.top = btn.offsetTop + "px";
        btn.style.left = btn.offsetLeft + "px";
    }
    coorA = btn.offsetTop;
    coorB = btn.offsetLeft;
    setTimeout(() => {
        timer = setInterval(() => {
            timerHold = true;
        }, 20)
    }, 100)

}

function mouseup(event) {
    clearInterval(timer);
    setTimeout(() => {
        timerHold = false;
    }, 100)
    if (btn) btn.style.position = "fixed";
    btn = null;
}

function openOffcanvasMenu() {
    var offcanvasMenu = $('#offcanvasMenu');
    if (!offcanvasMenu) return;
    if (!timerHold) {
        offcanvasMenu.offcanvas('show')
    }
}

function mousemove(event) {
    var myLocation = event;
    var clientX = myLocation.clientX;
    var clientY = myLocation.clientY;
    var diff = 50;

    clientX = clientX < 0 ? 0 : clientX;
    clientY = clientY < 0 ? 0 : clientY;

    // clientY = clientY > window.outerHeight - diff ? window.outerHeight - diff : clientY;
    // clientX = clientX > window.outerWidth - diff ? window.outerWidth - diff : clientX;

    if (btn !== null) {
        var top = parseInt(btn.style.top) + (clientY - lastMouseY);
        var left = parseInt(btn.style.left) + (clientX - lastMouseX);

        top = top < 0 ? 0 : top;
        left = left < 0 ? 0 : left;

        // top = top > window.outerHeight - diff ? window.outerHeight - diff : top;
        // left = left > window.outerWidth - diff ? window.outerWidth - diff : left;

        btn.style.top = top + "px";
        btn.style.left = left + "px";
    }
    lastMouseX = clientX;
    lastMouseY = clientY;
}

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

document.getElementsByTagName("body")[0].addEventListener("mousedown", event => mousedown(event));
document.getElementsByTagName("body")[0].addEventListener("mousemove", event => mousemove(event));
document.getElementsByTagName("body")[0].addEventListener("mouseup", event => mouseup(event));

document.getElementsByTagName("body")[0].addEventListener("touchstart", event => mousedown(event));
document.getElementsByTagName("body")[0].addEventListener("touchmove", event => mousemove(event.changedTouches[0]));
document.getElementsByTagName("body")[0].addEventListener("touchend", event => mouseup(event));

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
        var html = `<button class="btn btn-primary btn-menu btn__moveable border-0 shadow rounded-circle m-2" type="button" onclick='openOffcanvasMenu()'>
                        <i class="bi bi-list"></i>
                    </button>
                    <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasMenu">
                        <div class="offcanvas-header">
                            <h5 class="offcanvas-title">MyX</h5>
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
                                    <li class="breadcrumb-item"><a href="/myx" class="active"><i class="bi bi-house-fill"></i></a></li>
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
                    <div id="details-items-area" class="card-columns ${this._cardColumnsGap}"  data-aos="fade-up" data-aos-delay="100">
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
                                        <ul class="dropdown-menu dropdown-menu-lg-end">
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
        return details;
    }

    async _renderFilter() {
        var filter = [];
        filter.push(x => x.componentIds.includes(this._component) || x.componentIds === "");
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(Constants.maxPageSize, this._pageIndex, searchFilter, this._sortBy);
        var tags = await readData(`${this.rootUrl}/assets/data/master/hash_tag/master.csv`, searchData);
        var tagHtml = '';
        tags.data.forEach(item => {
            tagHtml += `<button class="btn btn-outline-info border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('active')">${item.name}</button>`
        })

        var searchData = new BaseCriteria(Constants.maxPageSize, this._pageIndex, {}, this._sortBy);
        var categories = await readData(`${this.rootUrl}/assets/data/master/category/master.csv`, searchData);
        var categoryHtml = '';
        categories.data.forEach(item => {
            if (item.parentId === '')
                categoryHtml += `<button class="btn btn-outline-info border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="category_" data-code='${item.id}' type="button" onclick="this.classList.toggle('active')">${item.name}</button>`
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