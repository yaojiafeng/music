var express = require('express');
var router = express.Router();
var path = require("path");//处理路径的模块
var media = path.join(__dirname, "../public/media");

/* GET home page. */
router.get('/', function (req, res, next) {
  var fs = require("fs");//处理文件
  /*读取文件里面的东西 */
  fs.readdir(media, function (err, names) {
    if (err) {
      console.log(err)
    } else {
      res.render('index', { title: 'DaJiao Music', music: names });
    }

  })


});

module.exports = router;
