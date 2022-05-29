/** 兼容v1的API, 仅按精度直接截断数字, 不做四舍五入, 若未达到精度会添加0
 * @param num 数字
 * @param precision 精度
 */
export const fixed = (num: number, precision = 1): string => {
  const factor = 10 ** precision
  let str = (Math.trunc(num * factor) / factor).toString()
  const index = str.indexOf('.')
  if (index > -1) {
    const currentPrecision = str.length - index - 1
    if (currentPrecision < precision) {
      str += '0'.repeat(precision - currentPrecision)
    }
  } else {
    str += `.${'0'.repeat(precision)}`
  }
  return str
}