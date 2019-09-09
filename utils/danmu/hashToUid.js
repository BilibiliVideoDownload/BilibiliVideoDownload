const Crc32Engine = require('./crc32');
const crcEngine = new Crc32Engine();

const hashToUid = hash => {
  let extracted = /^b(\d+)$/.exec(hash);
  let uids = [];
  if (extracted && extracted[1]) {
    uids = [extracted[1]];
  } else {
    uids = crcEngine.crack(hash);
  }
  return uids[uids.length-1];
};

module.exports = {
  hashToUid
};