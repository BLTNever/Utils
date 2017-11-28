import { getUrlParam } from "./common";
import wpo from '@ali/retcodelog';
import { get } from "./db";
export default (key, params) => {
    const corpId = get("corpId");
    key = "sw_hrm" + key;
    params = params || {};
    params.corpId = corpId;
    if (key) {
        console.log({ 'UT': { key: key, params: params } });
        wpo.custom("count", key);
        dd.biz.util.ut({
            key: key,
            value: params || {}
        });
    }
}