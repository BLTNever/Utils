import {
    type
} from "./common";

const ramda = {
    isNil(payload) {
        return type(payload) === "undefined" || type(payload) === "null";
    },
    isEmpty(payload) {
        if (payload === "") return true;
        if (type(payload) === "array" && payload.length === 0) return true;
        if (type(payload) === "object" && Object.keys(payload).length === 0)
            return true;
        return false;
    },
    find(func, arr) {
        try {
            return arr.find(func);
        } catch (e) {
            console.log(e);
        }
    }
};
export default ramda;
