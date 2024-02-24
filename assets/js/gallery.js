class GalleryPage extends PageBase {
    constructor() {
        super();
        this._galleryGLightBox = {}
        this._pageIndex = 0;
        this._totalCount = 0;
        this._totalPage = 0;
        this._pageSize = 50;
        this._sortBy = 'id=desc';
        this._init();
    }

    async _init() {
        $('#container-area').append(this._renderMenu());
        $('#container-area').append(await this._renderContent());

        this._galleryGLightBox = _initGLightbox('.portfolio-lightbox');
        $('#show-more').click(() => { this.loadMore() });
        $('.btn-change-grid').click((e) => {
            var type = $(e.currentTarget).attr('data-type');
            this._changeViewPageStyle(type)
        });
        $('#btnFilter').click((e) => this._filter());
        await this._filter();
    }

    async _renderContent() {
        var html =
            `<div class="container">
                ${await this._renderFilter()}
                ${await this._renderGallery()}
            </div>`
        return html;
    }

    _renderGridControl() {
        var html = `<div class="grid-view-style">
                        <div class="row justify-content-center my-3">
                            <div class="col fst-italic text-muted">
                                <span id="total-count-result"></span>
                                <span>・</span>
                                <span id="sort-by-result" class="text-capitalize"></span>
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

    async _renderGallery() {
        var html =
            `<section id="portfolio" class="portfolio section-bg py-1" data-aos="fade-up">
                ${this._renderGridControl()}
                <div class="row my-3" id="items-container">
                    <div class="card-columns card-columns-gap-3"  data-aos="fade-up" data-aos-delay="100">
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

    async _renderDetails() {
        var filter = [];
        filter.push({
            Operation: 'eq',
            QueryType: 'text',
            QueryKey: "Component.Id",
            QueryValue: "gallery",
        })

        var sortBy = $("#sortby");
        if (sortBy) this._sortBy = sortBy.val();

        var searchData = {
            Filter: JSON.stringify({ and: filter }),
            PageIndex: this._pageIndex,
            Sorts: this._sortBy,
            PageSize: this._pageSize

        }

        var result = await ajaxAsync('Post/filter', 'post', searchData);

        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        $('#total-count-result').html(`${result.totalCount} <i class="bi bi-credit-card-2-front-fill"></i>`)
        var sort = this._sortBy.split('=')[1]
        var order = this._sortBy.split('=')[0]

        if (sort === 'asc')
            $('#sort-by-result').html(`${order} <i class="bi bi-sort-up-alt"></i> `)
        else
            $('#sort-by-result').html(`${order} <i class="bi bi-sort-up"></i>`)

        var details = '';
        result.data.forEach(item => {
            var category = '';
            item.pCategories.forEach(cat => {
                if (category === '')
                    category += `${cat.category.name}`
                else
                    category += ` <span>・</span> ${cat.name}`
            });

            details +=
                `<div class="card my-1 border-0 shadow">
                    <a href="${item.thumbnail}" class="portfolio-lightbox" data-type="image">
                        <img src="${item.thumbnail}" class="img-fluid card-img-top" alt="" loading="lazy" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" />
                    </a>
                    <div class="card-body">
                        <h5 class="card-title text-capitalize">
                            ${item.name}
                        </h5>
                        <p class="card-text">
                            ${item.description.slice(0, 100)}
                            <br />
                            <span class="text-mute text-truncate text-capitalize" style="font-size: smaller;">
                                ${category}
                            </span>
                            <br />
                            <span class="text-mute text-truncate" style="font-size: smaller;">
                                ${item.totalView} Views <span>・</span> ${item.createdAt.slice(0, 10)}
                            </span>
                            
                        </p>
                        <a class="btn btn-primary border-0 rounded-circle shadow p-2 icon-next" href="${this.rootUrl}/pages/gallery/post/?id=${item.id}">
                            <i class="bi bi-arrow-right"></i>
                        </a>
                    </div>
                </div>`
        })
        return details;
    }

    async _renderFilter() {
        var html =
            `<div class="modal fade" id="filterModal" tabindex="-1"  aria-hidden="true">
                <div class="modal-dialog mt-5">
                    <div class="modal-content">
                        <div class="modal-header">
                        <h5 class="modal-title">Filter</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row my-2">
                                <div class="col-12">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="bi bi-filter"></i></span>
                                        <select type="text" id="sortby" class="form-select text-capitalize">
                                            <option value="id=asc">id asc</option>
                                            <option value="id=desc">id dec</option>
                                        </select>
                                    </div>
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

    async loadMore() {
        this._pageIndex++;
        var data = await this._renderDetails();
        $('.card-columns').append(data);
        this._galleryGLightBox.reload();
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
        if($('#filterModal')) $('#filterModal').modal('hide');
        this._pageIndex = 0;
        var data = await this._renderDetails();
        $('.card-columns').html(data);
        this._galleryGLightBox.reload();
        this._hiddenLoadMoreBtn();
        return true;
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
            QueryKey: `(ComponentIds.Contains("gallery"))`,
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

    _addFilter(e) {
        var selection = $(e).closest('div.input-group').find('select');
        var code = selection.val();
        var name = selection.find(":selected").text();
        if (code === '') return true;

        var btnHtml = `<button class="btn btn-outline-info border-0 text-capitalize shadow-lg my-1 me-2" data-code='${code}' type="button" onclick="this.remove()">${name} <i class="bi bi-x-lg"></i></button>`;
        var isExist = false;
        var container = $(e).closest('div.filter-section').find('div.filter-result-area');
        container.find('button').each((i, elm) => {
            var btnCode = $(elm).attr('data-code');
            if (btnCode === code) isExist = true;
        })

        selection.val('');
        if (isExist) return true;
        container.append(btnHtml);
    }
}