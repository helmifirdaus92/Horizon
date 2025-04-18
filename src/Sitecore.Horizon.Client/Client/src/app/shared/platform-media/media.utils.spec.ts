/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { maxSize } from './media.interface';
import { checkUploadFileErrorType, parseMediaRawValue } from './media.utils';

describe('Media Utils', () => {
  describe('parseMediaRawValue', () => {
    it('should parse the raw value and return mediaId from value if its defined', () => {
      const rawValue = '<image mediaid="{0D9C2383-BC1F-48EF-81E4-DD8307BC6E55}" /> ';

      const parseValue = parseMediaRawValue(rawValue);
      const expectedMediaId = '{0D9C2383-BC1F-48EF-81E4-DD8307BC6E55}';

      expect(parseValue.mediaId).toEqual(expectedMediaId);
    });

    it('should return empty string if raw value does not contain mediaId', () => {
      const rawValue = '<image src="/test.jpg" /> ';

      const parseValue = parseMediaRawValue(rawValue);
      const expectedMediaId = '';

      expect(parseValue.mediaId).toEqual(expectedMediaId);
    });
  });

  describe('checkUploadFileErrorType', () => {
    let fileList: FileList;
    let file: File;

    beforeEach(() => {
      file = new File(['test'], 'testImage.jpg', { type: 'image/jpeg' });
      fileList = {
        0: file,
        length: 1,
        item: () => file,
      };
    });

    it('should return [errorCode= InvalidExtension, isValid= false] if file type is not supported', () => {
      Object.defineProperty(file, 'name', { value: 'testImage.pdf' });

      const validateFile = checkUploadFileErrorType(file);

      expect(validateFile.errorCode).toEqual('InvalidExtension');
      expect(validateFile.isValid).toEqual(false);
    });

    it('should return [errorCode = FileSizeTooBig, isValid=false] if file size is more than 2BG', () => {
      const FileSizeTooBig = maxSize;
      Object.defineProperty(file, 'size', { value: FileSizeTooBig + 1 });

      const validateFile = checkUploadFileErrorType(file);

      expect(validateFile.errorCode).toEqual('FileSizeTooBig');
      expect(validateFile.isValid).toBe(false);
    });

    it('should set [errorCode = null] and [isValid = true] if file passes validation check', () => {
      file = new File(['test'], 'testImage.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: maxSize - 1 });

      const validateFile = checkUploadFileErrorType(file);

      expect(validateFile.errorCode).toEqual(null);
      expect(validateFile.isValid).toEqual(true);
    });

    it('should correctly validate file with multiple dots in the name', () => {
      file = new File(['test'], 'template.thumbnail.1.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: maxSize - 1 });

      const validateFile = checkUploadFileErrorType(file);

      expect(validateFile.errorCode).toBe(null);
      expect(validateFile.isValid).toBe(true);
    });
  });
});
