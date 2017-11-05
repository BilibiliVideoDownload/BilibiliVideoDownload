    
//初始化模态框
    $('#myModal').on('shown.bs.modal', function () {
        $('#myInput').focus();
    });
//关闭分p页    
    $('#singlep').on('shown.bs.modal',function (e) {
        $('#morep').modal('hide')
    })
// 复制链接
    var clipboard = new Clipboard('.btn');

    clipboard.on('success', function(e) {
        console.log(e);
    });

    clipboard.on('error', function(e) {
        console.log(e);
    });
//获取数据
    $('#btn').on("click",function (e) {
        e.preventDefault();
        if ($('#aid').val()){
            $.ajax({
                type : 'get',
                url : 'http://9bl.bakayun.cn/API/GetVideoInfo.php?callback=fn&aid='+ $('#aid').val() +'&p=1&type=jsonp',
                dataType : 'jsonp',
                success : function (da) {
                    var cid = da.Result.VideoInfo.Cid,
                        upname = da.Result.UserInfo.Username,
                        videoimg = da.Result.VideoInfo.PicUrl,
                        videotit = da.Result.VideoInfo.Title,
                        PCount = da.Result.VideoInfo.P_Count,
                        UserId = da.Result.UserInfo.UserId;
                    var realimg = 'https://images.weserv.nl/?url=' + videoimg.replace(/http\:/,'') + '&w=218&h=135';
                    var uplink = `https://space.bilibili.com/${ UserId }/#!/`
                    $('#videoimgs').attr({src : realimg,alt : videotit});
                    $('#videotit').html(videotit);
                    $('#upname').html(upname).attr({href : uplink});
                    if (PCount === '1') {
                        $('#singlep').modal('show')
                        singlep(cid);
                    }else{
                        $('#morep').modal('show')
                        morep()
                    }
                },
                error : function () {
                    alert('获取cid失败');
                }
            });
        }else{
            alert('请输入aid')
        }
    });
    function morep(){
        $('#moreplink').on('click',function (e) {
            e.preventDefault();
            $.ajax({
                type : 'get',
                url : 'http://9bl.bakayun.cn/API/GetVideoInfo.php?callback=fn&aid='+ $('#aid').val() +'&p='+ $('#pcount').val() +'&type=jsonp',
                dataType : 'jsonp',
                success : function (da) {
                    var cid = da.Result.VideoInfo.Cid,
                        videotit = da.Result.VideoInfo.Title;
                    $('#videotit').html('[p' + $('#pcount').val() + ']' + videotit);
                    $.ajax({
                        type : 'get',
                        url : 'http://9bl.bakayun.cn/API/GetVideoUrl.php?callback=fn&cid=' + cid + '&type=jsonp&quality=2',
                        dataType : 'jsonp',
                        success : function (data) {
                            var maindownurl = data.Result.Url.Main,
                                backupdown = data.Result.Url.Backup,
                                videotime = data.Result.Url.TimeLength,
                                videosize = data.Result.Url.FileSize;
                            $('#videosize').html((videosize/1048576).toFixed(2) + 'mb');
                            $('#videotime').html((videotime/60000).toFixed(2) + 'min');
                            $('#copytext').val(maindownurl);
                            if (backupdown.length == 2){
                                $('#copytext1').val(backupdown[0]);
                                $('#copytext2').val(backupdown[1]);
                            }
                            if (backupdown.length == 1){
                                $('#copytext1').val(backupdown[0]);
                                $('#copytext2').val('无');
                            }
                        },
                        error : function () {
                            alert('获取下载链接出错');
                        }
                    });
                },
                error : function () {
                    alert('获取cid失败');
                }
            })
        })
    }
    function singlep(cid){
        $.ajax({
            type : 'get',
            url : 'http://9bl.bakayun.cn/API/GetVideoUrl.php?callback=fn&cid=' + cid + '&type=jsonp&quality=2',
            dataType : 'jsonp',
            success : function (data) {
                var maindownurl = data.Result.Url.Main,
                    backupdown = data.Result.Url.Backup,
                    videotime = data.Result.Url.TimeLength,
                    videosize = data.Result.Url.FileSize;
                $('#videosize').html((videosize/1048576).toFixed(2) + 'mb');
                $('#videotime').html((videotime/60000).toFixed(2) + 'min');
                $('#copytext').val(maindownurl);
                if (backupdown.length == 2){
                    $('#copytext1').val(backupdown[0]);
                    $('#copytext2').val(backupdown[1]);
                }
                if (backupdown.length == 1){
                    $('#copytext1').val(backupdown[0]);
                    $('#copytext2').val('无');
                }
            },
            error : function () {
                alert('获取下载链接出错');
            }
        });
    }