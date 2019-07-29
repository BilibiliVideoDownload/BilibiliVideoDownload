const fluent_ffmpeg = require("fluent-ffmpeg");
const progressBar  = require('./progress-bar');
let mergedVideo = fluent_ffmpeg();
const pb = new progressBar('转码&合成进度', 50);

function cancatVideos(name,format,allTime,len){
  let videoNames = getVideoNames(name,format,len).videoArr;
  videoNames.forEach(function(videoName){
    mergedVideo = mergedVideo.addInput(videoName);
  });

  mergedVideo.mergeToFile(getVideoNames(name,format,len).videoAll, '../tmp/')
  .on('error', function(err) {
    console.log('Error ' + err.message);
  })
  .on('progress', function(progress) {
    let timeMark = timeToMs(progress.timemark);
    pb.render({
      completed: timeMark ? timeMark : 0,
      total: allTime
    });
  })
  .on('end', function() {
    console.log('\nFinished!');
  });
}

function getVideoNames(name,format,len){
  let newName = getVideoName(name),videoArr = [];
  for (let index = 0; index < len; index++) {
    videoArr.push('./video/' + newName + index + '.' + format);
  }
  return {
    videoArr,
    videoAll: './video/' + newName + 'all.mp4'
  }
}

function getVideoName(str){
  var name = (str.split('.'))[0],
      newName = name.slice(0,name.length-1);
  return newName;
}

function timeToMs(str) {
  let arr1 = str.split(':');
  let arr2 = arr1.map((item,index) => {
    return parseFloat(item);
  });
  return arr2[0]*60*60*1000 + arr2[1]*60*1000 + arr2[2]*1000;
}

module.exports = {
  cancatVideos: cancatVideos
}