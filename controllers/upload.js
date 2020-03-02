/*
 * @Author: 上传文件相关操作
 * @Date: 2020-02-29 11:10:12
 * @LastEditTime: 2020-03-02 17:05:16
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\controllers\user.js
 */
const qiniu = require("qiniu");
const { qiniu_ak, qiniu_sK, qiniu_bucket ,qiniu_cb_url} = require("../config/dbConfig");

module.exports = {
  // 创建七牛上传token  
  createQiuniuToken() {
    const mac = new qiniu.auth.digest.Mac(qiniu_ak, qiniu_sK);
    const options = {
      scope: qiniu_bucket,
      // callbackUrl: qiniu_cb_url,
      // callbackBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","type":"$(x:type)","id":"$(x:id)"}',
      // callbackBodyType: 'application/json'
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);
    return uploadToken;
  },
  // 判断是否是七牛Callback
  isQiniuCallback(callbackAuth) {
    const mac = new qiniu.auth.digest.Mac(qiniu_ak, qiniu_sK);
    const auth = qiniu.util.generateAccessToken(mac, qiniu_cb_url);
    return auth == callbackAuth;
  }
};