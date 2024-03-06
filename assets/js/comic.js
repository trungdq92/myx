class ComicPage extends PostPage {
    constructor() {
        super();
    }
}

class ComicPostPage extends ComicPage {
    constructor() {
        super();
        this._cardColumnsGap = 'card-columns-gap-auto'
        this._maxData = []
        this._postId = getUrlParameter('id');
    }

    async _init() {
        await super._init();
        $('.btnAddFilter').click((e) => this._addFilter(e.target));
    }

    _renderTitlePage() {
        return `<div class="title-page sticky-top">
                    <div class="container">
                        <div class="row">
                            <h5 class="h1 text-capitalize fw-bold">${this._component}</h5>
                        </div>
                        <div class="row text-mute" style="font-size:smaller">
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                    <li class="breadcrumb-item"><a href="/myx" class="active"><i class="bi bi-house-fill"></i></a></li>
                                    <li class="breadcrumb-item text-capitalize" aria-current="page">
                                        <a class="text-capitalize text-decoration-none" href="${this.rootUrl}/pages/comic/">
                                            Comic
                                        </a>
                                    </li>
                                    <li class="breadcrumb-item text-capitalize active" aria-current="page">${getUrlParameter('id').replace('_', ' ')}</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>`
    }

    async _renderDetails() {
        var filter = [];
        var filterOr = [];
        var searchFilter = null;

        $('#tag-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('active'))
                filterOr.push(x => x.hashTags.includes(code))
        });

        if (filterOr.length > 0) {
            searchFilter = { and: [{ or: filterOr }, { and: filter }] }
        } else {
            searchFilter = { or: filterOr }
        }

