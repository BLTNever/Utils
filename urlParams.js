// 获取url参数
const urlParams = {

    getUrlHashParam: function (key) {
        var search = location.hash;
        var arr = '';
        if (!search) {
            arr = [];
        } else if (search.substr(1).split('?').length) {
            arr = (search.substr(1).split('?'))[1] ? (search.substr(1).split('?'))[1].substr(0).split('&') : [];
        } else {
            arr = [];
        }
        var param = {};
        for (var i = 0, l = arr.length; i < l; i++) {
            var kv = arr[i].split('=');
            param[kv[0]] = kv[1];
        }
        return key ? (param[key] || '') : param;
    },

    getUrlSearchParam: function (key) {
        var search = location.search;
        var arr = !search ? [] : location.search.substr(1).split('&');
        var param = {};
        for (var i = 0, l = arr.length; i < l; i++) {
            var kv = arr[i].split('=');
            param[kv[0]] = kv[1];
        }
        return key ? (param[key] || '') : param;
    },

    getFullUrlParam: function (key) {
        var search = location.search;
        var arr = !search ? [] : location.search.substr(1).split('&');
        var param = {};
        for (var i = 0, l = arr.length; i < l; i++) {
            var kv = arr[i].split('=');
            param[kv[0]] = kv[1];
        }
        // 当前param[key] 不存在的时候取hash 里面的
        if (!param[key]) {
            var hash = location.hash;
            var _arr = '';
            if (!hash) {
                _arr = [];
            } else if (hash.substr(1).split('?').length) {
                _arr = (hash.substr(1).split('?'))[1] ? (hash.substr(1).split('?'))[1].substr(0).split('&') : [];
            } else {
                _arr = [];
            }
            for (var i = 0, l = _arr.length; i < l; i++) {
                var kv = _arr[i].split('=');
                param[kv[0]] = kv[1];
            }
        }
        return key ? (param[key] || '') : param;

    },

    parseUrl: function (url) {
        var parser;
        if (!url) {
            parser = window.location;
        } else {
            parser = document.createElement('a');
            parser.href = url;
        }
        var searchObject = {},
            queries, split, i;
        queries = parser.search.replace(/^\?/, '').split('&');
        for (i = 0; i < queries.length; i++) {
            split = queries[i].split('=');
            searchObject[split[0]] = decodeURIComponent(split[1]);
        }
        return {
            protocol: parser.protocol,
            host: parser.host,
            hostname: parser.hostname,
            port: parser.port,
            pathname: parser.pathname,
            search: parser.search,
            searchObject: searchObject,
            hash: parser.hash
        };
    },
    /**
     * searchObj对象{}
     * url 当前url
     */
    replaceSearch: function (searchObj = {}, url) {
        var parser, _url;
        if (!url) {
            parser = window.location;
        } else {
            parser = document.createElement('a');
            parser.href = url;
        }

        var searchObject = {},
            queries, split, i;
        queries = parser.search.replace(/^\?/, '').split('&');
        for (i = 0; i < queries.length; i++) {
            split = queries[i].split('=');
            if (split[1])
                searchObject[split[0]] = split[1];
        }

        Object.assign(searchObject, searchObj);

        _url = parser.origin + parser.pathname + "?";

        var _searchKeys = Object.keys(searchObject || {});
        _searchKeys.forEach((key, index) => {
            _url = _url + key + "=" + searchObject[key] + (index !== _searchKeys.length - 1 ? "&" : "");
        });

        return _url;
    }
}

export default urlParams;