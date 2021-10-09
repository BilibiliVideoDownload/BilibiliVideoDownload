export default path => {
  const pattern = /[\/]/g
  if (process.platform === 'win32') {
    return path.replace(pattern, '\\')
  } else {
    return path
  }
}
