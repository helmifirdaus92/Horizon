/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { calculateFinalDate, generateDates, monthsBetween, withAddedDays } from './date.utils';

describe('Date util', () => {
  describe('generateDates()', () => {
    it('should return the date range between both inputs and including both inputs', () => {
      const startDate = new Date('1995-12-25');
      const endDate = new Date('1996-01-05');

      const dates = generateDates(startDate, endDate);

      expect(dates[0].toLocaleDateString('en-US')).toBe('12/25/1995');
      expect(dates[6].toLocaleDateString('en-US')).toBe('12/31/1995');
      expect(dates[11].toLocaleDateString('en-US')).toBe('1/5/1996');
      expect(dates.length).toBe(12);
    });
  });

  describe('withAddedDays()', () => {
    it('should return a new date with the number of days added to it', () => {
      const currentDate = new Date('1995-12-25');

      const testDate = withAddedDays(currentDate, 388);

      expect(testDate.toLocaleDateString('en-US')).toBe('1/16/1997');
    });

    it('should return a new date with the number of negative days removed from it', () => {
      const currentDate = new Date('1995-12-25');

      const testDate = withAddedDays(currentDate, -388);

      expect(testDate.toLocaleDateString('en-US')).toBe('12/2/1994');
    });
  });

  describe('monthsBetween()', () => {
    it('should return total count of months between start and end date', () => {
      const startDate = new Date('1995-12-25');
      const endDate = new Date('1998-1-2');

      const numberOfMonths = monthsBetween(startDate, endDate);

      expect(numberOfMonths).toBe(25);
    });
  });

  describe('calculateFinalDate()', () => {
    let date: Date;

    beforeEach(() => {
      date = new Date('1995-12-25');
    });

    it('should return a date with the input days added on top of initial date', () => {
      const returnValue = calculateFinalDate(date, 7);
      const finalDate = returnValue[0];

      expect(finalDate.toLocaleDateString('en-US')).toBe('1/1/1996');
    });

    it('should return a date with the input days added on top of initial date, except for 1 day, when the date goes past the 1st in a month once', () => {
      const returnValue = calculateFinalDate(date, 8);
      const finalDate = returnValue[0];

      expect(finalDate.toLocaleDateString('en-US')).toBe('1/1/1996');
    });

    it('should return `false`, when the final date is not the 1st of a month', () => {
      const returnValue = calculateFinalDate(date, 6);
      const isDateTheFirstInMonth = returnValue[1];

      expect(isDateTheFirstInMonth).toBeFalsy();
    });

    it('should return `true`, when the final date is the 1st of a month', () => {
      const returnValue = calculateFinalDate(date, 7);
      const isDateTheFirstInMonth = returnValue[1];

      expect(isDateTheFirstInMonth).toBeTruthy();
    });
  });
});
