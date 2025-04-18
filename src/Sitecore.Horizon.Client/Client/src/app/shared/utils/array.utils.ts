/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export function withoutItem<T>(list: readonly T[], item: T): T[] {
  const newArray = list.slice();
  const index = list.indexOf(item);

  if (index === -1) {
    return newArray;
  }

  newArray.splice(index, 1);
  return newArray;
}

export function withItemAt<T>(list: readonly T[], item: T, index: number): T[] {
  const newArray = list.slice();
  newArray.splice(index, 0, item);
  return newArray;
}

export function getGroupedListByKey<T>(list: readonly T[], key: keyof T): T[][] {
  return list.reduce((result: T[][], item: T) => {
    const categoryIndex = result.findIndex((category: T[]) => category[0][key] === item[key]);

    if (categoryIndex !== -1) {
      result[categoryIndex].push(item);
    } else {
      result.push([item]);
    }

    return result;
  }, []);
}

export function arraysContentIsEqual<T>(a1: T[], a2: T[], compareKey: keyof T): boolean {
  if (a1.length !== a2.length) {
    return false;
  }

  const sortedA1 = a1.slice().sort((x, y) => (x[compareKey] < y[compareKey] ? -1 : 1));
  const sortedA2 = a2.slice().sort((x, y) => (x[compareKey] < y[compareKey] ? -1 : 1));

  for (let i = 0; i < sortedA1.length; i++) {
    if (sortedA1[i][compareKey] !== sortedA2[i][compareKey]) {
      return false;
    }
  }
  return true;
}
