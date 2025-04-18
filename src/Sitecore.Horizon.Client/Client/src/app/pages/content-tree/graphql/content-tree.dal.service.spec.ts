/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { DEFAULT_TEST_CONTEXT } from 'app/shared/client-state/context.service.testing';
import { createSpyObserver } from 'app/testing/test.utils';
import { ContentTreeService } from '../content-tree.service';
import { ContentTreeDalService } from './content-tree.dal.service';

const language = 'bar';
const siteName = 'baz';

describe(ContentTreeDalService.name, () => {
  let sut: ContentTreeDalService;

  let controller: ApolloTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule.withClients(['global'])],
      providers: [
        {
          provide: ContentTreeDalService,
          useClass: ContentTreeDalService,
        },
      ],
    });

    controller = TestBed.inject(ApolloTestingController);
    sut = TestBed.inject(ContentTreeDalService);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be provided', () => {
    expect(sut).toBeTruthy();
  });

  describe('addPage()', () => {
    it('should use the API to add the item using the given input', () => {
      const templateId = 'baz';

      sut.addPage('fee', templateId, 'parentFoo', language, siteName).subscribe();

      const op = controller.expectOne(ContentTreeService.queries['CreatePage']);

      expect(op.operation.variables.input).toEqual({
        language,
        pageName: 'fee',
        parentId: 'parentFoo',
        site: siteName,
        templateId,
      });
    });
  });

  describe('addFolder()', () => {
    it('should use the API to add the item using the given input', () => {
      const templateId = 'baz';

      sut.addFolder('fee', templateId, 'parentFoo', language, siteName).subscribe();

      const op = controller.expectOne(ContentTreeService.queries['CreateFolder']);

      expect(op.operation.variables.input).toEqual({
        language,
        folderName: 'fee',
        parentId: 'parentFoo',
        site: siteName,
        templateId,
      });
    });
  });

  describe('deleteItem()', () => {
    it('should use the API to delete the item using the given input', () => {
      const itemId = 'item123';
      const site = 'site123';

      sut.deleteItem(itemId, site, language).subscribe();

      const op = controller.expectOne(ContentTreeService.queries['DeleteItem']);

      expect(op.operation.variables.input).toEqual({
        path: itemId,
        deletePermanently: false,
        site,
        language,
      });
    });
  });

  describe('changeDisplayName()', () => {
    it('should change the display name of the item using the given input', () => {
      const itemId = 'item123';
      const newDisplayName = 'New Display Name';

      sut.changeDisplayName(itemId, newDisplayName, language, siteName).subscribe();

      const op = controller.expectOne(ContentTreeService.queries['ChangeDisplayName']);

      expect(op.operation.variables.input).toEqual({
        path: itemId,
        newDisplayName,
        language,
        site: siteName,
      });
    });
  });

  describe('renamePage()', () => {
    it('should rename the page using the given input', () => {
      const renameItem = { itemId: 'item123', newName: 'New Name' };
      const updateItem = {
        itemId: 'item123',
        language,
        fields: [{ name: 'newField', value: 'newValue' }],
      };

      sut
        .renamePage(renameItem, updateItem, language, siteName)
        .subscribe(({ renameItem: renameItemResult, updateItem: updateItemResult }) => {
          expect(renameItemResult).toEqual({ id: 'item123', name: 'New Name' });
          expect(updateItemResult).toEqual({ id: 'item123', displayName: 'New Name' });
        });

      const op = controller.expectOne('UpdateItem');

      expect(op.operation.variables.renameItem).toEqual(renameItem);
      expect(op.operation.variables.updateItem).toEqual(updateItem);
    });
  });

  describe('moveItem', () => {
    it('should execute the moveItem mutation', fakeAsync(() => {
      // arrange
      const itemToMoveId = 'itemid';
      const targetId = 'targetid';
      const site = DEFAULT_TEST_CONTEXT.siteName;
      const spy = createSpyObserver();

      // act
      sut.moveItem(itemToMoveId, targetId, site).subscribe(spy);
      const op = controller.expectOne(ContentTreeService.queries['MoveItem']);
      const result = { success: true };
      op.flush({ data: { moveItem: result } });
      tick();

      // assert
      expect(op.operation.variables).toEqual({
        input: {
          itemToMoveId,
          targetId,
          site,
          position: 'INTO',
        },
      });
      expect(spy.next).toHaveBeenCalledWith(result);
      flush();
    }));
  });
});
