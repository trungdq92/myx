﻿class VideoPage extends PostPage {
    constructor() {
        super();
    }
}

class VideoPostPage extends VideoPage {
    constructor() {
        super();
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
                                    <li class="breadcrumb-item"><a href="/${Constants.pjName}" class="active"><i class="bi bi-house-fill"></i></a></li>
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
        var filterAnd = [];
        var filterOr = [];
        var searchFilter = null;


        var filterName = $('#filter-name').val();
        if (filterName !== '')
            filterAnd.push((x) => x.name.includes(filterName))

        $('#tag-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('active'))
                filterOr.push(x => x.hashTags.includes(code))
        });

        $('#actor-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('active'))
                filterOr.push(x => x.actorId.includes(code))
        });

        $('#director-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('active'))
                filterOr.push(x => x.directorId.includes(code))
        });

        if (filterOr.length > 0) {
            searchFilter = { and: [{ or: filterOr }, { and: filterAnd }] }
        } else {
            searchFilter = { and: filterAnd }
        }

        var searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
        var result = await readData(`${this.rootUrl}/assets/data/post/video/${this._postId}/master.csv`, searchData);
        var details = '';

        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        this._renderSort()

        result.data.forEach((item, index) => {
            details += renderVideoHtml({
                id: item.id,
                name: item.name,
                postId: item.postId,
                thumbnail: item.thumbnail,
                totalDue: item.totalDue,
                totalView: item.totalView,
                createdAt: item.createdAt,
                rootUrl: this.rootUrl
            }, index, result.data.length)
        })
        return details;
    }

    async _renderFilter() {
        var filter = [];

        filter.push(x => x.componentIds.includes("video") || x.componentIds === "");
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(Constants.maxPageSize, this._pageIndex, searchFilter, this._sortBy);
        var tags = await readData(`${this.rootUrl}/assets/data/master/hash_tag/master.csv`, searchData);

        searchData = new BaseCriteria(Constants.maxPageSize, 0, {}, this._sortBy);
        var resultDataPost = await readData(`${this.rootUrl}/assets/data/post/video/${this._postId}/master.csv`, searchData);
        this._maxData = resultDataPost.data;

        var hashTags = [];
        var actors = [];
        var directors = [];
        this._maxData.forEach(item => {
            item.hashTags.split(",").forEach(t => {
                if (!hashTags.includes(t)) {
                    hashTags.push(t)
                }
            })
            item.actorId.split(",").forEach(t => {
                if (!actors.includes(t)) {
                    actors.push(t)
                }
            })

            if (!directors.includes(item.directorId)) {
                directors.push(item.directorId)
            }
        })
        var tagHtml = '';
        tags.data.forEach(item => {
            if (hashTags.includes(item.id))
                tagHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
        })

        searchData = new BaseCriteria(Constants.maxPageSize, 0, {}, "name=asc");
        var actorResult = await readData(`${this.rootUrl}/assets/data/master/actor/master.csv`, searchData);
        var actorHtml = '';
        actorResult.data.forEach(item => {
            if (actors.includes(item.id))
                actorHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
        })

        var directorResult = await readData(`${this.rootUrl}/assets/data/master/director/master.csv`, searchData);
        var directorHtml = '';
        directorResult.data.forEach(item => {
            if (directors.includes(item.id))
                directorHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
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
                                    <fieldset class="reset" id="actor-filter-section">
                                        <legend class="fs-3 fw-bold text-muted"> Actors </legend>
                                        <div class="row my-2 filter-section">
                                            <div class="row my-2 filter-section">
                                                <div class="col-12">
                                                    ${actorHtml}
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset class="reset" id="director-filter-section">
                                        <legend class="fs-3 fw-bold text-muted"> Directors </legend>
                                        <div class="row my-2 filter-section">
                                            <div class="row my-2 filter-section">
                                                <div class="col-12">
                                                    ${directorHtml}
                                                </div>
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
        this._postId = getUrlParameter('pid');
        this._id = getUrlParameter('id');
        this._init();
    }

    async _init() {
        super._init();
        $('#container-area').append(await this._renderContent());
    }

    async _renderContent() {
        var detail = await this._renderDetails();
        var html =
            `${this._renderTitlePage()}
            <div class="container-fluid">
                ${detail}
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
        return `<div class="title-page sticky-top">
                    <div class="container">
                        <div class="row">
                            <h5 class="h1 text-capitalize fw-bold">${this._component || Constants.pjName}</h5>
                        </div>
                        <div class="row text-mute" style="font-size:smaller">
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                    <li class="breadcrumb-item"><a href="/${Constants.pjName}" class="active"><i class="bi bi-house-fill"></i></a></li>
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
                                    <li class="breadcrumb-item text-capitalize active text-truncate" aria-current="page">
                                        ${this._detail.name}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>`
    }

    async _renderDetails() {
        var filter = [];
        filter.push(x => x.id == this._id);
        var searchFilter = { and: filter }
        var searchData = new BaseCriteria(Constants.maxPageSize, this._pageIndex, searchFilter, this._sortBy);
        var result = await readData(`${this.rootUrl}/assets/data/post/video/${this._postId}/master.csv`, searchData);
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
                    </div>
                    <div class="text-capitalize text-truncate py-2">
                        <span class="text-mute text-truncate" style="font-size: smaller;">
                            ${detail.totalView} Views <span>・</span> ${detail.createdAt.slice(0, 16).replace("T", " ")}</span>
                        <div class="fst-italic text-capitalize">
                            #${detail.hashTags.replace(",", " #")}
                        </div>
                    </div>
                    <div class="col-12 py-3">
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
        tagCodes.forEach(item => {
            filterOR.push(x => x.hashTags.includes(item));
        })

        filterAnd.push(x => x.id !== this._id);
        this._detail.categoryIds.split(',').forEach(item => {
            filterAnd.push(x => x.categoryIds.split(",").includes(item));
        })

        var searchFilter = { and: [{ or: filterOR }, { and: filterAnd }] }
        var searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
        var result = await readData(`${this.rootUrl}/assets/data/post/video/${this._postId}/master.csv`, searchData);
        var details = '';
        result.data.forEach(item => {
            details += renderVideoHtml({
                id: item.id,
                name: item.name,
                postId: item.postId,
                thumbnail: item.thumbnail,
                totalDue: item.totalDue,
                totalView: item.totalView,
                createdAt: item.createdAt,
                rootUrl: this.rootUrl
            })
        })
        return details;
    }
}
