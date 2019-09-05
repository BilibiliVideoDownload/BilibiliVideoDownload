const url = require('url');
const zlib = require('zlib');

function xmlToString(xmlUrl){
  this._onDecode = function(encoding, buffer,resolve){
    //decode callback
    let callback = (err, decoded)=>{
      if(err){
        throw err;
      }
      else{
        let data = decoded.toString();
        resolve(data);
      }
    };

    //begin decode
    switch(encoding)
    {
      case 'deflate':
        zlib.inflateRaw(buffer, callback);
        break;

      case 'gzip':
        zlib.gunzip(buffer, callback);
        break;
    }
  };

  this._onSucDeal = function(res,resolve){
    let arr = [];
    res.on('data', chunk=>{
      arr.push(chunk);
    });

    res.on('end', ()=>{
      let buffer = Buffer.concat(arr);

      let encoding = res.headers['content-encoding'];
      if(!encoding || encoding == 'utf-8'){
        let data = buffer.toString();
        resolve(data);
      }
      else{
        this._onDecode(encoding, buffer,resolve);
      }

    });
  };

  return new Promise((resolve, reject) => {

    let urlObj = url.parse(xmlUrl);
    let http = '';
    if(urlObj.protocol == 'http:')
    {
      http = require('http');
    }
    else
    {
      http = require('https');
    }
    //req and crawl
    let req = http.request({
      'hostname':urlObj.hostname,
      'path':urlObj.path,
    },res=>{
      switch(res.statusCode)
      {
        case 200: //OK
          this._onSucDeal(res,resolve);
          break;
        case 301:
        case 302: //重定向
        default:
          reject("http: 解析url时发生未知的情况！！");
          console.log("http: 解析url时发生未知的情况！！")
      }
    });

    req.end();
    req.on('error', ()=>{
      reject("http: 404 not found");
      console.log('http: 404 not found');
    });
  });
}

module.exports = {
  xmlToString
};