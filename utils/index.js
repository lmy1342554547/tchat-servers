/*
 * @Author: your name
 * @Date: 2020-02-15 20:10:56
 * @LastEditTime: 2020-02-27 14:14:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-server\utils\index.js
 */
module.exports = {
  // 获取浏览器类型
  getBrowserInfo(data) {
    let agent = data.toLowerCase();
    let browser = "";
    if (/(qqbrowser|ubrowser)\D+(\d[\d.]*)/.test(agent)) {//qq浏览器,UC浏览器
      browser = RegExp.$1;
    } else if (/se[\s\.a-zA-Z\d]+metasr/.test(agent)) {
      browser = 'sougou';
    } else if (/(msie|firefox|opera|chrome|netscape)\D+(\d[\d.]*)/.test(agent)) {
      browser = RegExp.$1;
    } else if (/version\D+(\d[\d.]*).*safari/.test(agent)) { // safari  
      browser = 'safari';
    } else if (/edge\D+(\d[\d.]*).*edge/.test(agent)) { // safari  
      browser = 'edge';
    }

    return browser.slice(0, 1).toUpperCase() + browser.slice(1);;
  },
  // 获取操作系统类型
  getDeviceInfo(data) {
    let agent = data.toLowerCase();
    if (/windows/.test(agent)) {
      return 'Windows';
    } else if (/iphone|ipod/.test(agent) && /mobile/.test(agent)) {
      return 'Iphone';
    } else if (/ipad/.test(agent) && /mobile/.test(agent)) {
      return 'Ipad';
    } else if (/android/.test(agent) && /mobile/.test(agent)) {
      return 'Android';
    } else if (/linux/.test(agent)) {
      return 'Linux';
    } else if (/mac/.test(agent)) {
      return 'Mac';
    } else {
      return 'Other';
    }
  },
  // 验证消息类型
  checkMessageType(data) {
    let arr = ['text', 'image', 'share', 'voice', 'system'];
    let param = new RegExp(',' + data + ',');
    return (param.test(',' + arr.join() + ','));
  }
} 