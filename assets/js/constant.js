async function ajaxAsync(url, method, data) {
    var access_token = localStorage.getItem(Constants.accessToken);
    lockScreen();
    try {
        return $.ajax({
            url: Constants.apiHost + url,
            method: method,
            headers: {
                'Access-Control-Allow-Origin': "*",
                "Cache-Control": "no-cache",
                "Authorization": "Bearer " + access_token,
            },
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            error: (jqXHR, textStatus, errorThrown) => {
                if (jqXHR.status == 401) {
                    location.href = Constants.authUrl + "?returnUrl=" + url;
                }
            },
            complete: () => {
                unlockScreen();
            }
        });
    } catch {
        return null
    }
}

function changeThemeSiteStyle(elm) {
    $('html').attr('data-bs-theme', $(elm).is(':checked') ? Constants.ThemeStyle.dark : Constants.ThemeStyle.light);
    localStorage.setItem(Constants.ThemeKey, $(elm).is(':checked') ? Constants.ThemeStyle.dark : Constants.ThemeStyle.light)
}


function lockScreen() {
    var preload = document.getElementById('preloader');
    if (preload) return;

    preload = document.createElement('div');
    preload.id = "preloader";
    document.body.append(preload);
}

function unlockScreen() {
    var preload = document.getElementById('preloader');
    if (preload)
        preload.remove();
}

function _initGLightbox(id) {
    var g = GLightbox({
        selector: id,
        touchNavigation: true,
        keyboardNavigation: true,
        loop: true,
    });

    g.on('open', function () {
        g.reload();
    });

    return g;
}

function getUrlParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param)
}

function matches(item) {
    const expected = item[this.value];
    const actual = item[this.property];
    switch (this.comparator) {
        case '===': return actual === expected;
        case '>': return actual > expected;
        case '<': return actual < expected;
        case 'includes': return actual.includes(expected);
        case 'after': return new Date(actual) > expected;
    }
}

function compare(property, comparator, value) {
    return { property, comparator, value };
}

async function readData(path, criteria) {
    lockScreen();
    var response = await fetch(path);
    const csvData = await response.text();
    for (var row in csvData) csvData[row].split(',');
    var result = Papa.parse(csvData, {
        header: true
    });

    var data = buildFilter(criteria.filter, result.data);
    var totalCount = data.length;
    data = orderProcess(data, criteria.sorts);
    data = data.slice(criteria.pageIndex * criteria.pageSize, criteria.pageSize * (criteria.pageIndex + 1))
    unlockScreen() 
    return new BaseSearchResponse(totalCount, criteria.pageSize, criteria.pageIndex, data);
}

async function readDataMulti(criteria, multi) {
    lockScreen();
    var siteMap = await CommonFunction._loadJsonAsync(`${this.rootUrl}/assets/data/site_map.json`)
    var csvFiles = siteMap.children.find(x => x.id == multi.componentCode).children;
    var result = [];
    for (var i = 0; i < csvFiles.length; i++) {
        var response = await fetch(`${this.rootUrl}/assets/data/post/${multi.componentCode}/${csvFiles[i].id}/master.csv`);
        const csvData = await response.text();
        for (var row in csvData) csvData[row].split(',');
        var resultSingle = Papa.parse(csvData, {
            header: true
        });
        result = result.concat(resultSingle.data);
    }

    var data = buildFilter(criteria.filter, result);
    var totalCount = data.length;
    data = orderProcess(data, criteria.sorts);
    data = data.slice(criteria.pageIndex * criteria.pageSize, criteria.pageSize * (criteria.pageIndex + 1))
    unlockScreen() 
    return new BaseSearchResponse(totalCount, criteria.pageSize, criteria.pageIndex, data);
}

function buildFilter(filter, data) {
    if (Object.hasOwn(filter, 'and'))
        filter.and.forEach(item => {
            if (Object.hasOwn(item, 'or')) {
                if (item.or.length > 0)
                    data = data.filter(x => item.or.some(f => f(x)));
            } else if (Object.hasOwn(item, 'and')) {
                if (item.and.length > 0)
                    data = data.filter(x => item.and.every(f => f(x)));
            } else {
                data = data.filter(x => item(x));
            }
        });

    return data;

}

