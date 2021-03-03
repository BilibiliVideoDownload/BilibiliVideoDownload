<div align="center">
  <img src="./build/icons/256x256.png" alt="" width="128">
  <h1>BilibiliVideoDownload</h1>
  <blockquote>PC端下载bilibili视频</blockquote>
</div>

## 注意

* 软件不支持付费视频和地区限制视频，可能会报错

* SESSDATA有过期时间，好像是半年

* 由于下载的音视频是分离的，项目使用ffmpeg合成导致安装包过大(ffmpeg大约70+MB)，以后会优化的

## 安装

到[releases](https://github.com/blogwy/BilibiliVideoDownload/releases)页面或者[百度网盘](https://pan.baidu.com/s/1O7ZfxFKH7Rm9zhB5JC4Prg)密码: rf8n,下载对应平台安装包即可.打开软件后需要设置**SESSDATA**才可以下载视频，**SESSDATA**是B站已登录用户的**cookies**里面的一个字段，而且如果你的账号是非大会员，你拿到的**SESSDATA**也只可以下载非大会员视频。如果你是大会员则可以下载大会员视频。为了支持正版，大家购买大会员。获取**SESSDATA**教程大家可以到软件相关设置处查看，或者直接[点击这里](https://blog.wangyu.link/2020/01/25/2020-01-25/)

## 演示

![1](./screenshots/1.png)
![2](./screenshots/2.png)
![3](./screenshots/3.png)
![4](./screenshots/4.png)


## 功能

* [x] 下载普通视频
* [x] 下载番剧视频
* [x] 下载电影(额外付费除外)
* [x] 下载封面
* [x] 下载进度
* [x] 基本视频信息
* [x] 删除下载记录
* [ ] 暂停/恢复下载

## 运行

```bash
git clone https://github.com/blogwy/BilibiliVideoDownload.git

cd BilibiliVideoDownload

yarn

yarn electron:serve

yarn electron:build
```
## 版本

v3.0.1 `2021-03-03`

增加错误提示

v3.0.0 `2021-02-21`

全新GUI版本上线

v2.1.0 `2019-09-12`

添加了弹幕下载，以及弹幕反查用户

v2.0.2 `2019-06-19`

添加了大会员清晰度的支持(前提是必须要有一个大会员的SESSDATA)

v2.0.1 `2019-03-29`

添加了分P检测，分P下载功能

v2.0.0 `2019-03-24`

Node.js重构，以前的在vuejs分支