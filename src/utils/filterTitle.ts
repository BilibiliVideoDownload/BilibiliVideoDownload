export const filterTitle = (title: string) => {
  const pattern = /[「」`~!@#$^&*()=|{}':;\',\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/g
  return title.replace(pattern, '')
}
