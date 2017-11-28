module.exports = {
    replaceHash() {
        let replaceHash;
        if ("replaceState" in history) {
            // Yay, supported!
            replaceHash = function (newhash) {
                if (("" + newhash).charAt(0) !== "#") newhash = "#" + newhash;
                history.replaceState("", "", newhash);
                window.location.reload();
            };
        } else {
            var hash = location.hash;
            replaceHash = function (newhash) {
                if (location.hash !== hash) history.back();
                location.hash = newhash;
                window.location.reload();
            };
        }

        return replaceHash;
    },
    getBrowserInfo() {
        const u = navigator.userAgent;
        const isMobile =
            !!u.match(/AppleWebKit.*Mobile/i) ||
            !!u.match(
                /MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/
            ); //是否为移动终端
        const version = "";
        return {
            //移动终端浏览器版本信息
            trident: u.indexOf("Trident") > -1, //IE内核
            presto: u.indexOf("Presto") > -1, //opera内核
            webKit: u.indexOf("AppleWebKit") > -1, //苹果、谷歌内核
            gecko: u.indexOf("Gecko") > -1 && u.indexOf("KHTML") === -1, //火狐内核
            mobile: isMobile,
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf("Android") > -1 || u.indexOf("Linux") > -1, //android终端或者uc浏览器
            iPhone: u.indexOf("iPhone") > -1 || u.indexOf("Mac") > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf("iPad") > -1, //是否iPad
            webApp: u.indexOf("Safari") === -1, //是否web应该程序，没有头部与底部
            weixin: !!u.match(/MicroMessenger/i), //是否是微信内打开
            isDing: !!u.match(/ding\s?talk/i) && isMobile, //是否是钉钉内打开
            isDing2: false, //test
            isPCDing: !!u.match(/ding\s?talk/i) && !isMobile,
            iOSVersion: version
        };
    }
};
