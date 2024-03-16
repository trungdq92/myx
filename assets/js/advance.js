
class AdvancePage extends PageBase {
    constructor() {
        super();
        this._galleryGLightBox = null
        this._pageIndex = 0;
        this._totalCount = 0;
        this._totalPage = 0;
        this._pageSize = 20;
        this._firstShow = 7;
        this._sortBy = 'createdAt=desc';
        this._cardColumnsGap = 'card-columns-gap-auto'
        this._currentComponent = ''
        this._init();
    }

    async _init() {
        await super._init()
        var _page = this
        $('#container-area').append(await this._renderContent());
        $('#show-more').click(() => { this.loadMore() });
        $('#btnFilter').click((e) => this._filter());
        $(".btnSort").click((e) => {
            var sort = $(e.currentTarget).attr('data-sort');
            _page._sortBy = sort;
            _page._filter();
        });

        document.querySelectorAll('.btn-change-grid').forEach(elm => {
            elm.addEventListener('click', (e) => {
                var type = $(e.currentTarget).attr('data-type');
                this._changeViewPageStyle(type)
            }, false);
        })

        $('#data-content-gallery').html(await this._renderFirstGallery())
        $('#data-content-video').html(await this._renderFirstVideo())
        $('#data-content-comic').html(await this._renderFirstComic())

        this._galleryGLightBox = _initGLightbox('.portfolio-lightbox');
    }

    async _renderContent() {
        var html = `
            ${this._renderTitlePage()}
            <div class="container">
                ${await this._renderFilter()}
                ${this._renderGridControl()}
                <div id="contents">
                    ${await this._renderGallery()}
                </div>
                <div class="my-5 text-center">
                    <button id="show-more" class="btn btn-outline-primary border-0 rounded shadow invisible">
                        More <i class="bi bi-arrow-right"></i>
                    </button>
                </div>
            </div>`
        return html;
    }

    _renderTitlePage() {
        return `<div class="title-page sticky-top">
                    <div class="container">
                        <div class="row">
                            <h5 class="h1 text-capitalize fw-bold">
                                ${this._component || Constants.pjName}
                                <a class="btn btnFilter p-2 btn-primary border-0 rounded-circle" data-bs-toggle="modal" data-bs-target="#filterModal" ><i class="bi bi-funnel-fill"></i></a>
                            </h5>
                        </div>
                        <div class="row text-mute" style="font-size:smaller">
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                    <li class="breadcrumb-item"><a href="/${Constants.pjName}" class="active"><i class="bi bi-house-fill"></i></a></li>
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
                <div class="row my-3" data-aos="fade-up" data-aos-delay="100">
                    <div class="col-12 my-2">
                        <div class="card w-100 border-0 shadow">
                            <div class="card-body">
                                <h5 class="card-title">Gallery</h5>
                                <h6 class="card-subtitle mb-2 text-muted" id="total-data-content-gallery"></h6>
                                <div class="card-columns card-columns-gap-auto" id="data-content-gallery">
                                </div>
                                <div class="row w-100 mt-3">
                                    <a href="${this.rootUrl}/pages/gallery/" class="card-link text-end">More</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 my-2">
                        <div class="card w-100 border-0 shadow">
                            <div class="card-body">
                                <h5 class="card-title">Videos</h5>
                                <h6 class="card-subtitle mb-2 text-muted" id="total-data-content-video"></h6>
                                <div class="row" id="data-content-video">
                                </div>
                                <div class="row w-100 mt-3">
                                    <a href="${this.rootUrl}/pages/video/" class="card-link text-end">More</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 my-2">
                        <div class="card w-100 border-0 shadow">
                            <div class="card-body">
                                <h5 class="card-title">Comics</h5>
                                <h6 class="card-subtitle mb-2 text-muted" id="total-data-content-comic"></h6>
                                <div class="row comic-book" id="data-content-comic">
                                </div>
                                <div class="row w-100 mt-3">
                                    <a href="${this.rootUrl}/pages/comic/" class="card-link text-end">More</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>`
        return html;
    }

