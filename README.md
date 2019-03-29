### BilibiliVideoDownload
----
PC端下载bilibili视频

### 运行

0. [安装ffmpeg](http://ffmpeg.org/download.html) (视频合并转码会用到)

1. git clone https://github.com/blogwy/BilibiliVideoDownload.git

2. cd BilibiliVideoDownload

3. npm i

4. node app.js

### 版本
----

v2.0.1 `2019-03-29`

添加了分P检测，分P下载功能

v2.0.0 `2019-03-24`

Node.js重构，以前的在vuejs分支

### 演示
----
![图片1](https://wong-1251253615.cos.ap-shanghai.myqcloud.com/BilibiliVideoDownload/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-03-24%20%E4%B8%8B%E5%8D%886.41.30.png)
![图片2](https://wong-1251253615.cos.ap-shanghai.myqcloud.com/BilibiliVideoDownload/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-03-24%20%E4%B8%8B%E5%8D%886.41.52.png)
![图片3](https://wong-1251253615.cos.ap-shanghai.myqcloud.com/BilibiliVideoDownload/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-03-24%20%E4%B8%8B%E5%8D%886.45.02.png)
![图片4](https://wong-1251253615.cos.ap-shanghai.myqcloud.com/BilibiliVideoDownload/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-03-24%20%E4%B8%8B%E5%8D%887.38.55.png)

### 实现的功能
----
1. 视频下载
2. 视频合并
3. 视频转码
4. 分P检测
5. 分P下载

### 注意的问题
----
1. 大会员视频不可以下载
2. 请定期跟换cookie中的SESSDATA值，在utils/getUrl.js`42`行。跟换方法为：浏览器登陆bilibili账户，在开发者模式 --> application --> cookie中找到SESSDATA值替换即可，一般为一个月的实效。
3. 在以后的版本会加上模拟登陆功能。

### 用到的接口

- https://api.bilibili.com/x/player/playurl?avid=44743619&cid=78328965&qn=80&otype=json

- https://api.bilibili.com/x/web-interface/view?aid=44743619
