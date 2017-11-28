/* 
这个文件主要是对fetch的封装，一方面是增加一鞋header（如跨域传递cookie），
和body（比如corpId）。 还有就是对请求结果的封装。 非200的统一处理
200的json化（约定所有的接口采用json格式）后传递给业务逻辑层
另外对业务逻辑出错（status 200 ， success：false），直接展示errorMsg
*/
import fetch from "isomorphic-fetch";
import cookie from "js-cookie";

import { Modal } from "@ali/ding-ui";

import { alert, showPreloader, hidePreloader, toast } from "./dingtalk.js";

// utils
import { get, set } from "./db";
import lwp from "./lwp";

import wpo from '@ali/retcodelog';

// loading 做成单例的。
// 由于js-api 的 loading 不是单例的，因此hack
window._fetchingResources = [];

const errorMessages = res => `${res.status} ${res.statusText}`;

const USE_DIP = process.env && process.env.mock !== "api-mock";

function poineer(cacheKey, actionCreator, dispatch) {
    const cache = get(cacheKey);

    if (cache) {
        dispatch(actionCreator(cache.result));
        return Promise.resolve(cache);
    }
}

function check401(res) {
    // 登陆界面不需要做401校验
    if (res.status === 401 && !res.url.match("auth")) {
        Modal.alert({
            title: "登陆验证过期",
            content: "您的登陆验证已过期，请重新登陆",
            onOk: () => {
                cookie.remove("access_token");
                location.href = "/";
            }
        });

        return Promise.reject(errorMessages(res));
    }
    return res;
}

function check404(res) {
    if (res.status === 404) {
        return Promise.reject(errorMessages(res));
    }
    return res;
}

function checkStatus(response) {
    const res = response.json();

    if (response.status >= 200 && response.status < 300) {
        // 业务逻辑错
        return res.then(({ errorCode, errorMsg, result, ...rest }) => {
            if (errorCode) {
                return Promise.reject({
                    statusCode: errorCode,
                    msg: errorMsg
                });
            }
            return {
                ...rest,
                result
            };
        });
    }

    return res.then(() =>
        Promise.reject({
            statusCode: response.status,
            msg: response.statusText
        })
    );
}

function setUriParam(keys, value, keyPostfix) {
    let keyStr = keys[0];

    keys.slice(1).forEach(key => {
        keyStr += `[${key}]`;
    });

    if (keyPostfix) {
        keyStr += keyPostfix;
    }

    return `${encodeURIComponent(keyStr)}=${encodeURIComponent(value)}`;
}

function getUriParam(keys, object) {
    const array = [];

    if (object instanceof Array) {
        object.forEach(value => {
            array.push(setUriParam(keys, value, "[]"));
        });
    } else if (object instanceof Object) {
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                const value = object[key];

                array.push(getUriParam(keys.concat(key), value));
            }
        }
    } else {
        if (object !== undefined) {
            array.push(setUriParam(keys, object));
        }
    }

    return array.join("&");
}

function toQueryString(object) {
    const array = [];

    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            const str = getUriParam([key], object[key]);

            if (str !== "") {
                array.push(str);
            }
        }
    }

    return array.join("&");
}

function process(url, options = {}) {
    let mergeUrl = `${url}?q=1`;
    // 如果使用dip中的接口， 那么直接根据dipUrl和dipId 拼接处url
    if (USE_DIP) {
        const dipId = (options.meta || {}).dipId || 63484;

        // mergeUrl = `${get("dipUrl")}${dipId}?corpId=${get("corpId")}`;
        mergeUrl = `${get("dipUrl")}${dipId}`;
    }
    const defaultOptions = {
        method: "POST",
        credentials: USE_DIP ? undefined : "include"
    };

    const opts = Object.assign({}, defaultOptions, { ...options });

    // add query params to url when method is GET
    if (opts && opts.method === "GET" && opts["params"]) {
        mergeUrl = mergeUrl + "&" + toQueryString(opts["params"]);
    }
    // 除了上传其他都是application/json
    if (url.indexOf("uploadImage") === -1) {
        opts.headers = {
            "Content-Type": "application/json",
            ...opts.headers
        };
    }
    // 如果是application/json，就要序列化
    if (opts.headers && opts.headers["Content-Type"] === "application/json") {
        opts.body = JSON.stringify(opts.body);
    }

    return { mergeUrl, opts };
}

function cFetch(url, options) {

    const startTime = new Date().getTime();
    // poineer
    if (options.meta && options.meta.poineer) {
        const { cacheKey, actionCreator, dispatch } = options.meta.poineer;

        poineer(cacheKey, actionCreator, dispatch);
    }

    const { mergeUrl, opts } = process(url, options);

    //判断是否使用缓存
    // option.meta.showLoading 手动指定为false, 则不显示loading
    if (!(options.meta && options.meta.showLoading === false)) {
        if (options.isCache !== true && !window._fetchingResources.length) {
            // Toast.loading("加载中", 5);
            showPreloader();
        }
        window._fetchingResources.push({
            url
        });
    }

    return get("isLwp")
        ? lwp(mergeUrl, opts)
        : fetch(mergeUrl, opts)
            .then(res => {
                window._fetchingResources.pop();

                if (!window._fetchingResources.length) {
                    // 全部请求返回完毕
                    hidePreloader();
                    // Toast.hide();
                }

                return res;
            })
            .then(check401)
            .then(check404)
            .then(checkStatus)
            .then(res => {
                if (res.result && options.meta && options.meta.poineer) {
                    set(url, res);
                }
                wpo.retCode(url, true, (new Date()) - startTime);
                return res;
            })
            .catch(err => {
                wpo.retCode(url, false, (new Date()) - startTime, err);
                if (options.meta && options.meta.silence) return Promise.reject(err);
                if (err.statusCode) {
                    alert({ message: err.msg || "服务器出错" });
                } else {
                    toast({
                        text: err.msg || "服务器出错~"
                    });
                }
                // 后面的catch 约定不要弹框，不然就会重复弹框了
                return Promise.reject(err);
            });
}

export default cFetch;
