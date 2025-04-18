/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { createGqlError, createSpyObserver } from 'app/testing/test.utils';
import { ItemPickerDalService, RawItem, RawItemAncestor } from './item-picker.dal.service';

const queries = require('graphql-tag/loader!./item-picker.graphql');

function mostRecentCallFirstArg(spy: jasmine.Spy) {
  return spy.calls.mostRecent().args[0];
}

describe(ItemPickerDalService.name, () => {
  let sut: ItemPickerDalService;
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [ItemPickerDalService],
    });

    sut = TestBed.inject(ItemPickerDalService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be provided', () => {
    expect(sut).toBeTruthy();
  });

  describe('getChildren()', () => {
    const path = 'path';
    const language = 'danish rocks';
    const site = 'yyy.www.zzz';

    const item: RawItem = {
      id: '1',
      displayName: 'my name is Forest',
      hasChildren: false,
      isFolder: false,
    };

    it('should fetch the data through gql', fakeAsync(() => {
      // arrange
      const spy = createSpyObserver();
      sut.getChildren(path, language, site).subscribe(spy);

      const op = controller.expectOne(queries['GetChildren']);
      const vars = op.operation.variables;

      // act
      op.flush({
        data: {
          rawItem: {
            id: 'someid',
            children: [item],
          },
        },
      });
      tick();

      // assert
      expect(vars).toEqual({ path, language, site });
      expect(spy.next).toHaveBeenCalledWith([item]);
      expect(spy.complete).toHaveBeenCalled();
      expect(spy.error).not.toHaveBeenCalled();
      flush();
    }));

    describe('AND there are errors', () => {
      it('should fail the stream with the error code', fakeAsync(() => {
        // arrange
        const spy = createSpyObserver();
        sut.getChildren(path, language, site).subscribe(spy);

        const code = '5001';
        const error = createGqlError('some error', code);

        // act
        const op = controller.expectOne(queries['GetChildren']);
        op.flush({ errors: [error], data: {} });
        tick();

        // assert
        expect(spy.error).toHaveBeenCalledWith(code);
        flush();
      }));
    });
  });

  describe('getAncestorsWithSiblings()', () => {
    const path = 'path';
    const language = 'danish rocks';
    const site = 'yyy.www.zzz';
    const roots = ['root1'];

    const item: RawItemAncestor = {
      id: '1',
      displayName: 'my name is Forest',
      hasChildren: false,
      isFolder: false,
      parentId: '',
    };

    it('should fetch the data through gql', fakeAsync(() => {
      // arrange
      const spy = createSpyObserver();
      sut.getAncestorsWithSiblings(path, language, site, roots).subscribe(spy);

      const op = controller.expectOne(queries['GetAncestorsWithSiblings']);
      const vars = op.operation.variables;

      // act
      op.flush({ data: { rawItem: { id: 'someid', ancestorsWithSiblings: [item] } } });
      tick();

      // assert
      const result: RawItemAncestor = mostRecentCallFirstArg(spy.next)[0];
      // make sure that children is present so that equal matcher succeeds (undefined vs not present fails)
      expect(result).toEqual(item);

      expect(vars).toEqual({ path, language, site, roots });
      expect(spy.complete).toHaveBeenCalled();
      expect(spy.error).not.toHaveBeenCalled();
      flush();
    }));

    describe('AND there are errors', () => {
      it('should fail the stream with the error code', fakeAsync(() => {
        // arrange
        const spy = createSpyObserver();
        sut.getAncestorsWithSiblings(path, language, site).subscribe(spy);

        const code = '5001';
        const error = createGqlError('some error', code);

        // act
        const op = controller.expectOne(queries['GetAncestorsWithSiblings']);
        op.flush({ errors: [error], data: {} });
        tick();

        // assert
        expect(spy.error).toHaveBeenCalledWith(code);
        flush();
      }));
    });
  });
});
