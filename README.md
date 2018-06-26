### BilibiliVideoDownload
----
PC端下载bilibili视频(Material Design风格)
### 版本
----

v1.4.0 `2018-06-26`

添加EP下载功能，使用nginx做反向代理

**注：由于技术有限,目前av,ep下载的视频都是320p**

```
location /bangumi/ {
	proxy_pass https://www.bilibili.com;     
}
```

v1.3.1 `2018-06-16`

修复弹幕获取失败，使用nginx做反向代理

```
location /comment/ {
	rewrite  ^/comment/(.*)$ /$1 break;
	proxy_pass https://comment.bilibili.com;     
}
```

v1.3.0 `2018-05-14`

用Vue.js重构

v1.2.1 `2017-12-21`

获取视频弹幕消息，去除视频背景

v1.2.0 `2017-12-3`

更换全新MDUI框架，添加视频背景，优化js代码

MDUI 是一套用于开发 Material Design 网页的前端框架

v1.1.3 `2017-12-1`

修复获取视频信息失败，由于9bl.bakayun.cn网站维护导致api失效，现已使用bilibili官方api接口，更稳定

v1.1.2 `2017-11-11`

修复下载地址错误，取消备用下载

v1.1.1 `2017-11-10`

修复视频格式显示错误

v1.1.0 `2017-11-05`

实现分P下载

注：由于api请求限制，目前只可以手动输入分p数获取分p下载链接。分p数为阿拉伯数字

v1.0.1 `2017-10-24`

优化了视频封面的获取方法

v1.0.0 `2017-10-21`

实现了基本功能
### 演示
----
![图片1](https://raw.githubusercontent.com/blogwy/BilibiliVideoDownload/master/img/1.png)
![图片2](https://raw.githubusercontent.com/blogwy/BilibiliVideoDownload/master/img/2.png)
### 演示地址
----
[点击查看](http://www.bilibibi.cn)
### 实现的功能
----
1. 获取视频直链
2. 获取视频大小和时长
3. 获取视频封面
4. 获取视频标题up主名字
5. 获取分p下载链接
6. 获取视频弹幕信息
### 已知的问题
1. 由于使用了国外（Images.weserv.nl）的图片缓存代理，封面获取较慢。用图片缓存代理是为了突破b站视频封面域名限制，直接调用会出现403
2. edge chrome正常，ff ie有问题
### API接口
- http://api.bilibili.com/view?type=jsonp&appkey=8e9fc618fbd41e28&id=AV号&page=1&callback=fn
- http://api.bilibili.com//playurl?aid=AV号&page=分P号&platform=html5&quality=1&vtype=mp4&type=jsonp&callback=fn&token=d3bd9275f0f2cda07f2406740db06c5d
### 感谢
----
- Images.weserv.nl图片缓存代理

[https://github.com/andrieslouw/imagesweserv](https://github.com/andrieslouw/imagesweserv)