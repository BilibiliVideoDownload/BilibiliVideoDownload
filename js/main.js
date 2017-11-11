// 本程序由blogwy维护，程序免费开源所有人均可修改，切勿商业化
// GitHub：https://github.com/blogwy/BilibiliVideoDownload

//初始化模态框
    $('#myModal').on('shown.bs.modal', function () {
        $('#myInput').focus();
    });
//关闭分p页    
    $('#singlep').on('shown.bs.modal',function (e) {
        $('#morep').modal('hide')
    })
// 复制链接,点击下载
    var clipboard = new Clipboard('.btn');

    clipboard.on('success', function(e) {
        console.log(e);
        // window.open(e.text); 打开下载链接    
    });

    clipboard.on('error', function(e) {
        console.log(e);
    });
//获取数据
    $('#btn').on("click",function (e) {
        e.preventDefault();
        if ($('#aid').val()){
            $.ajax({
                type: 'get',
                url: `http://api.bilibili.com//playurl?aid=${ $('#aid').val() }&page=2&platform=html5&quality=1&vtype=mp4&type=jsonp&callback=fn&token=d3bd9275f0f2cda07f2406740db06c5d`,
                dataType: 'jsonp',
                success: function (da) {
                    if (da.durl){
                        console.log('多p');
                        $('#morep').modal('show');
                        morep()

                    }else{
                        console.log('单p');
                        $('#singlep').modal('show');
                        singlep()
                    }
                },
                error : function () {
                    alert('获取失败');
                }
            });
        }else{
            alert('请输入av号')
        }
    });
    function morep(){
        $('#moreplink').on('click',function (e) {
            e.preventDefault();
            $.ajax({
                type : 'get',
                url : `http://9bl.bakayun.cn/API/GetVideoInfo.php?callback=fn&aid=${ $('#aid').val() }&p=1&type=jsonp`,
                dataType : 'jsonp',
                success : function (da) {
                    var UserId = da.Result.UserInfo.UserId,
                        videotit = da.Result.VideoInfo.Title,
                        upname = da.Result.UserInfo.Username,
                        videoimg = da.Result.VideoInfo.PicUrl;
                    var realimg = 'https://images.weserv.nl/?url=' + videoimg.replace(/http\:/,'') + '&w=218&h=135';
                    var uplink = `https://space.bilibili.com/${ UserId }/#!/`;
                    $('#videotit').html('[p' + $('#pcount').val() + ']' + videotit);
                    $('#videoimgs').attr({src : realimg,alt : videotit});
                    $('#upname').html(upname).attr({href : uplink});
                    $.ajax({
                        type : 'get',
                        url : `http://api.bilibili.com//playurl?aid=${ $('#aid').val() }&page=${ $('#pcount').val() }&platform=html5&quality=1&vtype=mp4&type=jsonp&callback=fn&token=d3bd9275f0f2cda07f2406740db06c5d`,
                        dataType : 'jsonp',
                        success : function (data) {
                            var maindownurl = data.durl[0].url,
                                videotime = data.durl[0].length,
                                format = data.format
                                videosize = data.durl[0].size;
                            $('#videosize').html((videosize/1048576).toFixed(2) + 'mb');
                            $('#videotime').html((videotime/60000).toFixed(2) + 'min');
                            $('#copytext').val(maindownurl);
                            $('#videoformat').html(format.toUpperCase());
                        },
                        error : function () {
                            alert('获取下载链接出错');
                        }
                    });
                },
                error : function () {
                    alert('获取视频信息出错');
                }
            })
        })
    }
    function singlep(){
        $.ajax({
            type : 'get',
            url : `http://9bl.bakayun.cn/API/GetVideoInfo.php?callback=fn&aid=${ $('#aid').val() }&p=1&type=jsonp`,
            dataType : 'jsonp',
            success : function (da) {
                var UserId = da.Result.UserInfo.UserId,
                    videotit = da.Result.VideoInfo.Title,
                    upname = da.Result.UserInfo.Username,
                    videoimg = da.Result.VideoInfo.PicUrl;
                var realimg = 'https://images.weserv.nl/?url=' + videoimg.replace(/http\:/,'') + '&w=218&h=135';
                var uplink = `https://space.bilibili.com/${ UserId }/#!/`;
                $('#videotit').html('[p' + $('#pcount').val() + ']' + videotit);
                $('#videoimgs').attr({src : realimg,alt : videotit});
                $('#upname').html(upname).attr({href : uplink});
                $.ajax({
                    type : 'get',
                    url : `http://api.bilibili.com//playurl?aid=${ $('#aid').val() }&page=1&platform=html5&quality=1&vtype=mp4&type=jsonp&callback=fn&token=d3bd9275f0f2cda07f2406740db06c5d`,
                    dataType : 'jsonp',
                    success : function (data) {
                        var maindownurl = data.durl[0].url,
                            videotime = data.durl[0].length,
                            format = data.format
                            videosize = data.durl[0].size;
                        $('#videosize').html((videosize/1048576).toFixed(2) + 'mb');
                        $('#videotime').html((videotime/60000).toFixed(2) + 'min');
                        $('#copytext').val(maindownurl);
                        $('#videoformat').html(format.toUpperCase());
                    },
                    error : function () {
                        alert('获取下载链接出错');
                    }
                });
            },
            error : function () {
                alert('获取视频信息出错');
            }
        })
    }