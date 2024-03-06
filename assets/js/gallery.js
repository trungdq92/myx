﻿class GalleryPage extends PostPage {
    constructor() {
        super();
    }
}

class GalleryPostPage extends GalleryPage {
    constructor() {
        super();
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
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="id=asc" href="#">id <i class="bi bi-sort-down"></i></a></li>
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="id=desc" href="#">id <i class="bi bi-sort-up"></i></a></li>
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
        // var result = await ajaxAsync('PGallery/filter', 'post', searchData);
        var result = await readData(`${this.rootUrl}/assets/data/post/gallery/${this._postId}/master.csv`, searchData);
        var details = '';

        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        this._renderSort()

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

        filter.push(x => x.componentIds.includes("gallery") || x.componentIds === "");
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(Constants.maxPageSize, 0, searchFilter, "name=asc");
        var tags = await readData(`${this.rootUrl}/assets/data/master/hash_tag/master.csv`, searchData);
        var hashTags = [];
        var searchDataPost = new BaseCriteria(Constants.maxPageSize, 0, {}, this._sortBy);
        var resultDataPost = await readData(`${this.rootUrl}/assets/data/post/gallery/${this._postId}/master.csv`, searchDataPost);
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
                tagHtml += `<button class="btn btn-outline-info border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('active')">${item.name}</button>`
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