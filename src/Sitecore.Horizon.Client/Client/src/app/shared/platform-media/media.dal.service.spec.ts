/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { GraphQLError } from 'graphql';
import { PartialObserver } from 'rxjs';
import { ConfigurationService } from '../configuration/configuration.service';
import { MediaDalService } from './media.dal.service';
import { MediaBlob, MediaFolder, MediaFolderFlat, MediaItem, MediaQueryResult } from './media.interface';

const queries = require('graphql-tag/loader!./media.graphql');

describe('MediaDalService', () => {
  let service: MediaDalService;
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>({ isMediaQuerySupportsBaseTemplates: true }, {}),
        },
      ],
    });

    service = TestBed.inject(MediaDalService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be provided', () => {
    expect(service).toBeTruthy();
  });

  describe('getMediaItem', () => {
    it('should fetch details for the media item', fakeAsync(() => {
      const spy = jasmine.createSpyObj<PartialObserver<any>>('spy', ['next', 'complete']);
      const options = {
        language: 'lang',
        path: 'foo',
        site: 'mysite',
        sources: ['we have a source'],
      };
      service.getMediaItem(options).subscribe(spy);

      const getMediaItemOp = controller.expectOne(queries['GetMediaItem']);
      const variables = getMediaItemOp.operation.variables;
      const result: MediaItem = {
        id: 'foo',
        displayName: 'name',
        path: '/path',
        url: '/media/image123',
        embedUrl: '/media/image123',
        alt: 'alt',
        dimensions: '3x3',
        extension: '.foo',
        size: 100,
        width: 3,
        height: 33,
        parentId: '',
      };

      getMediaItemOp.flush({
        data: {
          mediaItem: result,
        },
      });
      tick();

      expect(variables).toEqual(options);
      expect(spy.next).toHaveBeenCalledWith(result);
      expect(spy.complete).toHaveBeenCalled();
      flush();
    }));

    describe('AND there are errors', () => {
      it('should fail the stream with the error code', fakeAsync(() => {
        const code = 'foo';
        const errorExtensions = { code };
        const error: GraphQLError = new GraphQLError(
          'error1',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          errorExtensions,
        );
        const spy: jasmine.SpyObj<PartialObserver<any>> = jasmine.createSpyObj('spy', ['error', 'complete']);

        const options = {
          language: 'lang',
          path: 'foo',
          site: 'mysite',
          sources: [],
        };
        service.getMediaItem(options).subscribe(spy);

        const operation = controller.expectOne(queries['GetMediaItem']);
        operation.flush({ errors: [error], data: {} });
        tick();

        expect(spy.error).toHaveBeenCalledWith(code);
        flush();
      }));
    });
  });

  describe('getMediaFolder', () => {
    it('should fetch media folder with permissions field', fakeAsync(() => {
      const spy = jasmine.createSpyObj<PartialObserver<any>>('spy', ['next', 'complete']);
      const options = {
        language: 'lang',
        path: 'foo',
        site: 'mysite',
      };
      service.getMediaFolder(options.language, options.site, options.path).subscribe(spy);

      const getMediaOp = controller.expectOne(queries['GetMediaFolder']);
      const variables = getMediaOp.operation.variables;

      const result: MediaFolder = {
        id: 'foo',
        displayName: 'name',
        hasChildren: false,
        children: [],
        permissions: {
          canCreate: true,
          canDelete: true,
          canRename: true,
        },
      };

      getMediaOp.flush({
        data: {
          mediaFolderItem: result,
        },
      });
      tick();

      expect(variables).toEqual(options);
      expect(spy.next).toHaveBeenCalledWith(result);
      expect(spy.complete).toHaveBeenCalled();
      flush();
    }));

    describe('AND there are errors', () => {
      it('should fail the stream with the error code', fakeAsync(() => {
        const code = 'foo';
        const errorExtensions = { code };
        const error: GraphQLError = new GraphQLError(
          'error1',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          errorExtensions,
        );
        const spy: jasmine.SpyObj<PartialObserver<any>> = jasmine.createSpyObj('spy', ['error', 'complete']);

        const options = {
          language: 'lang',
          path: 'foo',
          site: 'mysite',
        };
        service.getMediaFolder(options.language, options.site, options.path).subscribe(spy);

        const operation = controller.expectOne(queries['GetMediaFolder']);
        operation.flush({ errors: [error], data: {} });
        tick();

        expect(spy.error).toHaveBeenCalledWith(code);
        flush();
      }));
    });
  });

  describe('getFolderAncestors', () => {
    it('should fetch media folder with permissions fields', fakeAsync(() => {
      const spy = jasmine.createSpyObj<PartialObserver<any>>('spy', ['next', 'complete']);
      const options = {
        language: 'lang',
        path: 'foo',
        site: 'mysite',
        sources: [],
      };
      service.getFolderAncestors(options.path, options.language, options.site, []).subscribe(spy);

      const getMediaOp = controller.expectOne(queries['GetMediaFolderAncestors']);
      const variables = getMediaOp.operation.variables;

      const result: MediaFolderFlat[] = [
        {
          id: 'foo',
          displayName: 'foo',
          hasChildren: true,
          parentId: '',
          permissions: {
            canCreate: true,
            canDelete: true,
            canRename: true,
          },
        },
        {
          id: '123',
          parentId: '123',
          displayName: 'foo',
          hasChildren: false,
          permissions: {
            canCreate: true,
            canDelete: true,
            canRename: true,
          },
        },
      ];

      getMediaOp.flush({
        data: {
          mediaFolderAncestors: result,
        },
      });
      tick();

      expect(variables).toEqual(options);
      expect(spy.next).toHaveBeenCalledWith(result);
      expect(spy.complete).toHaveBeenCalled();
      flush();
    }));

    describe('getMedia', () => {
      it('should fetch data about the images from the given source', fakeAsync(() => {
        const spy = jasmine.createSpyObj<PartialObserver<any>>('spy', ['next', 'complete']);
        const options = {
          language: 'lang',
          sources: ['foo'],
          site: 'mysite',
          root: 'hello!',
        };
        service.getMedia(options).subscribe(spy);

        const getMediaOp = controller.expectOne(queries['QueryMedia']);
        const variables = getMediaOp.operation.variables;
        const result: MediaQueryResult = {
          hasMoreItems: false,
          items: [
            { displayName: 'foo', id: 'fooId', url: 'fooUrl' },
            { displayName: 'bar', id: 'barId', url: 'barUrl' },
          ],
        };

        getMediaOp.flush({
          data: {
            mediaQuery: result,
          },
        });
        tick();

        expect(variables).toEqual(options);
        expect(spy.next).toHaveBeenCalledWith(result);
        expect(spy.complete).toHaveBeenCalled();
        flush();
      }));
    });

    describe('uploadMedia', () => {
      it('should upload media to the source', fakeAsync(() => {
        const spy = jasmine.createSpyObj<PartialObserver<any>>('spy', ['next', 'complete']);

        const mediaBlob: MediaBlob = {
          fileName: 'test.jpg',
          extension: 'jpg',
          blob: 'test-blob',
        };
        const folderId = 'folderId';
        const language = 'en';
        const site = 'test-site';

        service.uploadMedia(mediaBlob, folderId, language, site).subscribe(spy);

        const op = controller.expectOne(queries['UploadMedia']);
        const variables = op.operation.variables;
        const result = { success: true, mediaItem: [] };

        op.flush({ data: { uploadMedia: result } });

        tick();

        expect(variables).toEqual({
          input: {
            fileName: mediaBlob.fileName,
            extension: mediaBlob.extension,
            blob: mediaBlob.blob,
            destinationFolderId: folderId,
            mediaId: '',
            language,
            site,
          },
        });
        expect(spy.next).toHaveBeenCalledWith(result);
        expect(spy.complete).toHaveBeenCalled();
        flush();
      }));

      it('should handle errors correctly', fakeAsync(() => {
        const code = 'GenericError';
        const errorExtensions = { code };
        const error: GraphQLError = new GraphQLError(
          'error1',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          errorExtensions,
        );
        const spy: jasmine.SpyObj<PartialObserver<any>> = jasmine.createSpyObj('spy', ['error', 'complete']);

        const mediaBlob: MediaBlob = {
          fileName: 'test.jpg',
          extension: 'jpg',
          blob: 'test-blob',
        };

        service.uploadMedia(mediaBlob, 'folderId', 'en', 'test-site').subscribe(spy);

        const op = controller.expectOne(queries['UploadMedia']);
        op.flush({ errors: [error], data: {} });
        tick();

        expect(spy.error).toHaveBeenCalledWith(code);
        flush();
      }));
    });
  });
});
