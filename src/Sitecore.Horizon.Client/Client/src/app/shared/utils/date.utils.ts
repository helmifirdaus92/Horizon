/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export function generateDates(initial: Date, final: Date) {
  const result = [initial];
  const date = new Date(initial.getTime());
  while (date < final) {
    result.push(new Date(date.setDate(date.getDate() + 1)));
  }
  return result;
}

/**
 * Returns a new date where the year and month corresponds to the given date with days added.
 * It ignores the time.
 * It doesn't change the given date.
 * @param date a given date
 * @param days integer months to add (or substract if negative)
 */
export function withAddedDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function monthsBetween(initial: Date, final: Date) {
  return (final.getFullYear() - initial.getFullYear()) * 12 + final.getMonth() - initial.getMonth();
}

/**
 * Find the date positioned `cellCount` cells apart from `initialDate`, assuming divider cells for each month.
 * It also returns a boolean indicating whether the final date corresponds to a month indicator
 * @param initialDate the date to start counting from
 * @param cellCount the number of cells to count
 */
export function calculateFinalDate(initialDate: Date, cellCount: number): [Date, boolean] {
  const date = new Date(initialDate.getTime());

  while (cellCount > 0) {
    const dayNumber = date.getDate();
    // The first day of a month is always preceded by a month indicator: 2 cells.
    if (dayNumber === 1) {
      cellCount -= 2;
    } else {
      cellCount--;
    }
    date.setDate(dayNumber + 1);
  }

  // If cellCount could not be evenly distributed then adjust the date
  date.setDate(date.getDate() + cellCount);

  const isFinalCellDivider = date.getDate() === 1 && cellCount === 0;
  return [date, isFinalCellDivider];
}

export function isSameDate(date1?: Date, date2?: Date): boolean {
  return (
    !!date1 &&
    !!date2 &&
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
