class VideoPage extends PostPage {
    constructor() {
        super();
    }
}

class VideoPostPage extends VideoPage {
    constructor() {
        super();
    }

    async _init() {
        await super._init();
        $('.btnAddFilter').click((e) => this._addFilter(e.target));
    }

    async _renderGallery() {
        var html =
            `<section id="portfolio" class="portfolio section-bg p-1" data-aos="fade-up">
                ${this._renderGridControl()}
                <div class="row my-3">
                    <div class="col-12" data-aos="fade-up" data-aos-delay="100">
                        <div id="details-items-area"  class="row"></div>
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
                                    <li class="breadcrumb-item"><a href="/myx" class="active"><i class="bi bi-house-fill"></i></a></li>
                                    <li class="breadcrumb-item text-capitalize" aria-current="page">
                                        <a class="text-capitalize text-decoration-none" href="${this.rootUrl}/pages/video/">
                                            Video
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
        filter.push({
            Operation: 'eq',
            QueryType: 'text',
            QueryKey: "postId",
            QueryValue: getUrlParameter('id'),
        });

        var tagCodes = [];
        $('#tags-filter-area').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            tagCodes.push(code);
        });

        var queryKeyTags = '';
        tagCodes.forEach(item => {
            if (queryKeyTags === '')
                queryKeyTags += `HashTags.Contains("${item}")`

            queryKeyTags += `|| HashTags.Contains("${item}")`
        })
        if (queryKeyTags !== '')
            filterOr.push({
                Operation: 'eq',
                QueryType: 'boolean',
                QueryKey: `(${queryKeyTags})`,
                QueryValue: true,
            })

        if (filterOr.length > 0) {
            searchFilter = { and: [{ or: filterOr }, { and: filter }] }
        } else {
            searchFilter = { and: filter }
        }

        var sortBy = $("#sortby");
        if (sortBy) this._sortBy = sortBy.val();

        var searchData = {
            Filter: JSON.stringify(searchFilter),
            PageIndex: this._pageIndex,
            Sorts: this._sortBy,
            PageSize: this._pageSize
        }
        var result = await ajaxAsync('PVideo/filter', 'post', searchData);
        var details = '';

        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        $('#total-count-result').html(`${result.totalCount} <i class="bi bi-camera-video-fill"></i>`)
        var sort = this._sortBy.split('=')[1]
        var order = this._sortBy.split('=')[0]

        if (sort === 'asc')
            $('#sort-by-result').html(`${order} <i class="bi bi-sort-up-alt"></i> `)
        else
            $('#sort-by-result').html(`${order} <i class="bi bi-sort-up"></i>`)

        result.data.forEach(item => {
            details +=
                `<div class="col-md-4 col-6 my-3 video-item">
                    <div class="card border-0">
                        <div class="video-wrapper position-relative">
                            <a href="${this.rootUrl}/pages/video/viewer/?id=${item.id}">
                                <img src="${item.thumbnail}" class="img-fluid thumbs thumbs-cover rounded-3" alt="" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" loading="lazy" />
                            </a>
                        </div>
                        <div class="card-body px-0">
                            <div class="data-block-indicators">
                                <i class="bi bi-play-fill"></i> ${item.totalDue} min
                            </div>
                            <h5 class="card-title text-capitalize text-truncate">
                                <a class="color-unset" href="${this.rootUrl}/pages/video/viewer/?id=${item.id}">${item.name}</a>
                            </h5>
                            <h6 class="card-subtitle mb-2 text-muted text-truncate" style="font-size:smaller">
                                ${item.totalView} Views <span>・</span>  ${item.createdAt.slice(0, 16).replace('T', ' ')}
                            </h6>
                        </div>
                    </div>
                </div>`
        })
        return details;
    }

    async _renderFilter() {
        var filter = [];
        filter.push({
            Operation: 'eq',
            QueryType: 'boolean',
            QueryKey: `(ComponentIds.Contains("video") || ComponentIds == "" )`,
            QueryValue: true,
        })
        var searchData = {
            Filter: filter.length > 0 ? JSON.stringify({ and: filter }) : null,
        }
        var tags = await ajaxAsync('HashTag/filter', 'post', searchData);
        var tagHtml = '';
        tags.data.forEach(item => {
            tagHtml += `<option value="${item.id}">${item.name}</option>`
        })

        var html = `<div class="modal fade" id="filterModal" tabindex="-1"  aria-hidden="true">
                        <div class="modal-dialog mt-5">
                            <div class="modal-content">
                                <div class="modal-header">
                                <h5 class="modal-title">Filter</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="row my-2">
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-filter"></i></span>
                                            <select type="text" id="sortby" class="form-select text-capitalize">
                                                <option value="id=asc">id asc</option>
                                                <option value="id=desc">id dec</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="row my-2 filter-section">
                                        <div class="col-12">
                                            <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-hash"></i></span>
                                                <select type="text" class="form-select text-capitalize">
                                                    <option value="">___</option>
                                                    ${tagHtml}
                                                </select>
                                                <button class="btn btn-outline-info btnAddFilter" type="button">
                                                    <i class="bi bi-plus-lg"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-12 my-2 filter-result-area" id="tags-filter-area">
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer border-0">
                                    <div class="col-12 text-end">
                                        <button id="btnFilter" class="btn btn-outline-info border-0 shadow">Apply <i class="bi bi-check-circle-fill"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`
        return html;
    }

    _changeViewPageStyle(viewType) {
        $('.video-item').each((i, elm) => {
            $(elm).removeClass('col-12 col-md-4 col-6');
            $(elm).addClass(viewType === '1' ? 'col-12' : `col-md-4 col-6`);
        });
        return;
    }
}

class VideoViewerPage extends PageBase {
    constructor() {
        super();
        this._init();
    }

    async _init() {
        super._init();
        $('#container-area').append(await this._renderContent());
    }

    async _renderContent() {
        var html =
            `<div class="container-fluid">
                ${await this._renderDetails()}
            </div>
            <div class="container py-3">
                <div class="card">
                    <div class="card-body">
                        <h2 class="card-title">Relation</h2>
                        <div class="row">
                            ${await this._renderRelation()}
                        </div>
                    </div>
                </div>
            </div>`
        return html;
    }

    _renderTitlePage() {
        return `<div class="title-page_ sticky-top">
                    <div class="container_">
                        <div class="row text-mute" style="font-size:smaller">
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                    <li class="breadcrumb-item"><a href="/myx" class="active"><i class="bi bi-house-fill"></i></a></li>
                                    <li class="breadcrumb-item text-capitalize" aria-current="page">
                                        <a class="text-capitalize text-decoration-none" href="${this.rootUrl}/pages/video/">
                                            Video
                                        </a>
                                    </li>
                                    <li class="breadcrumb-item text-capitalize" aria-current="page">
                                        <a class="text-capitalize text-decoration-none" href="${this.rootUrl}/pages/video/post/?id=${this._detail.postId}">
                                            ${this._detail.postId.replace("_", " ")}
                                        </a>
                                    </li>
                                    <li class="breadcrumb-item text-capitalize active" aria-current="page">
                                        ${this._detail.name.length > 10 ? this._detail.name.slice(0, 10) + "..." : this._detail.name}
                                    </li>
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
            QueryKey: "id",
            QueryValue: getUrlParameter('id'),
        });
        var searchData = {
            Filter: JSON.stringify({ and: filter })
        }

        var result = await await ajaxAsync('PVideo/filter', 'post', searchData);
        var detail = result.data[0];
        this._detail = detail;
        var videoHtml = ''

        if (detail.embedTypeId === 'video') {
            videoHtml = `<video name='media' poster="${this.rootUrl}/assets/img/default-image.png">
                            <source src='${detail.script}' type='video/mp4'>
                        </video>`;
        } else {
            videoHtml = `<iframe frameborder="0" src="${detail.script}" allow="fullscreen" class="rounded-0" id="frame_emb_video"></iframe>`;
        }
        var html =
            `<div class="row" id="video-player-area">
                <div class="col-12">
                    <div class="row portfolio-container">
                        <div class="col-12 player-content px-0">
                            <div class="video-wrapper">
                                ${videoHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container">
                <div class="row">
                    <div class="col-12 my-2">
                        <h2 class="text-capitalize fw-bold">
                            ${detail.name}
                        </h2>
                        ${this._renderTitlePage()}
                    </div>
                    <div class="text-capitalize text-truncate py-2">
                        <span class="text-mute text-truncate" style="font-size: smaller;">
                            ${detail.totalView} Views <span>・</span> ${detail.createdAt.slice(0, 16).replace("T", " ")}</span>
                        <div class="fst-italic text-capitalize">
                            #${detail.hashTags.replace(",", " #")}
                        </div>
                    </div>
                    <div class="col-12 py-5">
                        ${detail.description}
                    </div>
                </div>
            </div>`;
        return html;
    }

    async _renderRelation() {
        var filterOR = [];
        var filterAnd = [];

        var tagCodes = this._detail.hashTags.split(',');
        var queryKeyTags = '';
        tagCodes.forEach(item => {
            if (queryKeyTags === '')
                queryKeyTags += `HashTags.Contains("${item}")`

            queryKeyTags += `|| HashTags.Contains("${item}")`
        })

        filterOR.push({
            Operation: 'eq',
            QueryType: 'boolean',
            QueryKey: `(${queryKeyTags})`,
            QueryValue: true,
        })

        filterAnd.push({
            Operation: 'neq',
            QueryType: 'text',
            QueryKey: `id`,
            QueryValue: getUrlParameter('id'),
        })

        this._detail.post.pCategories.forEach(item => {
            filterAnd.push({
                Operation: 'eq',
                QueryType: 'boolean',
                QueryKey: `( Post.PCategories.Any(x=>x.CategoryId == "${item.categoryId}"))`,
                QueryValue: true,
            })
        })

        filterAnd.push({
            Operation: 'neq',
            QueryType: 'text',
            QueryKey: `id`,
            QueryValue: getUrlParameter('id'),
        })

        var searchData = {
            Filter: JSON.stringify({ and: [{ or: filterOR }, { and: filterAnd }] }),
            Sorts: "id=desc",
            PageSize: 20
        }

        var result = await ajaxAsync('PVideo/filter', 'post', searchData);
        var details = '';
        result.data.forEach(item => {
            details +=
                `<div class="col-md-4 col-6 my-3 video-item">
                    <div class="card border-0">
                        <div class="video-wrapper position-relative">
                            <a href="${this.rootUrl}/pages/video/viewer/?id=${item.id}">
                                <img src="${item.thumbnail}" class="img-fluid thumbs thumbs-cover rounded-3" alt="" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" loading="lazy" />
                            </a>
                        </div>
                        <div class="card-body px-0">
                            <div class="data-block-indicators">
                                <i class="bi bi-play-fill"></i> ${item.totalDue} min
                            </div>
                            <h5 class="card-title text-capitalize text-truncate">
                                <a class="color-unset" href="${this.rootUrl}/pages/video/viewer/?id=${item.id}">${item.name}</a>
                            </h5>
                            <h6 class="card-subtitle mb-2 text-muted text-truncate" style="font-size:smaller">
                                ${item.totalView} Views <span>・</span>  ${item.createdAt.slice(0, 16).replace('T', ' ')}
                            </h6>
                        </div>
                    </div>
                </div>`
        })
        return details;
    }
}