    async _renderFirstGallery() {
        var filter = [];
        filter.push((x) => x.componentId.includes('gallery'))
        var searchData = new BaseCriteria(1, 0, { and: filter }, 'createdAt=desc');
        var resultPost = await readData(`${this.rootUrl}/assets/data/post/master.csv`, searchData);
        if (!resultPost.data[0]) return '';

        var newestPost = resultPost.data[0];
        searchData = new BaseCriteria(this._firstShow, 0, {}, 'createdAt=desc');
        var resultGallery = await readData(`${this.rootUrl}/assets/data/post/gallery/${newestPost.id}/master.csv`, searchData);

        var galleryHtml = ''
        resultGallery.data.forEach(item => {
            galleryHtml += renderGalleryImgHtml({ script: item.script, rootUrl: this.rootUrl })
        })

        $('#total-data-content-gallery').text(`${resultGallery.totalCount} imgs`)

        return galleryHtml;
    }

    async _renderFirstVideo() {
        var filter = [];
        filter.push((x) => x.componentId.includes('video'))
        var searchData = new BaseCriteria(1, 0, { and: filter }, 'createdAt=desc');
        var resultPost = await readData(`${this.rootUrl}/assets/data/post/master.csv`, searchData);
        if (!resultPost.data[0]) return '';

        var newestPost = resultPost.data[0];
        searchData = new BaseCriteria(this._firstShow, 0, {}, 'createdAt=desc');
        var resultVideo = await readData(`${this.rootUrl}/assets/data/post/video/${newestPost.id}/master.csv`, searchData);
        var videoHtml = ''
        resultVideo.data.forEach((item, index) => {
            videoHtml += renderVideoHtml({
                id: item.id,
                name: item.name,
                postId: item.postId,
                thumbnail: item.thumbnail,
                totalDue: item.totalDue,
                totalView: item.totalView,
                createdAt: item.createdAt,
                rootUrl: this.rootUrl,
                cardColumnsGap: 'col-md-3 col-6'
            }, index, resultVideo.totalCount)
        })

        $('#total-data-content-video').text(`${resultVideo.totalCount} videos`)

        return videoHtml;
    }

    async _renderFirstComic() {
        var filter = [];
        filter.push((x) => x.componentId.includes('comic'))
        var searchData = new BaseCriteria(1, 0, { and: filter }, 'createdAt=desc');
        var resultPost = await readData(`${this.rootUrl}/assets/data/post/master.csv`, searchData);
        if (!resultPost.data[0]) return '';

        var newestPost = resultPost.data[0];
        searchData = new BaseCriteria(this._firstShow, 0, {}, 'createdAt=desc');
        var resultComic = await readData(`${this.rootUrl}/assets/data/post/comic/${newestPost.id}/master.csv`, searchData);
        var comicHtml = ''
        resultComic.data.forEach(item => {
            comicHtml += renderComicBookHtml({
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
                cardColumnsGap: 'col-md-auto col-6'
            })
        })

        $('#total-data-content-comic').text(`${resultComic.totalCount} books`)
        return comicHtml;
    }

