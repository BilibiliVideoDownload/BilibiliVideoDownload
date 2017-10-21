# BilibiliVideoDownload
基于bootstrap + jq 的单网页，可以下载bilibili视频

v1.0.0
## 演示
![图片1](http://ww1.sinaimg.cn/large/005LOKa8ly1fkpsodp8n1j30q60h5gnx.jpg)
![图片2](http://ww1.sinaimg.cn/large/005LOKa8ly1fkpsodox3ej30gk0d9abj.jpg)
## 演示地址
[点击查看](http://bt720p.com/bilibili/)
## 实现的功能
1. 获取视频直链
2. 获取视频大小和时长
3. 获取视频封面
4. 获取视频标题up主名字
5. 支持移动端
## 已知的问题
1. 由于使用了国外（Images.weserv.nl）的图片缓存代理，封面获取较慢。用图片缓存代理是为了突破b站视频封面域名限制，直接调用会出现403
2. 不支持分p获取下载链接，如有分p直链为p1，我会在下一个版本添加分p下载功能
3. 暂时没发现
## 感谢
1.⑨BiLiBiLi 第三方哔哩哔哩API提供平台

[http://9bl.bakayun.cn/](http://9bl.bakayun.cn/)

2.Images.weserv.nl图片缓存代理

[https://github.com/andrieslouw/imagesweserv](https://github.com/andrieslouw/imagesweserv)

3.bs and jq