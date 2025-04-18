/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DateFormatPipe } from './date-format.pipe';

describe(DateFormatPipe.name, () => {
  let pipe: DateFormatPipe;

  beforeEach(() => {
    pipe = new DateFormatPipe();
  });

  it('should format date correctly for Date field type', () => {
    const input = '2024-03-20';

    const result = pipe.transform(input, 'Date');

    expect(result).toBe('Mar 20th 2024');
  });

  it('should format date correctly for DateTime field type', () => {
    const input = '2024-03-20T14:30';

    const result = pipe.transform(input, 'Datetime');

    expect(result).toBe('March 20th 2024, 2:30 pm');
  });

  it('should handle invalid date input', () => {
    const input = 'invalid-date';

    const result = pipe.transform(input, 'Date');

    expect(result).toBe('Invalid date');
  });
});
