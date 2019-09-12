### BilibiliVideoDownload
----
PC端下载bilibili视频

### 运行

0. [安装ffmpeg](http://ffmpeg.org/download.html) (视频合并转码会用到)

1. git clone https://github.com/blogwy/BilibiliVideoDownload.git

2. cd BilibiliVideoDownload

3. npm i

4. 更换cookie中的SESSDATA值，在utils/getUrl.js`42`和`96`行

5. node app.js

### 版本
----

v2.1.0 `2019-09-12`

添加了弹幕下载，以及弹幕反查用户

v2.0.2 `2019-06-19`

添加了大会员清晰度的支持(前提是必须要有一个大会员的SESSDATA)

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
![图片5](https://wong-1251253615.cos.ap-shanghai.myqcloud.com/BilibiliVideoDownload/excel.png)

### 实现的功能
----
1. 视频下载
2. 视频合并
3. 视频转码
4. 分P检测
5. 分P下载
6. 大会员清晰度下载(前提是必须要有一个大会员的SESSDATA)
7. 弹幕下载
8. 弹幕反查用户

### 注意的问题
----
1. 请定期更换cookie中的SESSDATA值，在utils/getUrl.js`42`和`96`行。跟换方法为：浏览器登陆bilibili账户，在开发者模式 --> application --> cookie中找到SESSDATA值替换即可，一般为一个月的时效。(代码中默认的SESSDATA不能下载大会员清晰度视频,如有想下载大会员清晰度请替换)
2. win用户在命令行CHCP 65001把编码转换成UTF8，不然会出现乱码。
3. 输入的是av号，不要带av

### 用到的接口

- https://api.bilibili.com/x/player/playurl?avid=44743619&cid=78328965&qn=80&otype=json

- https://api.bilibili.com/x/web-interface/view?aid=44743619

- https://api.bilibili.com/x/v1/dm/list.so?oid=78328965
