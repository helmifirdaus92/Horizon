/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { ItemInsertOption } from 'app/shared/graphql/item.interface';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of } from 'rxjs';
import { CreateFolderService } from './create-folder.service';

describe(CreateFolderService.name, () => {
  let sut: CreateFolderService;
  let contextService: ContextServiceTesting;
  let itemDalService: jasmine.SpyObj<BaseItemDalService>;

  const contextItemId = '3F2504E0-4F89-11D3-9A0C-0305E82C3301';
  const contextLang = 'fooLanguage';
  const contextSite = 'fooSite';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [CreateFolderService],
    }).compileComponents();

    sut = TestBed.inject(CreateFolderService);

    itemDalService = TestBedInjectSpy(BaseItemDalService);
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue({
      itemId: contextItemId,
      language: contextLang,
      siteName: contextSite,
    });
  });

  describe('getInsertOptions()', () => {
    it('should fetch insert options for the given item', fakeAsync(() => {
      const itemId = '123';
      const language = 'en';
      const siteName = 'example.com';
      const expectedOptions: ItemInsertOption[] = [];

      itemDalService.getItemInsertOptions.and.returnValue(of(expectedOptions));

      itemDalService.getItemInsertOptions(itemId, 'folder', language, siteName).subscribe((options) => {
        expect(itemDalService.getItemInsertOptions).toHaveBeenCalledWith(itemId, 'folder', language, siteName);
        expect(options).toBe(expectedOptions);
      });
      flush();
    }));

    describe('startCreateOperation', () => {
      it('should emit the parentId through startCreateOperation$', () => {
        const itemParentId = '456';
        let emittedParentId: string | undefined;

        sut.startCreateOperation$.subscribe(({ parentId }) => {
          emittedParentId = parentId;
        });

        sut.startCreateOperation(itemParentId);

        expect(emittedParentId).toBe(itemParentId);
      });
    });
  });
});