function orderProcess(data, sorts) {
    var sort = sorts.split('=')[1]
    var order = sorts.split('=')[0]
    switch (order) {
        case 'id':
            if (sort == 'asc')
                data = data.sort((a, b) => a.id.localeCompare(b.id));
            else
                data = data.sort((b, a) => a.id.localeCompare(b.id));
            break;
        case 'name':
            if (sort == 'asc')
                data = data.sort((a, b) => a.name.localeCompare(b.name));
            else
                data = data.sort((b, a) => a.name.localeCompare(b.name));
            break;
        case 'category':
            if (sort == 'asc')
                data = data.sort((a, b) => a.categoryIds.localeCompare(b.categoryIds));
            else
                data = data.sort((b, a) => a.categoryIds.localeCompare(b.categoryIds));
            break;
        case 'createdAt':
            if (sort == 'asc')
                data = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            else
                data = data.sort((b, a) => new Date(a.createdAt) - new Date(b.createdAt));
            break;

        case 'totalDue':
            if (sort == 'asc')
                data = data.sort((a, b) => parseInt(a.totalDue) - parseInt(b.totalDue));
            else
                data = data.sort((b, a) => parseInt(a.totalDue) - parseInt(b.totalDue));
            break;
        case 'actor':
            if (sort == 'asc')
                data = data.sort((a, b) => a.actorId.localeCompare(b.actorId));
            else
                data = data.sort((b, a) => a.actorId.localeCompare(b.actorId));
            break;
        case 'director':
            if (sort == 'asc')
                data = data.sort((a, b) => a.directorId.localeCompare(b.directorId));
            else
                data = data.sort((b, a) => a.directorId.localeCompare(b.directorId));
            break;
        case 'artist':
            if (sort == 'asc')
                data = data.sort((a, b) => a.artistId.localeCompare(b.artistId));
            else
                data = data.sort((b, a) => a.artistId.localeCompare(b.artistId));
            break;
    }

    return data;
}

function csvToArr(stringVal, splitter) {
    if (!splitter) splitter = ','
    const [keys, ...rest] = stringVal
        .trim()
        .split("\n")
        .map((item) => item.split(splitter));

    const formedArr = rest.map((item) => {
        const object = {};
        keys.forEach((key, index) => (object[key.trim()] = item.at(index).trim()));
        return object;
    });
    return formedArr;
}
class BaseSearchResponse {
    constructor(totalCount, pageSize, pageIndex, data) {
        this.totalCount = totalCount
        this.pageSize = pageSize || 10
        this.pageIndex = pageIndex || 0
        this.totalPage = parseInt(this.totalCount / this.pageSize) + ((this.totalCount % this.pageSize) > 0 ? 1 : 0);
        this.data = data || {}
    }
}
class BaseCriteria {
    constructor(pageSize, pageIndex, filter, sorts) {
        this.pageSize = pageSize || 10
        this.pageIndex = pageIndex || 0
        this.filter = filter || {}
        this.sorts = sorts || "id=desc";
    }
}


const Constants = class Constants {
    static maxPageSize = 9999;
    static apiHost = "https://trungdq92.bsite.net/"
    static rootUrl = "/myx/"
    static authUrl = this.rootUrl + "auth/"
    static accessToken = "access_token"
    static pjName = 'myx';
    static pages = 'pages'
    static pageContent = 'content'
    static pageContentDetail = 'detail'
    static BackGroundColor = ["bg-color-second", "bg-transparent"];
    static ThemeKey = 'ThemeStyle';
    static ThemeStyle = {
        dark: 'dark',
        light: 'light'
    };
    static videoScpType = {
        video: 'video',
        iframe: 'iframe'
    };
    static galleryType = {
        comic: 'comic',
        gallery: 'gallery',
        video: 'video'
    }

    static galleryCache = {
        details: 'galleryCache',
        gridViewType: 'galleryGridViewType',
        gridPlayerType: 'galleryGridPlayerType',
    }
    constructor() { }
}

