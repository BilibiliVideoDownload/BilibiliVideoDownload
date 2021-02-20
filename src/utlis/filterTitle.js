export default str => {
  const pattern = /[「」`~!@#$^&*()=|{}':;',\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/g
  return str.replace(pattern, '')
}
