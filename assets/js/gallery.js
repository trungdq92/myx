class GalleryPage extends PageBase {
    constructor() {
        super();
        this._init();
    }

    async _init() {
        super._init();
        var content = await this._renderContent();
        $('body').append(content);
    }

    async _renderContent() {
        var html = `<div class="container-fluid">
                        ${this._renderGridControl()}
                        ${await this._renderGallery()}
                    </div>`
        return html;
    }

    _renderGridControl() {
        var html = `<div class="chapter-grid-view-style">
                        <div class="row justify-content-center my-3">
                            <div class="col fst-italic text-muted"><span id="total-count-result">100</span> <span>imgs</span></div>
                            <div class="col text-end">
                                <a onclick="changeViewPageStyle(this)" class="btn btn-outline-primary border-0 rounded shadow" data-type="1"><i class="bi bi-view-list"></i></a>
                                <a onclick="changeViewPageStyle(this)" class="btn btn-outline-primary border-0 rounded shadow" data-type="5"><i class="bi bi-grid-1x2-fill"></i></a>
                            </div>
                        </div>
                    </div>`;
        return html;
    }

    async _renderGallery() {
        var data = await ajaxAsync('Post/filter', 'post', {});
        var cardColumns = CommonFunction._isMobile() ? "card-columns-gap-2" : "card-columns-gap-5";
        var details = '';

        data.data.forEach(item => {
            var category = '';
            item.pCategories.forEach(cat => {
                if (category === '')
                    category += `${cat.post.name}`
                else
                    category += ` <span>・</span> ${cat.name}`
            });

            details += `<div class="card my-1">
                            <img src="${item.thumbnail}" class="img-fluid card-img-top" alt="" loading="lazy" onerror="this.src='${this.rootUrl}/assets/img/default-image.png'" />
                            <div class="card-body">
                                <h5 class="card-title">
                                    ${item.name}
                                </h5>
                                <p class="card-text">
                                    ${item.description.slice(0, 20)}
                                    <br />
                                    <span class="text-mute text-truncate" style="font-size: smaller;">
                                        ${category}
                                    </span>
                                    <br />
                                    <span class="text-mute text-truncate" style="font-size: smaller;">
                                        ${item.totalView} Views <span>・</span> ${item.createdAt.slice(0, 10)}
                                    </span>
            
                                </p>
                                <a class="btn btn-outline-primary border-0 rounded shadow" href="#">
                                    Read More <i class="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>`
        })
        var html = `<div class="row my-3" id="items-container">
                        <div class="card-columns ${cardColumns}">
                            ${details}
                        </div>
                        <div class="my-5 text-center">
                            <button id="show-more" class="btn btn-outline-primary border-0 rounded shadow" onclick="loadMore()">
                                More <i class="bi bi-arrow-right"></i>
                            </button>
                        </div>
                    </div>`;
        return html;
    }

}