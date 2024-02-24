class GalleryPage extends PostPage {
    constructor() {
        super();
    }
}

class GalleryPostPage extends GalleryPage {
    constructor() {
        super();
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
                                        <a class="text-capitalize text-decoration-none" href="${this.rootUrl}/pages/gallery/">
                                            Gallery
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
            else
                queryKeyTags += ` || HashTags.Contains("${item}")`
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
        var result = await ajaxAsync('PGallery/filter', 'post', searchData);
        var details = '';

        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        $('#total-count-result').html(`${result.totalCount} <i class="bi bi-image-fill"></i>`)
        var sort = this._sortBy.split('=')[1]
        var order = this._sortBy.split('=')[0]

        if (sort === 'asc')
            $('#sort-by-result').html(`${order} <i class="bi bi-sort-up-alt"></i> `)
        else
            $('#sort-by-result').html(`${order} <i class="bi bi-sort-up"></i>`)

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

    async _renderFilter() {
        var filter = [];
        filter.push({
            Operation: 'eq',
            QueryType: 'boolean',
            QueryKey: `(ComponentIds.Contains("gallery")  || ComponentIds == "" )`,
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
}