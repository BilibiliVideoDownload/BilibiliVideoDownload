import originJsonp from 'jsonp'

export function jsonp (url, data, options) {
  url += (url.includes('?') ? '&' : '?') + params(data)
  return new Promise((resolve, reject) => {
    originJsonp(url, options, (err, res) => {
      if (!err) {
        resolve(res)
      } else {
        reject(err)
      }
    })
  })
}

export function params (data) {
  let url = ''
  for (let key in data) {
    url += `&${key}=${data[key]}`
  }
  return url ? url.slice(1) : ''
}

/*
url:
  https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?json=1&cb=fn&wd=angular
  https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=angular
data:
  以对象的方式传递查询字符串,拼接到url上
  {
    wd: 'angular'
  }
  {
    start: 0,
    count: 20
  }
  &start=0&count=20
  url:
    http://...?&start=0&count=20
    http://...?...&&start=0&count=20
options:
  对象
  配合jsonp原始模块中options的用法
  {
    param: 'callback',
    timeout: 60000,
    prefix: '__jp',
    name: '__jp0'
  }
*/
