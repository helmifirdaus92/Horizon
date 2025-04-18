/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AuthenticationDetails, CurrentSiteId, MDialogResult } from './content-hub-dam-ext.dal.service';
import {
  buildEmbeddedHtml,
  buildRawValue,
  escapeUnsafeCharacters,
  parseAuthAndSiteData,
  parseContentDetailsResponse,
} from './content-hub-dam-provider.utils';

describe('Content hub DAM plugin Utils', () => {
  describe('parseAuthAndSiteData', () => {
    const dummyMInstance = 'dummyMInstance';
    const dummySearchPage = 'dummySearchPage';
    const dummyExternalRedirectKey = 'dummyExternalRedirectKey';
    const dummySiteId = 'dummySiteId';

    it('should parse auth and site data', () => {
      const authData: AuthenticationDetails = {
        m_instance: dummyMInstance,
        search_page: dummySearchPage,
        external_redirect_key: dummyExternalRedirectKey,
      };
      const siteId: CurrentSiteId = { site_id: dummySiteId };

      const { baseUrl, url } = parseAuthAndSiteData(authData, siteId);

      expect(baseUrl).toBe(dummyMInstance);
      expect(url).toBe(
        `${dummySearchPage}?externalRedirectKey=${dummyExternalRedirectKey}&externalRedirectUrl=${window.location.href}&hasExternalRedirect=true&id=${dummySiteId}`,
      );
    });
  });

  describe('parseContentDetailsResponse', () => {
    describe('ContentType', () => {
      describe('WHEN content is image type', () => {
        it('should define Image content type', () => {
          const response = new Response();
          response.headers.set('content-type', 'image/format');

          const { contentType } = parseContentDetailsResponse(response as Response);

          expect(contentType).toBe('Image');
        });
      });

      describe('WHEN content is video type', () => {
        it('should define Video content type', () => {
          const response = new Response();
          response.headers.set('content-type', 'video/format');

          const { contentType } = parseContentDetailsResponse(response as Response);

          expect(contentType).toBe('Video');
        });
      });

      describe('WHEN content is other type', () => {
        it('should define Other content type', () => {
          const response = new Response();
          response.headers.set('content-type', 'any other');

          const { contentType } = parseContentDetailsResponse(response as Response);

          expect(contentType).toBe('Other');
        });
      });

      describe('WHEN response does not have "content-type" header', () => {
        it('should define Other content type', () => {
          const response = new Response();

          const { contentType } = parseContentDetailsResponse(response as Response);

          expect(contentType).toBe('Other');
        });
      });
    });

    describe('Extension and Filename', () => {
      it('should parse filename and extension', () => {
        const response = new Response();
        response.headers.set('content-type', 'format/jpg');
        response.headers.set('content-disposition', 'filename="file name"');

        const { extension, fileName } = parseContentDetailsResponse(response as Response);

        expect(extension).toBe('jpg');
        expect(fileName).toBe('file name');
      });

      describe('WHEN response does not have "content-type" and "content-disposition"  headers', () => {
        it('should set empty extension and empty file name', () => {
          const response = new Response();

          const { extension, fileName } = parseContentDetailsResponse(response as Response);

          expect(extension).toBe('');
          expect(fileName).toBe('');
        });
      });

      describe('WHEN response does not contain filename', () => {
        it('should set file name', () => {
          const response = new Response();
          response.headers.set('content-disposition', 'no file name');

          const { fileName } = parseContentDetailsResponse(response as Response);

          expect(fileName).toBe('');
        });
      });
    });
  });

  describe('escapeUnsafeCharacters', () => {
    it('should escape unsafe characters', () => {
      const result = escapeUnsafeCharacters(`<>&"testтест`);

      expect(result).toBe('&lt;&gt;&amp;&quot;testтест');
    });

    describe('WHEN string is falsy', () => {
      it('should return an empty string', () => {
        expect(escapeUnsafeCharacters('')).toBe('');
      });
    });
  });

  describe('buildRawValue', () => {
    it('should build a raw value', () => {
      const test: MDialogResult = {
        id: 'id',
        thumbnail: 'thumbnail',
        alternative: 'alternative',
        downloadText: 'downloadText',
        width: '10',
        height: '20',
        source: 'source',
        file_type: 'file_type',
        file_name: 'file_name',
        file_extension: 'file_extension',
      };

      expect(buildRawValue(test)).toBe(
        '<image mediaid="" alt="alternative" width="10" height="20" stylelabs-content-id="id" thumbnailsrc="thumbnail" src="source" stylelabs-content-type="file_type" />',
      );
    });
    it('should do encode sources and escape special characters in alt', () => {
      const test: MDialogResult = {
        id: 'id',
        thumbnail: 'http://site.com?param&param2="value here"',
        alternative: '"<code>alternative"текст"',
        downloadText: 'downloadText',
        width: '10',
        height: '20',
        source: 'http://site.com?param&param2="value here"',
        file_type: 'file_type',
        file_name: 'file_name',
        file_extension: 'file_extension',
      };

      expect(buildRawValue(test)).toBe(
        '<image mediaid="" alt="&quot;&lt;code&gt;alternative&quot;текст&quot;" width="10" height="20" stylelabs-content-id="id" thumbnailsrc="http://site.com?param&param2=%22value%20here%22" src="http://site.com?param&param2=%22value%20here%22" stylelabs-content-type="file_type" />',
      );
    });

    describe('WHEN width and height parameters are falsy', () => {
      it('should not include width and height attributes', () => {
        const test: MDialogResult = {
          id: 'id',
          thumbnail: 'thumbnail',
          alternative: 'alternative',
          downloadText: 'downloadText',
          width: null,
          height: null,
          source: 'source',
          file_type: 'file_type',
          file_name: 'file_name',
          file_extension: 'file_extension',
        };

        expect(buildRawValue(test)).toBe(
          '<image mediaid="" alt="alternative" stylelabs-content-id="id" thumbnailsrc="thumbnail" src="source" stylelabs-content-type="file_type" />',
        );
      });
    });
  });

  describe('buildEmbeddedHtml', () => {
    describe('WHEN file_type is Image', () => {
      it('should build emnedded html', () => {
        const test: MDialogResult = {
          id: 'id',
          thumbnail: 'thumbnail',
          alternative: 'alternative',
          downloadText: 'downloadText',
          width: null,
          height: null,
          source: 'source',
          file_type: 'Image',
          file_name: 'file_name',
          file_extension: 'file_extension',
        };

        expect(buildEmbeddedHtml(test)).toBe('<img alt="alternative" src="source" />');
      });
    });

    describe('WHEN file_type is Vidoe', () => {
      it('should build emnedded html', () => {
        const test: MDialogResult = {
          id: 'id',
          thumbnail: 'thumbnail',
          alternative: 'alternative',
          downloadText: 'downloadText',
          width: null,
          height: null,
          source: 'source',
          file_type: 'Video',
          file_name: 'file_name',
          file_extension: 'file_extension',
        };

        expect(buildEmbeddedHtml(test)).toBe(
          '<video width="320" height="240" controls="controls"><source src="source"></source></video>',
        );
      });
    });

    describe('WHEN file_type is Other', () => {
      it('should build emnedded html', () => {
        const test: MDialogResult = {
          id: 'id',
          thumbnail: 'thumbnail',
          alternative: 'alternative',
          downloadText: 'downloadText',
          width: null,
          height: null,
          source: 'source',
          file_type: 'Other',
          file_name: 'file_name',
          file_extension: 'file_extension',
        };

        expect(buildEmbeddedHtml(test)).toBe(`<a href='source' target="_blank">downloadText</a>`);
      });
    });

    describe('WHEN file_type is not Image/Video/Other', () => {
      it('should build an empty string', () => {
        const test: MDialogResult = {
          id: 'id',
          thumbnail: 'thumbnail',
          alternative: 'alternative',
          downloadText: 'downloadText',
          width: null,
          height: null,
          source: 'source',
          file_type: 'file_type',
          file_name: 'file_name',
          file_extension: 'file_extension',
        };

        expect(buildEmbeddedHtml(test)).toBe('');
      });
    });
  });
});
