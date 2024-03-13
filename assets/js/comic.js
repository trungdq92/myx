class ComicPage extends PostPage {
    constructor() {
        super();
    }
}

class ComicPostPage extends ComicPage {
    constructor() {
        super();
        this._cardColumnsGap = 'col-md-auto col-6'
        this._maxData = []
        this._postId = getUrlParameter('id');
    }

    async _init() {
        await super._init();
        $('.btnAddFilter').click((e) => this._addFilter(e.target));
    }

    async _renderGallery() {
        var html =
            `<section id="portfolio" class="portfolio section-bg p-1" data-aos="fade-up">
                ${this._renderGridControl()}
                <div class="my-3">
                    <div id="details-items-area" class="row"  data-aos="fade-up" data-aos-delay="100">
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
                    <div class="container">
                        <div class="row">
                            <h5 class="h1 text-capitalize fw-bold">${this._component}</h5>
                        </div>
                        <div class="row text-mute" style="font-size:smaller">
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                    <li class="breadcrumb-item"><a href="/${Constants.pjName}" class="active"><i class="bi bi-house-fill"></i></a></li>
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
        var searchFilter = null;

        var filterName = $('#filter-name').val();
        if (filterName !== '')
            filter.push((x) => x.name.includes(filterName))

        var tagFilter = []
        $('#tag-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('btn-filter-active'))
                tagFilter.push(x => x.hashTags.includes(code))
        });

        var artistFilter = []
        $('#artist-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('btn-filter-active'))
                artistFilter.push(x => x.artistId.includes(code))
        });


        if (tagFilter.length > 0) {
            filter = filter.concat({ or: tagFilter });
        }
        if (artistFilter.length > 0) {
            filter = filter.concat({ or: artistFilter });
        }

        searchFilter = { and: filter }
        var searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
        var result = await readData(`${this.rootUrl}/assets/data/post/comic/${this._postId}/master.csv`, searchData);
        var details = '';

        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        this._renderSort()
        result.data.forEach(item => {
            details += renderComicBookHtml({
                id: item.id,
                name: item.name,
                postId: item.postId,
                thumbnail: item.thumbnail,
                artistId: item.artistId,
                totalChap: item.totalChap,
                totalView: item.totalView,
                description: item.description,
                createdAt: item.createdAt,
                rootUrl: this.rootUrl,
                cardColumnsGap: this._cardColumnsGap
            })
        })
        return details;
    }

    async _renderFilter() {
        var filter = [];
        filter.push(x => x.componentIds.includes("comic") || x.componentIds === "");
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(Constants.maxPageSize, 0, searchFilter, "name=asc");
        var tags = await readData(`${this.rootUrl}/assets/data/master/hash_tag/master.csv`, searchData);

        searchData = new BaseCriteria(Constants.maxPageSize, 0, {}, this._sortBy);
        var resultDataPost = await readData(`${this.rootUrl}/assets/data/post/comic/${this._postId}/master.csv`, searchData);
        this._maxData = resultDataPost.data;

        var hashTags = [];
        var artists = [];
        this._maxData.forEach(item => {
            item.hashTags.split(",").forEach(t => {
                if (!hashTags.includes(t)) {
                    hashTags.push(t)
                }
            })
            item.artistId.split(",").forEach(t => {
                if (!artists.includes(t)) {
                    artists.push(t)
                }
            })
        })
        var tagHtml = '';
        tags.data.forEach(item => {
            if (hashTags.includes(item.id))
                tagHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
        })

        searchData = new BaseCriteria(Constants.maxPageSize, 0, {}, "name=asc");
        var artistResult = await readData(`${this.rootUrl}/assets/data/master/artist/master.csv`, searchData);
        var artistHtml = '';
        artistResult.data.forEach(item => {
            if (artists.includes(item.id))
                artistHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
        })

        var filterContents = [
            {
                id: "tag-filter-section",
                name: "Tags",
                html: tagHtml
            },
            {
                id: "artist-filter-section",
                name: "Artists",
                html: artistHtml
            },
            {
                id: "other-filter-section",
                name: "Other",
                html: `<div class="form-floating mb-3">
                            <input type="text" class="form-control" id="filter-name">
                            <label for="filter-name">Name</label>
                        </div>`
            }
        ]

        var html = renderContainerFilterHtml(filterContents);
        return html;
    }

    _changeViewPageStyle(viewType) {
        this._cardColumnsGap = viewType === '1' ? 'col-12' : `col-md-auto col-6`
        $('.comic-book-card').each((i, elm) => {
            $(elm).removeClass('col-12 col-md-auto col-6');
            $(elm).addClass(viewType === '1' ? 'col-12' : `col-md-auto col-6`);
        });
        return;
    }
}

class ComicChapterPage extends ComicPage {
    constructor() {
        super();
        this._maxData = []
        this._id = getUrlParameter('id');
        this._postId = getUrlParameter('pid');
        this._detail = {}
    }

    async _init() {

        this._id = getUrlParameter('id');
        this._postId = getUrlParameter('pid');
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
        filter.push(x => x.id == this._id);
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(Constants.maxPageSize, this._pageIndex, searchFilter, this._sortBy);
        var result = await readData(`${this.rootUrl}/assets/data/post/comic/${this._postId}/master.csv`, searchData);
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
                                    <li class="breadcrumb-item"><a href="/${Constants.pjName}" class="active"><i class="bi bi-house-fill"></i></a></li>
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
        filter.push(x => x.id == this._id);
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
        var result = await readData(`${this.rootUrl}/assets/data/post/comic/${this._postId}/chapter.csv`, searchData);
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
                                            <a href="${this.rootUrl}/pages/comic/viewer/?id=${item.id}&pid=${this._postId}&cid=${item.pComicId}" class="card-link">Read</a>
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
        this._id = getUrlParameter('id');
        this._postId = getUrlParameter('pid');
        this._pComicId = getUrlParameter('cid');
        this._detail = {}
        this._comic = {}
    }

    async _init() {
        this._id = getUrlParameter('id');
        this._postId = getUrlParameter('pid');
        this._pComicId = getUrlParameter('cid');
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
        filter.push(x => x.id == this._id && x.pComicId == this._pComicId);
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
        var result = await readData(`${this.rootUrl}/assets/data/post/comic/${this._postId}/chapter.csv`, searchData);
        this._detail = result.data[0];
        var html =
            `${await this._renderTitlePage()}
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

    async _renderTitlePage() {
        var filter = [];
        filter.push(x => x.id == this._pComicId);
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
        var result = await readData(`${this.rootUrl}/assets/data/post/comic/${this._postId}/master.csv`, searchData);
        this._comic = result.data[0];
        return `<div class="title-page sticky-top">
                    <div class="container_">
                        <div class="row">
                            <h5 class="h1 text-capitalize fw-bold">${this._comic.name}</h5>
                        </div>
                        <div class="row text-mute" style="font-size:smaller">
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                    <li class="breadcrumb-item"><a href="/${Constants.pjName}" class="active"><i class="bi bi-house-fill"></i></a></li>
                                    <li class="breadcrumb-item text-capitalize" aria-current="page">
                                        <a class="text-capitalize text-decoration-none" href="${this.rootUrl}/pages/comic">Comic</a>
                                    </li>
                                    <li class="breadcrumb-item text-capitalize" aria-current="page">
                                        <a class="text-capitalize text-decoration-none" href="${this.rootUrl}/pages/comic/post/?id=${this._postId}">
                                            ${this._postId.replace('_', ' ')}
                                        </a>
                                    </li>
                                    <li class="breadcrumb-item text-capitalize" aria-current="page">
                                        <a class="text-capitalize text-decoration-none text-truncate" href="${this.rootUrl}/pages/comic/chapter/?id=${this._comic.id}&pid=${this._postId}">
                                            ${this._comic.name}
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
        filter.push(x => x.pComicChapId == this._id);
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(Constants.maxPageSize, 0, searchFilter, this._sortBy);
        var result = await readData(`${this.rootUrl}/assets/data/post/comic/${this._postId}/source.csv`, searchData);
        var imgs = []
        result.data.forEach(item => {
            for (var i = parseInt(item.start); i <= parseInt(item.end); i++) {
                imgs.push(`${item.prefix}${i}.${item.suffix}`)
            }
        })

        var countImgs = imgs.length;
        imgs = imgs.slice(this._pageIndex * this._pageSize, this._pageSize * (this._pageIndex + 1))
        var imgResult = new BaseSearchResponse(countImgs, this._pageSize, this._pageIndex, imgs);
        this._totalPage = imgResult.totalPage;
        this._totalCount = imgResult.totalCount;
        $('#total-count-result').html(`${result.totalCount} <i class="bi bi-image-fill"></i>`)

        var details = '';
        imgs.forEach(item => {
            details += `<img src="${item}" class="img-fluid my-1" alt="" loading="lazy" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" />`
        })
        return details;
    }
}