    async _renderFilter() {
        var searchData = new BaseCriteria(Constants.maxPageSize, 0, {}, this._sortBy);
        var components = await readData(`${this.rootUrl}/assets/data/master/component/master.csv`, searchData);
        var componentHtml = '';
        components.data.forEach((item, index) => {
            componentHtml += `
            <input type="radio" class="btn btn-check" data-prefix="component_" data-code='${item.id}' name="options-component" id="component_${item.id}" autocomplete="off" ${index == 0 ? "checked" : ""}>
            <label class="btn btn-outline-secondary border-0 text-capitalize shadow-lg my-1 me-2" for="component_${item.id}">${item.name}</label>`
        })

        searchData = new BaseCriteria(Constants.maxPageSize, 0, {}, this._sortBy);
        var categories = await readData(`${this.rootUrl}/assets/data/master/category/master.csv`, searchData);
        var categoryHtml = '';
        categories.data.forEach(item => {
            if (item.parentId === '')
                categoryHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="category_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
        })

        searchData = new BaseCriteria(Constants.maxPageSize, 0, {}, this._sortBy);
        var tags = await readData(`${this.rootUrl}/assets/data/master/hash_tag/master.csv`, searchData);
        var tagHtml = '';
        tags.data.forEach(item => {
            tagHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
        })

        searchData = new BaseCriteria(Constants.maxPageSize, 0, {}, "name=asc");
        var artistResult = await readData(`${this.rootUrl}/assets/data/master/artist/master.csv`, searchData);
        var artistHtml = '';
        artistResult.data.forEach(item => {
            artistHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
        })

        searchData = new BaseCriteria(Constants.maxPageSize, 0, {}, "name=asc");
        var actorResult = await readData(`${this.rootUrl}/assets/data/master/actor/master.csv`, searchData);
        var actorHtml = '';
        actorResult.data.forEach(item => {
            actorHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
        })

        var directorResult = await readData(`${this.rootUrl}/assets/data/master/director/master.csv`, searchData);
        var directorHtml = '';
        directorResult.data.forEach(item => {
            directorHtml += `<button class="btn border-0 text-capitalize shadow-lg my-1 me-2" data-prefix="tag_" data-code='${item.id}' type="button" onclick="this.classList.toggle('btn-filter-active')">${item.name}</button>`
        })

        var filterContents = [
            {
                id: "component-filter-section",
                name: "Components",
                html: componentHtml
            },
            {
                id: "category-filter-section",
                name: "Categories",
                html: categoryHtml
            },
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
                id: "actor-filter-section",
                name: "Actors",
                html: actorHtml
            },
            {
                id: "director-filter-section",
                name: "Directors",
                html: directorHtml
            },
            {
                id: "other-filter-section",
                name: "Other",
                html: `<div class="form-floating mb-3">
                            <input type="text" class="form-control" id="filter-name">
                            <label for="filter-name">Name</label>
                        </div>`
            },
        ]

