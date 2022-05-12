export const sleep = (timeountMS: number) => new Promise((resolve) => {
  setTimeout(resolve, timeountMS)
})
