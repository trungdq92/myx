
class AdvancePage extends PageBase {
    constructor() {
        super();
        this._galleryGLightBox = null
        this._pageIndex = 0;
        this._totalCount = 0;
        this._totalPage = 0;
        this._pageSize = 9;
        this._sortBy = 'createdAt=desc';
        this._init();
    }

    async _init() {
        await super._init()
        $('#container-area').append(await this._renderContent());
    }

    async _renderContent() {
        var html =
            `<div class="container">
                ${this._renderTitlePage()}
                ${await this._renderGallery()}
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
        var siteMap = await CommonFunction._loadJsonAsync(`${this.rootUrl}/assets/data/site_map.json`)
        var resultGallery = [];
        var galleries = siteMap.children.find(x => x.id == 'gallery').children;
        for (var i = 0; i < galleries.length; i++) {
            var searchData = new BaseCriteria(Constants.maxPageSize, 0, {}, this._sortBy);
            var result = await readData(`${this.rootUrl}/assets/data/post/gallery/${galleries[i].id}/master.csv`, searchData);
            resultGallery = resultGallery.concat(result.data);
        }
        var galleryHtml = ''
        resultGallery.splice(0, 7).forEach(item => {
            galleryHtml += renderGalleryImgHtml({ script: item.script, rootUrl: this.rootUrl })
        })

        var resultVideo = []
        var videos = siteMap.children.find(x => x.id == 'video').children;
        for (var i = 0; i < videos.length; i++) {
            var searchData = new BaseCriteria(Constants.maxPageSize, 0, {}, this._sortBy);
            var result = await readData(`${this.rootUrl}/assets/data/post/video/${videos[i].id}/master.csv`, searchData);
            resultVideo = resultVideo.concat(result.data);
        }
        var videoHtml = ''
        resultVideo.splice(0, 7).forEach(item => {
            videoHtml += renderVideoHtml({
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

        var resultComic = [];
        var comics = siteMap.children.find(x => x.id == 'comic').children;
        for (var i = 0; i < comics.length; i++) {
            var searchData = new BaseCriteria(Constants.maxPageSize, 0, {}, this._sortBy);
            var result = await readData(`${this.rootUrl}/assets/data/post/comic/${comics[i].id}/master.csv`, searchData);
            resultComic = resultComic.concat(result.data);
        }

        var comicHtml = ''
        resultComic.splice(0, 7).forEach(item => {
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
                rootUrl: this.rootUrl
            })
        })

        var html =
            `<section id="portfolio" class="portfolio section-bg p-1" data-aos="fade-up">
                <div class="row my-3" data-aos="fade-up" data-aos-delay="100">
                    <div class="col-12 my-2">
                        <div class="card w-100 border-0 shadow">
                            <div class="card-body">
                                <h5 class="card-title">Gallery</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${resultGallery.length} imgs</h6>
                                <div class="card-columns card-columns-gap-auto">
                                    ${galleryHtml}
                                </div>
                                <div class="row w-100">
                                    <a href="${this.rootUrl}/pages/gallery/" class="card-link text-end">More</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 my-2">
                        <div class="card w-100 border-0 shadow">
                            <div class="card-body">
                                <h5 class="card-title">Videos</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${resultVideo.length} videos</h6>
                                <div class="row" data-aos="fade-up" data-aos-delay="100">
                                    ${videoHtml}
                                </div>
                                <div class="row w-100">
                                    <a href="${this.rootUrl}/pages/video/" class="card-link text-end">More</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 my-2">
                        <div class="card w-100 border-0 shadow">
                            <div class="card-body">
                                <h5 class="card-title">Comics</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${resultComic.length} comics</h6>
                                <div class="row">
                                    ${comicHtml}
                                </div>
                                <div class="row w-100">
                                    <a href="${this.rootUrl}/pages/comic/" class="card-link text-end">More</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>`
        return html;
    }

    async _renderDetails() {
        var filterAnd = [];
        var filterOr = [];
        var searchFilter = {}
        var componentId = getUrlParameter('com') || this._component;
        if (componentId) {
            filterAnd.push((x) => x.componentId.includes(componentId))
        }

        var filterName = $('#filter-name').val();
        if (filterName !== '')
            filterAnd.push((x) => x.name.includes(filterName))

        $('#category-filter-section').find('button').each((i, elm) => {
            var code = $(elm).attr('data-code');
            if ([...elm.classList].includes('active'))
                filterOr.push(x => x.categoryIds.includes(code))
        });

        if (filterOr.length > 0) {
            searchFilter = { and: [{ or: filterOr }, { and: filterAnd }] }
        } else {
            searchFilter = { and: filterAnd }
        }

        var searchData = new BaseCriteria(this._pageSize, this._pageIndex, searchFilter, this._sortBy);
        var result = await readData(`${this.rootUrl}/assets/data/post/master.csv`, searchData);
        this._totalCount = result.totalCount;
        this._totalPage = result.totalPage;
        this._renderSort();

        var details = '';
        var data = result.data;
        data.forEach(item => {
            var category = '';
            item.categoryIds.split(',').forEach(cat => {
                var prefix = '';
                if (category !== '')
                    prefix = '<span>・</span>'

                category += ` ${prefix} ${cat.replace('_', ' ')}`
            });

            details +=
                `<div class="card my-2 border-0 shadow">
                    <a href="${item.thumbnail}" class="portfolio-lightbox" data-type="image">
                        <img src="${item.thumbnail}" class="img-fluid card-img-top" alt="" loading="lazy" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" />
                    </a>
                    <div class="card-body">
                        <h5 class="card-title text-capitalize">
                            ${item.name}
                        </h5>
                        <h6 class="card-subtitle mb-2 text-muted text-capitalize text-truncate" style="font-size: smaller;">
                            <span class="text-truncate ">
                            ${category}
                            </span>
                            <br />
                            <span class="text-truncate">
                                ${item.totalView} Views <span>・</span> ${item.createdAt.slice(0, 10)}
                            </span>
                        </h6>
                        <p class="card-text">
                            ${item.description.slice(0, 100)}
                        </p>
                        <a class="card-link text-capitalize" href="${this.rootUrl}/pages/${item.componentId}/post/?id=${item.id}">Read</a>
                    </div>
                </div>`
        })
        return details;
    }
}