        var searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
        var result = await readData(`${this.rootUrl}/assets/data/post/comic/${this._postId}/master.csv`, searchData);
        var details = '';

        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        this._renderSort()
        result.data.forEach(item => {
            details += `<div class="comic-book-card p-1">
                            <div class="card border-0 my-1 shadow">
                                <img src="${item.thumbnail}" class="img-fluid thumbs thumbs-cover h-auto rounded-0 rounded-top" alt="" loading="lazy" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" />
                                <div class="card-body">
                                    <h5 class="card-title text-truncate">${item.name}</h5>
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
                                    <a href="${this.rootUrl}/pages/comic/chapter/?id=${item.id}" class="card-link">Read</a>
                                </div>
                            </div>
                        </div>`
        })
        return details;
    }

    async _renderFilter() {
        var filter = [];

        filter.push(x => x.componentIds.includes("comic") || x.componentIds === "");
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(Constants.maxPageSize, this._pageIndex, searchFilter, this._sortBy);
        var tags = await readData(`${this.rootUrl}/assets/data/master/hashTag.csv`, searchData);
        var hashTags = [];
        var searchDataPost = new BaseCriteria(Constants.maxPageSize, 0, {}, this._sortBy);
        var resultDataPost = await readData(`${this.rootUrl}/assets/data/post/comic/${this._postId}/master.csv`, searchDataPost);
        this._maxData = resultDataPost.data;
        this._maxData.forEach(item => {
            item.hashTags.split(",").forEach(t => {
                if (!hashTags.includes(t)) {
                    hashTags.push(t)
                }
            })
        })
        var tagHtml = '';
        tags.data.forEach(item => {
            if (hashTags.includes(item.id))
                tagHtml += `<button class="btn btn-outline-info border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('active')">${item.name} <i class="bi bi-x-lg"></i></button>`
        })
        var html = `<div class="modal fade" id="filterModal" tabindex="-1"  aria-hidden="true">
                        <div class="modal-dialog modal-fullscreen">
                            <div class="modal-content">
                                <div class="modal-body">
                                    <fieldset class="reset" id="tag-filter-section">
                                        <legend class="fs-3 fw-bold text-muted"> Tags </legend>
                                        <div class="row my-2 filter-section">
                                            <div class="col-12">
                                                ${tagHtml}
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
}

class ComicChapterPage extends ComicPage {
    constructor() {
        super();
        this._pageSize = 5;
        this._detail = {}
    }

    async _init() {
        $('#container-area').append(this._renderMenu());
        $('#container-area').append(await this._renderContent());
        $('#show-more').click(() => { this.loadMore() });
        await this._filter();
    }

    async _renderContent() {
        var html =
            `<div class="container">
                ${await this._renderGallery()}
            </div>`
        return html;
    }

    async _renderGallery() {
        var filter = [];
        filter.push({
            Operation: 'eq',
            QueryType: 'text',
            QueryKey: "id",
            QueryValue: getUrlParameter('id'),
        });

        var searchData = {
            Filter: JSON.stringify({ and: filter }),
            PageIndex: this._pageIndex,
            PageSize: this._pageSize
        }
        var result = await ajaxAsync('PComic/filter', 'post', searchData);
        this._detail = result.data[0];
        var html =
            `${this._renderTitlePage()}
            <section id="portfolio" class="portfolio section-bg p-1" data-aos="fade-up">
                <div class="row my-3">
                    <div class="col-md-3">
                        <img src="${this._detail.thumbnail}" class="img-fluid thumbs thumbs-cover h-auto rounded-0 rounded-top" alt="" loading="lazy" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" />
                    </div>
                    <div class="col-md-9">
                       <img src="">
                        <div class="card border-0">
                            <div class="card-body">
                            <h5 class="card-title text-truncate">${this._detail.name}</h5>
                            <h6 class="card-subtitle mb-2 text-muted text-truncate" style="font-size: smaller;">
                                    ${this._detail.artistId.replace("_", " ")}
                                    <br />
                                    ${this._detail.createdAt.slice(0, 10)}
                                    <br />
                                    ${this._detail.totalView} Views <span>・</span> ${this._detail.totalChap} Chaps
                            </h6>
                            <div class="card-text">
                                ${this._detail.description}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section id="portfolio" class="portfolio section-bg p-1" data-aos="fade-up">
                ${this._renderGridControl()}
                <hr/>
                <div class="row my-3">
                    <div class="col-12">
                        <div class="row" id="details-items-area"></div>
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

    _renderTitlePage() {
        return `<div class="title-page sticky-top">
                    <div class="container_">
                        <div class="row">
                            <h5 class="h1 text-capitalize fw-bold">${this._component}</h5>
                        </div>
                        <div class="row text-mute" style="font-size:smaller">
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                    <li class="breadcrumb-item"><a href="/myx" class="active"><i class="bi bi-house-fill"></i></a></li>
                                    <li class="breadcrumb-item text-capitalize" aria-current="page">
                                        <a class="text-capitalize text-decoration-none" href="${this.rootUrl}/pages/comic/">
                                            Comic
                                        </a>
                                    </li>
                                    <li class="breadcrumb-item text-capitalize" aria-current="page">
                                        <a class="text-capitalize text-decoration-none" href="${this.rootUrl}/pages/comic/post/?id=${this._detail.postId}">
                                            ${this._detail.postId.replace('_', ' ')}
                                        </a>
                                    </li>
                                    <li class="breadcrumb-item text-capitalize active" aria-current="page">
                                        ${this._detail.name.length > 10 ? this._detail.name.slice(0, 10) + '...' : this._detail.name}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>`
    }

    _renderGridControl() {
        var html = `<div class="row justify-content-center my-3">
                        <div class="col">
                            <h3>Chapters</h3>
                        </div>
                        <div class="col fst-italic text-muted text-end">
                            <span id="total-count-result"></span>
                        </div>
                    </div>`;
        return html;
    }


    async _renderDetails() {
        var filter = [];
        filter.push({
            Operation: 'eq',
            QueryType: 'text',
            QueryKey: "id",
            QueryValue: getUrlParameter('id'),
        });

        var searchData = {
            Filter: JSON.stringify({ and: filter }),
            PageIndex: this._pageIndex,
            PageSize: this._pageSize
        }
        var result = await ajaxAsync('PComicChap/filter', 'post', searchData);
        var details = '';

        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        $('#total-count-result').html(`${result.totalCount} <i class="bi bi-file-zip-fill"></i>`)
        result.data.forEach(item => {
            details += `<div class="">
                            <div class="card border-0 shadow">
                                <div class="card-body p-0">
                                    <div class="row">
                                        <div class="col-auto">
                                            <img src="${item.thumbnail}" class="img-fluid" width="100" alt="" id="img-@item.Id" loading="lazy" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" />
                                        </div>
                                        <div class="col-auto my-auto">
                                            <h5 class="card-title text-truncate">${item.name}</h5>
                                            <h6 class="card-subtitle mb-3 text-muted text-truncate" style="font-size: smaller;">
                                                    ${item.createdAt.slice(0, 10)}
                                                    <br />
                                                    ${item.totalView} Views <span>・</span> ${item.totalPage} Pages
                                            </h6>
                                            <a href="${this.rootUrl}/pages/comic/viewer/?id=${item.id}" class="card-link">Read</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`
        })
        return details;
    }

}

