
// 本程序由blogwy维护，程序免费开源所有人均可修改，切勿商业化
// GitHub：https://github.com/blogwy/BilibiliVideoDownload
// 个人网站欢迎访问 https://www.blogwy.com

// 定义命名空间
var $$ = mdui.JQ;

// 复制下载链接
var clipboard = new Clipboard('#ipt');
clipboard.on('success', function(e) {
    console.log(e.text); 
});

// 初始化dialog
var inst = new mdui.Dialog('#msgDialog');

// 监听首页点击事件
document.getElementById('downloadbtn').addEventListener('click', function (e) {
  e.preventDefault();
  main();
});

function main() {
  if ($$('#avnum').val()){
    $$.ajax({
      method: 'GET',
      url: `http://api.bilibili.com//playurl?aid=${ $$('#avnum').val() }&page=2&platform=html5&quality=1&vtype=mp4&type=jsonp&callback=fn&token=d3bd9275f0f2cda07f2406740db06c5d`,
      dataType: 'jsonp',
      success: function (da) {
        if (da.durl){
          console.log('多p');
          mdui.dialog({
            title: '这是一个分P视频，请输入分P号',
            content: '<div class="mdui-textfield"><input class="mdui-textfield-input" id="pnum" type="text"/></div>',
            buttons: [
              {
                text: '取消'
              },
              {
                text: '确认',
                onClick: function(){
                  var value = $$('#pnum').val();
                  inst.open();
                  morep(value);
                }
              }
            ]
          });
        }else{
          console.log('单p');
          inst.open();
          singlep();
        }
      },
      error : function () {
        mdui.alert('获取失败');
      }
    });
  }else{
    mdui.alert('请输入av号')
  }
}
function morep(value) {
  $$.ajax({
    method : 'GET',
    url : `http://api.bilibili.com/view?type=jsonp&appkey=8e9fc618fbd41e28&id=${ $$('#avnum').val() }&page=1&callback=fn`,
    dataType : 'jsonp',
    success : function (da) {
      var UserId = da.mid,
          videotit = da.title,
          upname = da.author,
          videoimg = da.pic;
      var realimg = 'https://images.weserv.nl/?url=' + videoimg.replace(/https\:/,'') + '&w=218&h=135';
      var uplink = `https://space.bilibili.com/${ UserId }/#!/`;
      $$('#videotit').html('[p' + value + ']' + videotit);
      $$('#videoimgs').attr({src : realimg,alt : videotit});
      $$('#upname').html(upname).attr({href : uplink});
      $$.ajax({
        type : 'get',
        url : `http://api.bilibili.com//playurl?aid=${ $$('#avnum').val() }&page=${ value }&platform=html5&quality=1&vtype=mp4&type=jsonp&callback=fn&token=d3bd9275f0f2cda07f2406740db06c5d`,
        dataType : 'jsonp',
        success : function (data) {
          var maindownurl = data.durl[0].url,
              videotime = data.durl[0].length,
              format = data.format,
              videosize = data.durl[0].size;
          $$('#videosize').html((videosize/1048576).toFixed(2) + 'mb');
          $$('#videotime').html((videotime/60000).toFixed(2) + 'min');
          $$('#ipt').val(maindownurl);
          $$('#videoformat').html(format.toUpperCase());
        },
        error : function () {
          mdui.alert('获取下载链接出错');
        }
      });
    },
    error : function () {
      mdui.alert('获取视频信息出错');
    }
  })
}

function singlep() {
  $$.ajax({
    method : 'GET',
    url : `http://api.bilibili.com/view?type=jsonp&appkey=8e9fc618fbd41e28&id=${ $$('#avnum').val() }&page=1&callback=fn`,
    dataType : 'jsonp',
    success : function (da) {
      var UserId = da.mid,
          videotit = da.title,
          upname = da.author,
          videoimg = da.pic;
      var realimg = 'https://images.weserv.nl/?url=' + videoimg.replace(/https\:/,'') + '&w=218&h=135';
      var uplink = `https://space.bilibili.com/${ UserId }/#!/`;
      $$('#videotit').html(videotit);
      $$('#videoimgs').attr({src : realimg,alt : videotit});
      $$('#upname').html(upname).attr({href : uplink});
      $$.ajax({
        type : 'get',
        url : `http://api.bilibili.com//playurl?aid=${ $$('#avnum').val() }&page=1&platform=html5&quality=1&vtype=mp4&type=jsonp&callback=fn&token=d3bd9275f0f2cda07f2406740db06c5d`,
        dataType : 'jsonp',
        success : function (data) {
          var maindownurl = data.durl[0].url,
              videotime = data.durl[0].length,
              format = data.format
              videosize = data.durl[0].size;
          $$('#videosize').html((videosize/1048576).toFixed(2) + 'mb');
          $$('#videotime').html((videotime/60000).toFixed(2) + 'min');
          $$('#ipt').val(maindownurl);
          $$('#videoformat').html(format.toUpperCase());
        },
        error : function () {
          mdui.alert('获取下载链接出错');
        }
      });
    },
    error : function () {
      mdui.alert('获取视频信息出错');
    }
  })
}
