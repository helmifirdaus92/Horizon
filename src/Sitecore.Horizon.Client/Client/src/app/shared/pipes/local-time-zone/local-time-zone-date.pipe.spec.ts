/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { LocalTimeZoneDatePipe } from './local-time-zone-date.pipe';

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

describe(LocalTimeZoneDatePipe.name, () => {
  let sut: LocalTimeZoneDatePipe;

  beforeEach(() => {
    sut = new LocalTimeZoneDatePipe();
  });

  it('should return an empty string if value is undefined', () => {
    expect(sut.transform(undefined)).toBe('');
  });

  it('should format the date correctly for a Date object', () => {
    const date = new Date('2023-10-10T10:00:00Z');
    const formattedDate = sut.transform(date);
    const expectedDate = getExpectedDateString(date);

    expect(formattedDate).toBe(expectedDate);
  });

  it('should format the date correctly for a string', () => {
    const date = '2023-10-10T10:00:00Z';
    const formattedDate = sut.transform(date);
    const expectedDate = getExpectedDateString(new Date(date));

    expect(formattedDate).toBe(expectedDate);
  });

  it('should format the date correctly for a timestamp', () => {
    const timestamp = 1696932000000;
    const formattedDate = sut.transform(timestamp);
    const expectedDate = getExpectedDateString(new Date(timestamp));

    expect(formattedDate).toBe(expectedDate);
  });

  function getExpectedDateString(date: Date): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    });
    return `${formatter.format(date)} (${timeZone})`;
  }
});
