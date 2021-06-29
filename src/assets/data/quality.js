const quality = {
  120: '4K',
  116: '1080P60帧',
  112: '1080P高码率',
  80: '1080P',
  64: '720P60帧',
  32: '480P',
  16: '320P'
}

const userQuality = {
  0: [16, 32],
  1: [16, 32, 80],
  2: [16, 32, 64, 80, 112, 116, 120]
}

export {
  quality,
  userQuality
}