class ComicViewerPage extends ComicPage {
    constructor() {
        super();
        this._pageIndex = 0
        this._pageSize = 10
    }

    async _init() {
        $('#container-area').append(this._renderMenu());
        $('#container-area').append(await this._renderContent());
        $('#show-more').click(() => { this.loadMore() });
        await this._filter();
    }

    async _renderContent() {
        var html =
            `<div class="container">
                ${await this._renderGallery()}
            </div>`
        return html;
    }

    async _renderGallery() {
        var filter = [];
        filter.push({
            Operation: 'eq',
            QueryType: 'text',
            QueryKey: "id",
            QueryValue: getUrlParameter('id'),
        });

        var searchData = {
            Filter: JSON.stringify({ and: filter }),
        }
        var result = await ajaxAsync('PComicChap/filter', 'post', searchData);
        this._detail = result.data[0];
        var html =
            `${this._renderTitlePage()}
            <section id="portfolio" class="portfolio section-bg py-3" data-aos="fade-up">
                <h4 class="text-center text-mute text-capitalize">${this._detail.name}</h4>
                <hr/>
                <div class="row my-3">
                    <div class="col-12">
                        <div class="row" id="details-items-area"></div>
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

    _renderTitlePage() {
        return `<div class="title-page sticky-top">
                    <div class="container_">
                        <div class="row">
                            <h5 class="h1 text-capitalize fw-bold">${this._detail.pComic.name}</h5>
                        </div>
                        <div class="row text-mute" style="font-size:smaller">
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                    <li class="breadcrumb-item"><a href="/myx" class="active"><i class="bi bi-house-fill"></i></a></li>
                                    <li class="breadcrumb-item text-capitalize" aria-current="page">
                                        <a class="text-capitalize text-decoration-none" href="${this.rootUrl}/pages/comic">Comic</a>
                                    </li>
                                    <li class="breadcrumb-item text-capitalize" aria-current="page">
                                        <a class="text-capitalize text-decoration-none" href="${this.rootUrl}/pages/comic/post/?id=${this._detail.pComic.postId}">
                                            ${this._detail.pComic.postId.replace('_', ' ')}
                                        </a>
                                    </li>
                                    <li class="breadcrumb-item text-capitalize" aria-current="page">
                                        <a class="text-capitalize text-decoration-none" href="${this.rootUrl}/pages/comic/chapter/?id=${this._detail.pComic.id}">
                                            ${this._detail.pComic.name.length > 10 ? this._detail.pComic.name.slice(0, 10) + "..." : this._detail.pComic.name}
                                        </a>
                                    </li>
                                    <li class="breadcrumb-item text-capitalize active" aria-current="page">${this._detail.name}</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>`
    }

    async _renderDetails() {
        var filter = [];
        filter.push({
            Operation: 'eq',
            QueryType: 'text',
            QueryKey: "PComicChapId",
            QueryValue: getUrlParameter('id'),
        });

        var searchData = {
            Filter: JSON.stringify({ and: filter }),
            PageIndex: this._pageIndex,
            PageSize: this._pageSize
        }
        var result = await ajaxAsync('PComicSource/filter-img', 'post', searchData);
        var details = '';

        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        $('#total-count-result').html(`${result.totalCount} <i class="bi bi-image-fill"></i>`)

        result.data.forEach(item => {
            details += `<img src="${item.path}" class="img-fluid my-1" alt="" loading="lazy" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" />`
        })
        return details;
    }
}