/**
 * 目前可以公开的情报：
 * 被monitor包装的方法会在执行前后打印出入参和返回值。
 * config中可以配置的字段有：
 * duartion:bool 是否打印函数执行的时间
 * store: bool 是否在执行前后打印redux store 的信息
 * @param {Object} config 
 */
export default function monitor(config) {
    let duration = false,
        store = false;
    if (config && config.duration) {
        duration = true;
    }
    if (config && config.store) {
        store = true;
    }
    return (target, name, descriptor) => {
        // obtain the original function
        const fn = descriptor.value;

        // create a new function that sandwiches
        // the call to our original function between
        // two logging statements
        const newFn = function (...args) {
            console.log(`starting ${name},param:`, args);
            if (duration) {
                console.time("time:");
            }
            if (store) {
                console.info("previous state:", window.store.getState());
            }
            const ret = fn.apply(this, args);
            console.log(`ending ${name},result:`, ret);
            if (duration) {
                console.timeEnd("time:");
            }
            if (store) {
                console.info("next state:", window.store.getState());
            }
        };

        // we then overwrite the origin descriptor value
        // and return the new descriptor
        descriptor.value = newFn;
        return descriptor;
    };
}
