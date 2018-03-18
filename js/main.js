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
    $('#btn').on("click",function () {
        // e.preventDefault();
        console.log($('#aid').val());
        if ($('#aid').val()){
            $.ajax({
                type: 'get',
                url: 'http://api.bilibili.com//playurl?aid='+ $('#aid').val() + '&page=2&platform=html5&quality=1&vtype=mp4&type=jsonp&callback=fn&token=d3bd9275f0f2cda07f2406740db06c5d',
                dataType: 'jsonp',
                success: function (da) {
                    console.log(32,da);
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
        $('#moreplink').on('click',function () {
            // e.preventDefault();
            $.ajax({
                type : 'get',
                url : 'http://api.bilibili.com/view?type=jsonp&appkey=8e9fc618fbd41e28&id='+ $('#aid').val() +'&page=1&callback=fn',
                dataType : 'jsonp',
                success : function (da) {
                    var UserId = da.mid,
                        videotit = da.title,
                        upname = da.author,
                        videoimg = da.pic;
                    var realimg = 'https://images.weserv.nl/?url=' + videoimg.replace(/https\:/,'') + '&w=218&h=135';
                    var uplink = 'https://space.bilibili.com/'+ UserId +'/#!/';
                    $('#videotit').html('[p' + $('#pcount').val() + ']' + videotit);
                    $('#videoimgs').attr({src : realimg,alt : videotit});
                    $('#upname').html(upname).attr({href : uplink});
                    $.ajax({
                        type : 'get',
                        url : 'http://api.bilibili.com//playurl?aid='+ $('#aid').val() +'&page='+ $('#pcount').val() +'&platform=html5&quality=1&vtype=mp4&type=jsonp&callback=fn&token=d3bd9275f0f2cda07f2406740db06c5d',
                        dataType : 'jsonp',
                        success : function (res) {
                            console.log(res);
                            var maindownurl = res.durl[0].url,
                                videotime = res.durl[0].length,
                                format = res.format
                                videosize = res.durl[0].size;
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
            url : 'http://api.bilibili.com/view?type=jsonp&appkey=8e9fc618fbd41e28&id='+ $('#aid').val() +'&page=1&callback=fn',
            dataType : 'jsonp',
            success : function (da) {
                var UserId = da.mid,
                    videotit = da.title,
                    upname = da.author,
                    videoimg = da.pic;
                var realimg = 'https://images.weserv.nl/?url=' + videoimg.replace(/https\:/,'') + '&w=218&h=135';
                console.log(realimg);
                var uplink = 'https://space.bilibili.com/'+ UserId +'/#!/';
                $('#videotit').html('[p' + $('#pcount').val() + ']' + videotit);
                $('#videoimgs').attr({src : realimg,alt : videotit});
                $('#upname').html(upname).attr({href : uplink});
                $.ajax({
                    type : 'get',
                    url : 'http://api.bilibili.com//playurl?aid='+ $('#aid').val() +'&page=1&platform=html5&quality=1&vtype=mp4&type=jsonp&callback=fn&token=d3bd9275f0f2cda07f2406740db06c5d',
                    dataType : 'jsonp',
                    success : function (data) {
                        console.log(116,data);
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