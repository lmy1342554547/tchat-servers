/*
 * @Author: app js
 * @Date: 2019-10-25 14:57:44
 * @LastEditTime: 2020-02-29 10:57:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-server\app.js
 */
const express = require('express');
const socket = require('socket.io')
const http = require('http');
const logger = require('morgan');
const socketHandle = require('./socket/index')
const mongose = require('mongoose')
const dburl = 'mongodb://127.0.0.1:27017/Tchat'
const apiRouter = require('./routes/index');

const mongoseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}
mongose.connect(dburl, mongoseOptions, (err) => {
  if (err) throw err
  console.log('数据库连接成功')
})

const app = express();
const server = http.createServer(app);
socketHandle(socket(server))
server.listen(3000);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.all("*", function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "content-type");
  //跨域允许的请求方式 
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == 'options')
    res.send(200);  //让options尝试请求快速结束
  else
    next();
})

app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.json({ success: false, data: 404, message: '接口错误!' });
});

module.exports = app;
