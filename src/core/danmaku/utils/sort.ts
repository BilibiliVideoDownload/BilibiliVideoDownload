const selfSorter = (it: any) => it

export const ascendingSort = <T>(itemProp: (obj: T) => number = selfSorter) =>
  (a: T, b: T) => itemProp(a) - itemProp(b)
