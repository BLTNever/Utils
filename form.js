import React from "react";
// import { Modal } from "antd-mobile";
import R from "./ramda";

import { type, getUrlParam } from "./common";

import { set, get } from "./db";

import { alert } from "./dingtalk";

function isForeign() {
    return (
        [
            "ding86a9a9682604167035c2f4657eb6378f",
            "ding3f4e59195320857235c2f4657eb6378f"
        ].indexOf(getUrlParam("corpId")) !== -1
    );
}

// 表单逻辑相关，主要是validator-输入校验
// showMessage- form收集的错误信息，这里展示第一个出错的信息
const getCacheKey = () => `cache:${get("uid")}:V2.0:${get("corpId")}`;
module.exports = {
    validator(rule, value, cb, _cache) {
        let message = "";

        // 草稿功能（前端缓存）

        const cache = get(getCacheKey());

        // 图片不缓存
        if (rule.fullField.indexOf("__photo__.") === -1) {
            set(getCacheKey(), {
                ...cache,
                ..._cache
            });
        }

        const trimedValue = type(value) === "string" ? value.trim() : value;

        // sb代码开始
        if (rule.id === "sys05-contractRenewCount") {
            if (!Number.isInteger(Number(trimedValue))) {
                cb(`${rule.label}只能输入整数`);
            } else if (trimedValue.length > 2) {
                cb(`${rule.label}不能超过99`);
            }
        }
        if (rule.id === "sys04-bankAccountNo") {
            if (!Number.isInteger(Number(trimedValue))) {
                cb(`${rule.label}只能输入数字`);
            }
        }
        // sb代码结束
        if (R.isNil(value) || R.isEmpty(value)) {
            if (rule.required) {
                message = `${isForeign() ? "Please enter " : "请填写"}${rule.label}`;
                cb(message);
            }
        } else if (trimedValue.length > rule.max || trimedValue.length < rule.min) {
            message = `${rule.label}长度不能超过${rule.max}个字符`;
            cb(message);
        }
        cb();
    },
    showMessage(err) {
        let firstErrMessage = "";

        // 图片字段出错
        if (err.__photo__) {
            firstErrMessage = Object.values(err.__photo__)[0].errors[0].message;
        } else {
            // 其他字段出错
            firstErrMessage = Object.values(err)[0].errors[0].message;
        }

        alert({ message: firstErrMessage, buttonName: isForeign() ? "OK" : "好的" });
    },
    isRequired(payload) {
        if (!payload) return false;
        if (payload.visibleByEmp && !payload.deleted && payload.required) {
            return true;
        }
        return false;
    },
    getLoaded(payload) {
        if (!payload) return false;
        return payload.visibleByEmp && !payload.deleted;
    },
    getInitialValue(payload) {
        if (!payload) return "";
        return payload.value;
    },
    showGroup(...payload) {
        return (
            payload.filter(q => {
                if (!q) return false;
                return !q.deleted && q.visibleByEmp;
            }).length > 0
        );
    },
    showHint(payload) {
        if (!payload) return <div className="rlw-hint-empty" />;
        const hint = payload.hint;
        if (!hint) return <div className="rlw-hint-empty" />;
        return <div className="rlw-hint">{payload.hint}</div>;
    }
};
