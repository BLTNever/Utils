function isPromise(val) {
    return val && typeof val.then === "function";
}

export default function promiseMiddleware({ dispatch }) {
    return next => action =>
        isPromise(action.payload)
            ? action.payload.then(
                res => {
                    if (res.success) {
                        dispatch({ ...action, payload: res.result });
                        return res;
                    }
                    dispatch({
                        ...action,
                        payload: {
                            errorCode: res.errorCode,
                            errorMsg: res.errorMsg
                        },
                        error: true
                    });
                    return Promise.reject(res);
                },
                error => {
                    dispatch({ ...action, payload: error, error: true });
                    return Promise.reject(error);
                }
            )
            : next(action);
}
