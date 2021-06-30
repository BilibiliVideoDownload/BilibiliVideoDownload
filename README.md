<div align="center">
  <img src="./build/icons/256x256.png" alt="" width="128">
  <h1>BilibiliVideoDownload</h1>
  <blockquote>PC端下载bilibili视频</blockquote>
</div>

## 注意

* 软件不支持付费视频和地区限制视频，可能会报错

* SESSDATA有过期时间，好像是半年

* 由于下载的音视频是分离的，项目使用ffmpeg合成导致安装包过大(ffmpeg大约70+MB)

* 软件目前为止对于同时下载视频数没有限制，建议不要超过5个，太多我没有测试过可能会卡死。

## 安装

到[releases](https://github.com/blogwy/BilibiliVideoDownload/releases)页面,下载对应平台安装包即可.下载视频时候会提示登录，登录后只会获取你的SESSDATA来用做下载，账号是普通账号最大下载1080P视频，大会员可以下载4K视频，不登录最大下载480P视频

## 演示

![1](./screenshots/1.png)
![2](./screenshots/2.png)
![3](./screenshots/3.png)
![4](./screenshots/4.png)


## 功能

* [x] 下载普通视频
* [x] 下载番剧视频
* [x] 下载多P视频
* [x] 下载电影(额外付费除外)
* [x] 下载封面
* [x] 下载字幕
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

v3.1.0 `2021-06-29`

1. 新增扫码登录获取cookie，不需要手动设置
2. 新增下载字幕功能

v3.0.6 `2021-05-22`

添加多P视频批量下载，同时下载视频数建议不要超过5个，太多我没有测试过可能会卡死。

v3.0.5 `2021-05-15`

添加检查更新

v3.0.4 `2021-04-29`

修复无法下载的bug

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

## 感谢

特别感谢JetBrains为开源项目提供的免费许可证，申请地址：[https://www.jetbrains.com/zh-cn/community/opensource/#support](https://www.jetbrains.com/zh-cn/community/opensource/#support)

