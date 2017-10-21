# BilibiliVideoDownload
基于bootstrap + jq 的单网页，可以下载bilibili视频

v1.0.0
## 演示
![图片1](https://www.blogwy.com/wp-content/uploads/2017/10/2017102104475594.png)
![图片2](https://www.blogwy.com/wp-content/uploads/2017/10/2017102104475570.png)
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