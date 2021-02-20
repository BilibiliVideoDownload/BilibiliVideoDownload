export default ({ isNow, rules, timestamp }) => {
  let date
  let str = rules || 'YYYY-MM-DD hh:mm:ss W'
  const _isNow = typeof (isNow) === 'undefined' ? false : isNow
  const _timestamp = timestamp || 0
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  if (_isNow) {
    date = new Date()
  } else {
    if (_timestamp.toString().length === 10) {
      date = new Date(_timestamp * 1000)
    }
    if (_timestamp.toString().length === 13) {
      date = new Date(_timestamp)
    }
  }
  str = str.replace(/yyyy|YYYY/, date.getFullYear())
  str = str.replace(/yy|YY/, (date.getYear() % 100) > 9 ? (date.getYear() % 100).toString() : '0' + (date.getYear() % 100))

  str = str.replace(/MM/, date.getMonth() > 8 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1))
  str = str.replace(/M/g, date.getMonth() + 1)

  str = str.replace(/w|W/g, week[date.getDay()])

  str = str.replace(/dd|DD/, date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate())
  str = str.replace(/d|D/g, date.getDate())

  str = str.replace(/hh|HH/, date.getHours() > 9 ? date.getHours().toString() : '0' + date.getHours())
  str = str.replace(/h|H/g, date.getHours())
  str = str.replace(/mm/, date.getMinutes() > 9 ? date.getMinutes().toString() : '0' + date.getMinutes())
  str = str.replace(/m/g, date.getMinutes())

  str = str.replace(/ss|SS/, date.getSeconds() > 9 ? date.getSeconds().toString() : '0' + date.getSeconds())
  str = str.replace(/s|S/g, date.getSeconds())

  return str
}
