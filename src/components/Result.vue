<template>
  <div class="mdui-row">
    <div class="mdui-col-sm-2"></div>
    <div class="mdui-col-sm-8 video-content">
      <div class="mdui-row">
        <div class="mdui-col-sm-12 mdui-text-left">
          <h3>视频信息</h3>
        </div>
        <div class="mdui-col-sm-4" style="height: 150px;overflow: hidden;">
          <progressive-img
            class="mdui-img-rounded"
            :src="video.videoImg"
            placeholder="http://img.la/mottle/218x135"
          />
        </div>
        <div class="mdui-col-sm-8">
          <div class="video-title ellipsis">
            {{ video.videoTitle }}
          </div>
          <div class="video-up mdui-text-left mdui-typo">
            UP:&nbsp;<a :href="video.videoUpLink" class="video-up-name">{{ video.videoUpName }}</a>
          </div>
          <div class="mdui-col-sm-12 mdui-row-gapless">
            <div class="mdui-col-sm-4 mdui-text-left mdui-typo" v-for="(item,index) in video.videoInfo" :key="index">
              <i class="mdui-icon material-icons my-icons">{{ item.icon }}</i>
              <a href="#" class="video-info">{{ item.videoItem }}</a>
            </div>
          </div>
        </div>
      </div>
      <div class="mdui-row">
        <div class="mdui-col-sm-12 mdui-text-left">
          <h3>视频下载</h3>
        </div>
        <div class="mdui-col-sm-12">
          <div class="mdui-textfield">
            <input class="mdui-textfield-input" type="text" v-model="video.videoDownloadUrl" @focus="focus($event)"/>
          </div>
        </div>
      </div>
      <div class="mdui-row">
        <div class="mdui-col-sm-12 mdui-text-left">
          <h3>视频弹幕</h3>
        </div>
        <div class="mdui-col-sm-12">
          <div class="mdui-textfield">
            <textarea class="mdui-textfield-input" rows="10" v-model="video.videoBarrage" @focus="focus($event)"></textarea>
          </div>
        </div>
      </div>
    </div>
    <div class="mdui-col-sm-2"></div>
  </div>
</template>
<script>
    export default {
      props: ['video'],
      data () {
        return {}
      },
      methods: {
        focus(event) {
          event.currentTarget.select();
        }
      }
    }
</script>
<style scoped>
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap
  }
  .video-content{
    margin-top: 30px;
    padding: 20px;
    border-radius: 5px;
    -moz-box-shadow:1px 1px 5px #333333;
    -webkit-box-shadow:1px 1px 5px #333333;
    box-shadow:1px 1px 5px #333333;
    background: #fff;
  }
  .video-title,.video-up{
    margin-bottom: 15px;
  }
  .video-title{
    text-align: left;
    font-size: 17px;
    font-weight: 700;
  }
  .video-up{
    font-size: 15px;
    font-weight: 700;
  }
  .my-icons{
    font-size: 20px;
  }
  .video-info{
    display: inline-block;
    margin-left: 10px;
    font-weight: 700;
  }
</style>
