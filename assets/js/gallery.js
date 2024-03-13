class GalleryPage extends PostPage {
    constructor() {
        super();
    }
}

class GalleryPostPage extends GalleryPage {
    constructor() {
        super();
        this._cardColumnsGap = 'card-columns-gap-auto';
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
                                    <li class="breadcrumb-item"><a href="/${Constants.pjName}" class="active"><i class="bi bi-house-fill"></i></a></li>
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
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="createdAt=asc" href="#">createdAt <i class="bi bi-sort-down"></i></a></li>
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="createdAt=desc" href="#">createdAt <i class="bi bi-sort-up"></i></a></li>
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

    async _renderDetails() {
        var filter = [];
        var searchFilter = null;

        var tagFilter = []
        $('#tag-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('btn-filter-active'))
                tagFilter.push(x => x.hashTags.includes(code))
        });

        if (tagFilter.length > 0) {
            filter = filter.concat(tagFilter)
        }

        searchFilter = { or: filter }
        var searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
        // var result = await ajaxAsync('PGallery/filter', 'post', searchData);
        var result = await readData(`${this.rootUrl}/assets/data/post/gallery/${this._postId}/master.csv`, searchData);
        var details = '';

        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        this._renderSort()

        result.data.forEach(item => {
            details += renderGalleryImgHtml({ id: item.id, script: item.script, rootUrl: this.rootUrl })
        })
        return `<div class="card-columns ${this._cardColumnsGap}">
                    ${details}
                </div>`;
    }

    async _renderFilter() {
        var filter = [];

        filter.push(x => x.componentIds.includes("gallery") || x.componentIds === "");
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(Constants.maxPageSize, 0, searchFilter, "name=asc");
        var tags = await readData(`${this.rootUrl}/assets/data/master/hash_tag/master.csv`, searchData);
        var hashTags = [];
        var searchDataPost = new BaseCriteria(Constants.maxPageSize, 0, {}, this._sortBy);
        var resultDataPost = await readData(`${this.rootUrl}/assets/data/post/gallery/${this._postId}/master.csv`, searchDataPost);
        this._maxData = resultDataPost.data;
        this._maxData.forEach(item => {
            if (!item.hashTags) return;
            item.hashTags.split(",").forEach(t => {
                if (!hashTags.includes(t)) {
                    hashTags.push(t)
                }
            })
        })
        var tagHtml = '';
        tags.data.forEach(item => {
            if (hashTags.includes(item.id))
                tagHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
        })

        var filterContents = [
            {
                id: "tag-filter-section",
                name: "Tags",
                html: tagHtml
            }
        ]

        var html = renderContainerFilterHtml(filterContents);
        return html;
    }

    _changeViewPageStyle(type) {
        this._cardColumnsGap = type === '1' ? 'card-columns-gap-1' : 'card-columns-gap-auto';
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