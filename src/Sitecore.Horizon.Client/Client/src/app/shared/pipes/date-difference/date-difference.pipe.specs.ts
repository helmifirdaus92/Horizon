/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DateDifferencePipe } from './date-difference.pipe';

describe(DateDifferencePipe.name, () => {
  let sut: DateDifferencePipe;

  beforeEach(() => {
    sut = new DateDifferencePipe();
  });

  it('should return 0 if startDate is undefined', () => {
    expect(sut.transform(undefined, new Date())).toBe(0);
  });

  it('should return 0 if endDate is undefined', () => {
    expect(sut.transform(new Date(), undefined)).toBe(0);
  });

  it('should return the correct difference in days for Date objects', () => {
    const startDate = new Date('2023-10-01');
    const endDate = new Date('2023-10-10');
    expect(sut.transform(startDate, endDate)).toBe(9);
  });

  it('should return the correct difference in days for date strings', () => {
    const startDate = '2023-10-01';
    const endDate = '2023-10-10';
    expect(sut.transform(startDate, endDate)).toBe(9);
  });

  it('should return the correct difference in days for timestamps', () => {
    const startDate = new Date('2023-10-01').getTime();
    const endDate = new Date('2023-10-10').getTime();
    expect(sut.transform(startDate, endDate)).toBe(9);
  });

  it('should return a negative difference if startDate is after endDate', () => {
    const startDate = new Date('2023-10-10');
    const endDate = new Date('2023-10-01');
    expect(sut.transform(startDate, endDate)).toBe(-9);
  });

  it('should return 0 if startDate and endDate are the same', () => {
    const date = new Date('2023-10-10');
    expect(sut.transform(date, date)).toBe(0);
  });
});