const CommonFunction = class CommonFunction {
    constructor() { }
    static _domainPath() {
        return `${location.protocol}//${location.hostname}${location.port == '' ? '' : ':' + location.port}/${Constants.pjName}`;
    }

    static _isMobile() {
        let check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }

    static _createImgLinkLoop(prefix, subfix, start, end) {
        var imgs = [];
        for (let i = start; i <= end; i++) {
            var path = prefix + i + subfix;
            imgs.push(path)
        }
        return imgs;
    }

    static async _loadJsonAsync(path) {
        return $.getJSON(path, function (data) {
            return data;
        });
    }


    static _getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    };

    static _getGroupIdFromPath() {
        var pathName = window.location.pathname;
        var path = pathName.split(`/${Constants.pages}/`);
        if (path.length < 2) {
            return '';
        }

        return path[1].split('/')[0];
    }

    static _getContentIdFromPath() {
        var pathName = window.location.pathname;
        var path = pathName.split(`/${Constants.pageContent}/`);
        if (path.length < 2) {
            return '';
        }
        return path[1].split('/')[0];
    }

    static _getContentDetailIdFromPath() {
        var pathName = window.location.pathname;
        var path = pathName.split(`/${Constants.pageContentDetail}/`)
        if (path.length < 2) {
            return '';
        }
        return path[1].split('/')[0];
    }

    static _groupBy(xs, key) {
        return xs.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };

}

const InitGalleryFuntion = class InitGalleryFuntion {
    constructor() { }
    static _initGLightbox(id) {
        var g = GLightbox({
            selector: id,
            touchNavigation: true,
            keyboardNavigation: true,
            loop: true,
        });

        g.on('open', function () {
            g.reload();
        });

        return g;
    }
}

const DomEventFuntion = class DomEventFuntion {
    constructor() { }
    static _removePreload() {
        var preload = document.getElementById('preloader');
        if (preload)
            preload.remove();
    }

    static _backToTop() {
        let backtotop = document.getElementById('back-to-top');
        if (backtotop) {
            const toggleBacktotop = () => {
                if (window.scrollY > 100) {
                    backtotop.classList.add('active')
                } else {
                    backtotop.classList.remove('active')
                }
            }
            document.addEventListener('load', toggleBacktotop);
            document.addEventListener('scroll', toggleBacktotop)
        }
    }

    static _showSideMenu() {
        let menusite = document.getElementById('btn-menu-side');
        if (menusite) {
            const showMenuSite = () => {
                if (window.scrollY > 50) {
                    menusite.classList.add('active')
                } else {
                    menusite.classList.remove('active')
                }
            }
            document.addEventListener('load', showMenuSite);
            document.addEventListener('scroll', showMenuSite)
        }
    }

    static _changeViewPageStyle(type, page) {
        localStorage.setItem(Constants.galleryCache.gridViewType + page, type);
        location.reload(true);
    }

    static _changePlayerType(type, page) {
        localStorage.setItem(Constants.galleryCache.gridPlayerType + page, type);
        location.reload(true);
    }

    static _changeThemeStyle() {
        var type = localStorage.getItem(Constants.ThemeKey);
        switch (type) {
            case Constants.ThemeStyle.dark:
                localStorage.setItem(Constants.ThemeKey, Constants.ThemeStyle.light);
                break;
            case Constants.ThemeStyle.light:
                localStorage.setItem(Constants.ThemeKey, Constants.ThemeStyle.dark);
                break;
            default:
                localStorage.setItem(Constants.ThemeKey, Constants.ThemeStyle.dark);
        }

        location.reload(true);
    }

    static _createArrayDom(elements) {
        //Transform our nodeList into array and apply sort function
        return [].map.call(elements, function (elm) {
            return elm;
        });
    }
}
