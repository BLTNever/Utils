const defaultFormat = "yyyy-MM-dd";

// 简陋版本的moment， 预计有很多bug
// 参数校验非常简陋
function _moment(time, format) {
    this._format = format || defaultFormat;
    this.time = new Date(time);
    return this;
}

function moment(time, format) {
    return new _moment(time, format);
}

_moment.prototype.add = function (number, period) {
    const periods = ["day", "month", "year"];
    const dat = new Date(this.time);
    if (periods.indexOf(period) === -1) {
        console.error("不支持的period"); // eslint-disable-line
        return this.time;
    }
    if (period === "day") {
        return moment(dat.setDate(dat.getDate() + number), this._format);
    }

    if (period === "month") {
        return moment(dat.setMonth(dat.getMonth() + number), this._format);
    }
    return moment(dat.setFullYear(dat.getFullYear() + number), this._format);
};

_moment.prototype.format = function (format) {
    return new Date(this.time).format(format || defaultFormat);
};
_moment.prototype.toString = function () {
    return new Date(this.time).format(this._format || defaultFormat);
};

export default moment;
