

/**
 * @class 公共的方法
 */
exports = module.exports = {
    /**
       * 如果url中有多个相同的key，不会合并为数组
       * 如果有url编码，不会decode
       * @method getUrlParam
       * @param {String} key
       * @return {String} value 
       */
    getUrlParam(name) {
        const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        const r = window.location.search.substr(1).match(reg);
        if (r !== null) return r[2];
        return null;
    },
    addUrlParam(key, value) {
        const query = window.location.search;
        if (!query) return `${key}=${value}`;
        return window.location.search.slice(1) + `&${key}=${value}`;
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
            parser = document.createElement("a");
            parser.href = url;
        }

        var searchObject = {},
            queries,
            split,
            i;
        queries = parser.search.replace(/^\?/, "").split("&");
        for (i = 0; i < queries.length; i++) {
            split = queries[i].split("=");
            if (split[1]) searchObject[split[0]] = split[1];
        }

        Object.assign(searchObject, searchObj);

        _url = parser.origin + parser.pathname + "?";

        var _searchKeys = Object.keys(searchObject || {});
        _searchKeys.forEach((key, index) => {
            _url =
                _url +
                key +
                "=" +
                searchObject[key] +
                (index !== _searchKeys.length - 1 ? "&" : "");
        });

        return _url;
    },
    getExtension(filename) {
        if (!filename) return "";
        return filename.split(".").reverse()[0];
    },
    getImageByFileKey(baseUrl, fileKey) {
        const pdfSurface =
            "https://gw.alicdn.com/tfs/TB1ODTxggMPMeJjy1XbXXcwxVXa-210-210.png";
        // filekey is like that:
        // image/2017/9/18/1505745755354/ding08290df7aea1a99235c2f4657eb6378f_
        // 128463023d0096ec6c83575373e3a21d129ff8fef.jpg
        const extension = exports.getExtension(fileKey);
        if (extension.toLowerCase() === "pdf") {
            return pdfSurface;
        }
        return fileKey ? `${baseUrl}getImage?fileKey=${fileKey}` : "";
    },
    // 获取所有的查询字符串，key： value 形式返回
    getAllUrlParams() {
        const search = window.location.search.slice(1);
        const items = search.split("&");
        const ret = {};
        items.forEach(q => {
            const key = q.split("=")[0];
            const value = q.split("=")[1];
            ret[decodeURI(key)] = decodeURI(value);
        });
        return ret;
    },
    // Object -> Bool
    hasEmpty(data) {
        let pass = true;
        for (const key in data) {
            if (!data[key] && data[key] !== false) {
                pass = false;
            }
        }
        return !pass;
    },
    /**
     * 判断一个对象是否为null 或者undefined
     * @param {需要验证的对象} v 
     */
    isNil(v) {
        return v === undefined || v === null;
    },
    /**
       *  合并两个对象
       * 如果dest对应属性value为undefined，则不会更新
       * @method merge
       * @param {object} src
       * @param {object} dest
       * @return {object} merged object 
       */
    merge(src, dest) {
        const ret = { ...src };
        for (const key in dest) {
            if (dest[key] !== undefined) {
                ret[key] = dest[key];
            }
        }
        return ret;
    },
    /**
       * @method 获取变量的数据类型
       * @param {变量} any
       */
    type(obj) {
        var refrenceType = {};
        "Boolean Number String Function Array Date RegExp Object Error"
            .split(" ")
            .forEach(function (e) {
                refrenceType["[object " + e + "]"] = e.toLowerCase();
            });
        //当然为了兼容IE低版本，forEach需要一个polyfill，不作细谈了。
        function _typeof(obj) {
            if (obj === null) {
                return String(obj);
            }
            return typeof obj === "object" || typeof obj === "function"
                ? refrenceType[refrenceType.toString.call(obj)] || "object"
                : typeof obj;
        }

        return _typeof(obj);
    },
    // 节流 delay 内 必然执行且只执行一次
    throttle(delay) {
        let timer = null;
        let execTime = new Date().getTime();
        return (target, name, descriptor) => {
            const fn = descriptor.value;
            const newFunc = function (...args) {
                const currentTime = new Date().getTime();
                if (currentTime - execTime >= delay) {
                    fn.apply(context, args);
                }
                execTime = currentTime;
                const context = this;
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(context, args), delay);
            };
            descriptor.value = newFunc;
            return descriptor;
        };
    },
    // 防抖，制定delay ，函数最多只执行一次
    debounce(delay, immediate) {
        let timer;
        return (target, name, descriptor) => {
            const fn = descriptor.value;
            const newFunc = function (...args) {
                var context = this;
                var later = () => {
                    timer = null;
                    if (!immediate) fn.apply(context, args);
                };
                var callNow = immediate && !timer;
                clearTimeout(timer);
                timer = setTimeout(later, delay);
                if (callNow) fn.apply(context, args);
            };
            descriptor.value = newFunc;
            return descriptor;
        };
    },
    /**
     * 
     * @param {string} str 
     */
    hash(str, divisor = 1) {
        if (!str) return 0;
        let hash = 0,
            i,
            chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash % divisor;
    },
    /**
       * @method formatDate
       * @param {object} Date
       * @return {String} Date String YYYY-MM-DD
    **/
    formatDate(date) {
        var d = new Date(date),
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [year, month, day].join("-");
    }
};
