import store from "store";
import { getUrlSearchParam } from "./urlParams";
//缓存根据用户id和corpId进行
/**
 * 暂时先只有corpId
 */
const getUserId = () => new Promise((resolve, reject) => {
    const corpId = getUrlSearchParam("corpId");
    // dd.biz.user.get({

    //     onSuccess: function (result) {
    //         resolve(result.corpId + "-" + result.emplId);
    //     },
    //     onFail: function (error) {
    //         reject(error);
    //     }
    // })
    resolve(corpId)
})

const getUserIdAsync = async (key, result) => {
    const userId = await getUserId();
    const value = {
        //缓存的数据
        _data: result,
        //缓存唯一的key分别是key 用户id 以及更新时间
        _identityKey: key + "_" + userId + "_" + new Date().getTime(),
        //缓存删除时间 5天
        _deleteAt: new Date().getTime() + (24 * 60 * 60 * 100 * 5),
        //缓存失效时间 2天
        _expireAt: new Date().getTime() + (24 * 60 * 60 * 100 * 2)
    }
    store.set(key, value);
}

/** 
 * 存储缓存
 * @param {*} key  缓存的key 
 * @param {*} result 缓存的数据
 */
const setCacheData = (key, result) => {
    // const resultDeep = {};
    // for (const key in result) {
    //     resultDeep[key] = result[key];
    // }
    getUserIdAsync(key, result);
}


/** 
 * 获取缓存
 * @param {*} key 缓存的key
 * @param {*} userId 用户ID
 */
const getCacheData = async (key) => {
    let value = store.get(key);
    try {
        const userId = await getUserId();
        if (value && value._identityKey && value._identityKey.split("_") && value._identityKey.split("_")[1] !== userId ||//用户变更
            value && value._deleteAt && value._deleteAt > 0 && value._deleteAt < new Date().getTime()//缓存过期
        ) {
            window.localStorage.removeItem(key);
            value = null;
        }
    } catch (error) {
        window.localStorage.removeItem(key);
        value = null;
    }

    return new Promise((resolve, reject) => {
        resolve(value ? value._data : value);
    })
    //return value ? value._data : value;

}

export { setCacheData, getCacheData }