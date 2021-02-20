export default (value) => {
  const duration = parseInt(value)
  const hours = parseInt(duration / 3600)
  const minus = parseInt((duration - (hours * 3600)) / 60)
  const secends = parseInt(duration - (minus * 60) - (hours * 3600))
  return `${hours > 9 ? hours : '0' + hours}:${minus > 9 ? minus : '0' + minus}:${secends > 9 ? secends : '0' + secends}`
}
