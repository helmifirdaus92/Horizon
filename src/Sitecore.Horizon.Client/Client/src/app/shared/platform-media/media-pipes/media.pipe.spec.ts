/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MediaFileSizePipe, ResizeMediaPipe } from './media.pipe';

describe('MediaPipe', () => {
  describe('MediaFileSizePipe', () => {
    const pipe = new MediaFileSizePipe();

    it('should return `0` as `0 B`', () => {
      expect(pipe.transform(0)).toBe('0 B');
    });

    it('should return `10000` as `10 KB`', () => {
      expect(pipe.transform(10000)).toBe('10 KB');
    });

    it('should return `10000` as `9.8 KB`, when there is 1 decimal', () => {
      expect(pipe.transform(10000, 1)).toBe('9.8 KB');
    });

    it('should return `10000` as `9.77 KB`, when there is 2 decimals', () => {
      expect(pipe.transform(10000, 2)).toBe('9.77 KB');
    });

    it('should return `9` as a byte string', () => {
      expect(pipe.transform(9).endsWith(' B')).toBeTruthy();
    });

    it('should return `9999` as a kilobyte string', () => {
      expect(pipe.transform(9999).endsWith(' KB')).toBeTruthy();
    });

    it('should return `9999999` as a megabyte string', () => {
      expect(pipe.transform(9999999).endsWith(' MB')).toBeTruthy();
    });

    it('should return `9999999999` as a gigabyte string', () => {
      expect(pipe.transform(9999999999).endsWith(' GB')).toBeTruthy();
    });
  });

  describe('ResizeMediaPipe', () => {
    let sut: ResizeMediaPipe;

    beforeEach(() => {
      sut = new ResizeMediaPipe();
    });

    it('should append passed sizes', () => {
      expect(sut.transform('/path', 1, 2)).toBe('/path?mh=1&mw=2');
    });

    it('should append correct default size', () => {
      expect(sut.transform('/path')).toBe('/path?mh=260&mw=260');
    });

    it('should return empty for empty input', () => {
      expect(sut.transform('')).toBe('');
    });
  });
});
