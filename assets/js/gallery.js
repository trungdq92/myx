class GalleryPage extends PageBase {
    constructor() {
        super();
        this._init();
    }

    async _init() {
        super._init();
        var content = await this._renderContent();
        $('#container-area').append(content);
    }

    async _renderContent() {
        var html = `<div class="container">
                        ${this._renderGridControl()}
                        ${await this._renderGallery()}
                    </div>`
        return html;
    }

    _renderGridControl() {
        var html = `<div class="chapter-grid-view-style">
                        <div class="row justify-content-center my-3">
                            <div class="col fst-italic text-muted"><span id="total-count-result">100</span> <span>imgs</span></div>
                            <div class="col text-end">
                                <a onclick="changeViewPageStyle(this)" class="btn btn-outline-primary border-0 rounded shadow" data-type="1"><i class="bi bi-view-list"></i></a>
                                <a onclick="changeViewPageStyle(this)" class="btn btn-outline-primary border-0 rounded shadow" data-type="5"><i class="bi bi-grid-1x2-fill"></i></a>
                            </div>
                        </div>
                    </div>`;
        return html;
    }

    async _renderGallery() {
        var filter = [];
        filter.push({
            Operation: 'eq',
            QueryType: 'text',
            QueryKey: "Component.Id",
            QueryValue: "gallery",
        })
        var searchData = {
            Filter: filter.length > 0 ? JSON.stringify({ and: filter }) : null,
            PageIndex: 0,
            // Sorts: orderBy + "=" + sortBy,
            // PageSize: 10
        }
        var result = await ajaxAsync('Post/filter', 'post', searchData);
        var cardColumns = CommonFunction._isMobile() ? "card-columns-gap-2" : "card-columns-gap-auto";
        var details = '';

        result.data.forEach(item => {
            var category = '';
            item.pCategories.forEach(cat => {
                if (category === '')
                    category += `${cat.category.name}`
                else
                    category += ` <span>・</span> ${cat.name}`
            });

            details += `<div class="card my-1 border-0 shadow">
                            <img src="${item.thumbnail}" class="img-fluid card-img-top" alt="" loading="lazy" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" />
                            <div class="card-body">
                                <h5 class="card-title text-capitalize">
                                    ${item.name}
                                </h5>
                                <p class="card-text">
                                    ${item.description.slice(0, 20)}
                                    <br />
                                    <span class="text-mute text-truncate text-capitalize" style="font-size: smaller;">
                                        ${category}
                                    </span>
                                    <br />
                                    <span class="text-mute text-truncate" style="font-size: smaller;">
                                        ${item.totalView} Views <span>・</span> ${item.createdAt.slice(0, 10)}
                                    </span>
                                   
                                </p>
                                <a class="btn btn-outline-primary border-0 rounded-circle shadow p-2 icon-next" href="${this.rootUrl}/pages/gallery/post/?id=${item.id}">
                                    <i class="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>`
        })

        var html = `<section id="portfolio" class="portfolio section-bg" data-aos="fade-up">
                        <div class="row my-3" id="items-container">
                            <div class="card-columns ${cardColumns}"  data-aos="fade-up" data-aos-delay="100">
                                ${details}
                            </div>
                            <div class="my-5 text-center">
                                <button id="show-more" class="btn btn-outline-primary border-0 rounded shadow" onclick="loadMore()">
                                    More <i class="bi bi-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </section>`
        return html;
    }

}

class GalleryPostPage extends PageBase {
    constructor() {
        super();
        this._galleryGLightBox = {}
        this._pageIndex = 0;
        this._totalCount = 0;
        this._totalPage = 0;
        this._pageSize = 20;
        this._init();
    }

    async _init() {
        super._init();
        var content = await this._renderContent();
        $('#container-area').append(content);
        this._galleryGLightBox = _initGLightbox('.portfolio-lightbox');
        $('#show-more').click(() => { this.loadMore() });
        $('.btn-change-grid').click((e) => {
            var type = $(e.currentTarget).attr('data-type');
            this._changeViewPageStyle(type)
        });
    }

    async _renderContent() {
        var html = `<div class="container">
                        <input id="pageIndex" type="hidden" value="${this._pageIndex}"/>
                        ${this._renderGridControl()}
                        ${await this._renderGallery()}
                    </div>`
        return html;
    }

    _renderGridControl() {
        var html = `<div class="grid-view-style">
                        <div class="row justify-content-center my-3">
                            <div class="col fst-italic text-muted"><span id="total-count-result">100</span> <span>imgs</span></div>
                            <div class="col text-end">
                                <a class="btn btn-change-grid btn-outline-primary border-0 rounded shadow" data-type="1"><i class="bi bi-view-list"></i></a>
                                <a class="btn btn-change-grid btn-outline-primary border-0 rounded shadow" data-type="5"><i class="bi bi-grid-1x2-fill"></i></a>
                            </div>
                        </div>
                    </div>`;
        return html;
    }

    async _renderGallery() {
        var details = await this._renderImgs();
        var html = `<section id="portfolio" class="portfolio section-bg" data-aos="fade-up">
                        <div class="row my-3" id="items-container">
                            <div class="card-columns card-columns-gap-auto"  data-aos="fade-up" data-aos-delay="100">
                                ${details}
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

    async loadMore() {
        this._pageIndex++;
        var data = await this._renderImgs();
        $('.card-columns').append(data);
        this._galleryGLightBox.reload();
        return true;
    }

    async _renderImgs() {
        var filter = [];
        filter.push({
            Operation: 'eq',
            QueryType: 'text',
            QueryKey: "postId",
            QueryValue: getUrlParameter('id'),
        })
        var searchData = {
            Filter: filter.length > 0 ? JSON.stringify({ and: filter }) : null,
            PageIndex: this._pageIndex,
            // Sorts: orderBy + "=" + sortBy,
            PageSize: this._pageSize
        }
        var result = await ajaxAsync('PGallery/filter', 'post', searchData);
        var details = '';

        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        $('#total-count-result').text(result.totalCount)
        if (this._pageSize * this._totalPage >= this._totalCount) {
            $('#show-more').css("visibility", "hidden");
        } else {
            $('#show-more').css("visibility", "visible");
        }
        result.data.forEach(item => {
            details += `<div class="card card-pin border-0 bg-transparent mb-1">
                            <div class="portfolio-wrap bg-transparent rounded-2 shadow-sm  d-flex justify-content-center">
                                <img src="${item.script}" class="img-fluid" alt="" loading="lazy" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" />
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
        })
        return details;
    }

    _changeViewPageStyle(type) {
        if (type === '1') {
            $('.card-columns').removeClass('card-columns-gap-auto')
            $('.card-columns').addClass('card-columns-gap-1')
            return;
        }

        $('.card-columns').addClass('card-columns-gap-auto')
        $('.card-columns').removeClass('card-columns-gap-1')
        return;
    }

}