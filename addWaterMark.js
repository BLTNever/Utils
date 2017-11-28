// import alimask from "@ali/water-mask";
import alimask from "./waterMark.js"
import { get, set } from "./db.js";
import fetch from "./fetch.js"

/**
   * 给DOM添加水印
   * @method addWaterMark
   * @param {String} selector
   *
*/

function getWaterMarkText() {
  return new Promise(resolve => {
    let waterMarkText = get(`${get('corpId')}::waterMarkText`);
    if (waterMarkText) {
      resolve(waterMarkText);
    } else {
      fetch("/hrmregister/mobile/common/watermark/query", {
        method: "GET",
        meta: {
          showLoading: false,
          dipId: 69234
        }
      }).then(res=>{
        waterMarkText = res.result;
        set(`${get('corpId')}::waterMarkText`, waterMarkText);
        resolve(waterMarkText);
      })
    }
  })
}

export default function addWaterMark(selector = '.waterMark') {
  try {
    getWaterMarkText().then(waterMarkText => {
      const html_font_size = +document.getElementsByTagName('html')[0].style.fontSize.replace('px', '');
      if (!waterMarkText) return;
      const mask = alimask(waterMarkText, {
        width: 400,
        height: 200,
        font: `26px Arial`
      });

      const elements = Array.prototype.slice.call(document.querySelectorAll(selector), 0);
      elements.forEach((el) => {
        el.style.backgroundImage = `url(${mask})`;
        el.style.backgroundSize = `${html_font_size * 4}px`;
      })
    })
  } catch (error) {
    window._rlog("_waterMask_error");
  }
}