        var html = renderContainerFilterHtml(filterContents);
        return html;
    }

    async _renderDetails() {
        var filter = [];
        var searchFilter = {}
        var components = [];
        var searchData = {};
        var _page = this;
        $('#component-filter-section').find('input').each((i, elm) => {
            if (!$(elm).is(':checked')) return;
            var code = $(elm).attr('data-code');
            components.push(code)
            _page._currentComponent = code;
        });

        if (components.length == 0) return '';

        var filterName = $('#filter-name').val();
        if (filterName !== '')
            filter.push((x) => x.name.includes(filterName))

        var categoryFilter = [];
        $('#category-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('btn-filter-active'))
                categoryFilter.push(x => x.categoryIds.includes(code))
        });

        var tagFilter = [];
        $('#tag-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('btn-filter-active'))
                tagFilter.push(x => x.hashTags.includes(code))
        });

        var actorFilter = [];
        $('#actor-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('btn-filter-active'))
                actorFilter.push(x => x.actorId.includes(code))
        });

        var directorFilter = [];
        $('#director-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('btn-filter-active'))
                directorFilter.push(x => x.directorId.includes(code))
        });

        var artistFilter = [];
        $('#artist-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('btn-filter-active'))
                artistFilter.push(x => x.artistId.includes(code))
        });

        var result = new BaseSearchResponse(0, 1, 0, []);
        var resultGallery = new BaseSearchResponse(0, 1, 0, []);
        var resultVideo = new BaseSearchResponse(0, 1, 0, []);
        var resultComic = new BaseSearchResponse(0, 1, 0, []);
        var galleryHtml = ''
        var videoHtml = ''
        var comicHtml = ''
        var detailHtml = ''

        if (components.includes('gallery')) {
            if (tagFilter.length > 0) {
                filter = filter.concat({ or: tagFilter });
            }
            if (categoryFilter.length > 0) {
                filter = filter.concat({ or: categoryFilter });
            }
            searchFilter = { and: filter }
            searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
            resultGallery = await readDataMulti(searchData, { componentCode: 'gallery' });
            resultGallery.data.forEach(item => {
                galleryHtml += renderGalleryImgHtml({ script: item.script, rootUrl: this.rootUrl })
            })
            result = resultGallery
            detailHtml = `<section class="portfolio p-1">
                            <div class="card-columns ${this._cardColumnsGap}">
                                ${galleryHtml}
                            </div>
                        </section>`;
        } else if (components.includes('video')) {
            if (tagFilter.length > 0) {
                filter = filter.concat({ or: tagFilter });
            }
            if (categoryFilter.length > 0) {
                filter = filter.concat({ or: categoryFilter });
            }
            if (actorFilter.length > 0) {
                filter = filter.concat({ or: actorFilter });
            }
            if (directorFilter.length > 0) {
                filter = filter.concat({ or: directorFilter });
            }
            searchFilter = { and: filter }
            searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
            resultVideo = await readDataMulti(searchData, { componentCode: 'video' });
            resultVideo.data.forEach((item, index) => {
                videoHtml += renderVideoHtml({
                    id: item.id,
                    name: item.name,
                    postId: item.postId,
                    thumbnail: item.thumbnail,
                    totalDue: item.totalDue,
                    totalView: item.totalView,
                    createdAt: item.createdAt,
                    rootUrl: this.rootUrl,
                    cardColumnsGap: 'col-md-3 col-6'
                }, index, resultVideo.totalCount)
            })
            result = resultVideo;
            detailHtml = `<div class="row">
                            ${videoHtml}
                        </div>`;
        } else if (components.includes('comic')) {
            if (tagFilter.length > 0) {
                filter = filter.concat({ or: tagFilter });
            }
            if (categoryFilter.length > 0) {
                filter = filter.concat({ or: categoryFilter });
            }
            if (artistFilter.length > 0) {
                filter = filter.concat({ or: artistFilter });
            }
            searchFilter = { and: filter }
            searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
            resultComic = await readDataMulti(searchData, { componentCode: 'comic' });
            resultComic.data.forEach(item => {
                comicHtml += renderComicBookHtml({
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
                    cardColumnsGap: 'col-md-auto col-6'
                })
            })
            result = resultComic
            detailHtml = `<div class="comic-book">
                            ${comicHtml}
                        </div>`;
        }


        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        this._renderSort();
        return detailHtml;
    }

    _renderGridControl() {
        var html = `<div class="grid-view-style d-none" id="grid-control">
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
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="name=asc" href="#">name <i class="bi bi-sort-down"></i></a></li>
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="name=desc"  href="#">name <i class="bi bi-sort-up"></i></a></li>
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="createdAt=asc" href="#">created <i class="bi bi-sort-down"></i></a></li>
                                            <li><a class="dropdown-item text-capitalize btnSort" data-sort="createdAt=desc"  href="#">created <i class="bi bi-sort-up"></i></a></li>
                                        </ul>
                                    </div>
                                    
                                    <a class="btn btn-change-grid" data-type="1"><i class="bi bi-view-list"></i></a>
                                    <a class="btn btn-change-grid" data-type="5"><i class="bi bi-grid-1x2-fill"></i></a>
                                </div>
                            
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

    _changeViewPageStyle(type) {
        if (this._currentComponent !== 'gallery') return;
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

    async loadMore() {
        this._pageIndex++;
        var data = await this._renderDetails();
        $('#contents').append(data);
        if (this._galleryGLightBox !== null) this._galleryGLightBox.reload();
        this._hiddenLoadMoreBtn();
        $('#grid-control').removeClass('d-none');
        return true;
    }

    _hiddenLoadMoreBtn() {
        $('#show-more').removeClass("invisible visible");
        if ((this._pageIndex + 1) * this._pageSize >= this._totalCount) {
            $('#show-more').addClass("invisible");
        } else {
            $('#show-more').addClass("visible");
        }
    }

    async _filter() {
        this._pageIndex = 0;
        var data = await this._renderDetails();
        $('#contents').html(data);
        if (this._galleryGLightBox !== null) this._galleryGLightBox.reload();
        this._hiddenLoadMoreBtn();
        $('#grid-control').removeClass('d-none');

        var modal = $('#filterModal');
        if (modal && modal !== undefined) modal.modal('hide');
        return true;
    }
}