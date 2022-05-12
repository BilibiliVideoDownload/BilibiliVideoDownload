const qualityMap = {
  127: '8K超高清',
  126: '杜比视界',
  125: 'HDR真彩',
  120: '4K超清',
  116: '1080P60帧',
  112: '1080P+高码率',
  80: '1080P',
  74: '720P60帧',
  64: '720P',
  32: '480P清晰',
  16: '320P流畅'
}

const resolution = {
  127: {
    width: 7680,
    height: 4320
  },
  126: {
    width: 4096,
    height: 2160
  },
  125: {
    width: 4096,
    height: 2160
  },
  120: {
    width: 4096,
    height: 2160
  },
  116: {
    width: 1920,
    height: 1080
  },
  112: {
    width: 1920,
    height: 1080
  },
  80: {
    width: 1920,
    height: 1080
  },
  74: {
    width: 1280,
    height: 720
  },
  64: {
    width: 1280,
    height: 720
  },
  32: {
    width: 855,
    height: 480
  },
  16: {
    width: 640,
    height: 360
  }
}

const userQuality = {
  0: [16, 32],
  1: [16, 32, 64, 80],
  2: [16, 32, 64, 74, 80, 112, 116, 120, 125, 126, 127]
}

export {
  qualityMap,
  userQuality,
  resolution
}
