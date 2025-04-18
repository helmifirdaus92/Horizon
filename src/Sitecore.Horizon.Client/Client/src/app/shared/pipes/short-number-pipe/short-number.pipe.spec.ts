/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ShortNumberPipe } from './short-number.pipe';

describe(ShortNumberPipe.name, () => {
  let sut: ShortNumberPipe;

  beforeEach(() => {
    sut = new ShortNumberPipe();
  });

  it('should create an instance', () => {
    expect(sut).toBeTruthy();
  });

  it('should return undefined if value is undefined', () => {
    const value = undefined;
    const result = sut.transform(value);

    expect(result).toBe(undefined);
  });

  it('should not format the value if it is not a number', () => {
    const value = 'value01';
    const result = sut.transform(value);

    expect(result).toEqual(value);
  });

  it('should return null if value is null', () => {
    const value = null;
    const result = sut.transform(value);

    expect(result).toEqual(null);
  });

  it('should not add any suffix if [value < 1000]', () => {
    const value = '123';
    const result = sut.transform(value);

    expect(result).toEqual(value);
  });

  it('should format value and add suffix `K` if [value >= 1000]', () => {
    const value = 10230;
    const formattedValue = '10.2K';
    const result = sut.transform(value);

    expect(result).toEqual(formattedValue);
  });

  it('should format value and add suffix `M` if [value >=1000000]', () => {
    const value = 1235000;
    const formattedValue = '1.2M';
    const result = sut.transform(value);

    expect(result).toEqual(formattedValue);
  });

  it('should format value and add suffix `B` if [value >=1000000000]', () => {
    const value = 1235000000;
    const formattedValue = '1.2B';
    const result = sut.transform(value);

    expect(result).toEqual(formattedValue);
  });

  it('should format the negative value', () => {
    const value = -12000;
    const formattedValue = '-12K';
    const result = sut.transform(value);

    expect(result).toEqual(formattedValue);
  });

  it('should round the number to nearest one decimal place if absolute value is less than 1000', () => {
    const value = 12.657234;
    const formattedValue = '12.7';
    const result = sut.transform(value);

    expect(result).toEqual(formattedValue);
  });
});
