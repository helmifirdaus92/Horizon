/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ContextServiceTesting,
  ContextServiceTestingModule,
  DEFAULT_TEST_CONTEXT,
} from 'app/shared/client-state/context.service.testing';
import { TreeNode } from 'app/shared/item-tree/item-tree.component';
import { Site } from 'app/shared/site-language/site-language.service';
import {
  SiteLanguageServiceTestingModule,
  SiteServiceStub,
  dummyLanguages,
  dummySites,
} from 'app/shared/site-language/site-language.service.testing';
import { resolveMaybeObservables } from 'app/shared/utils/rxjs/rxjs-custom';
import { normalizeGuid } from 'app/shared/utils/utils';
import { TestBedInjectSpy, createSpyObserver } from 'app/testing/test.utils';
import { EMPTY, of, throwError } from 'rxjs';
import { ItemPickerComponent } from './item-picker.component';
import { RawItemAncestor } from './item-picker.dal.service';
import { ItemPickerService } from './item-picker.service';

function mostRecentCallFirstArg(spy: jasmine.Spy) {
  return spy.calls.mostRecent().args[0];
}

@Component({
  selector: 'app-item-tree',
  template: '',
})
class TestTreeComponent {
  dataSpy = jasmine.createSpy('data');
  @Input() set data(value: TreeNode[]) {
    this.dataSpy(value);
  }

  selectSpy = jasmine.createSpy('select');
  @Input() set select(value: TreeNode[]) {
    this.selectSpy(value);
  }

  getChildrenSpy = jasmine.createSpy('getChildren');
  @Input() set getChildren(value: TreeNode[]) {
    this.getChildrenSpy(value);
  }

  @Output() selectChange = new EventEmitter<TreeNode>();

  emitSelectChange(value: string) {
    this.selectChange.emit({
      id: value,
      displayName: 'display name',
      isFolder: false,
      isSelectable: true,
      isCompatible: true,
      hasChildren: false,
    });
  }
}

@Pipe({ name: 'normalizeGuid' })
export class NormalizeGuidTestPipe implements PipeTransform {
  transform(value: any) {
    return value;
  }
}

describe(ItemPickerComponent.name, () => {
  let sut: ItemPickerComponent;
  let fixture: ComponentFixture<ItemPickerComponent>;
  let testTree: TestTreeComponent;
  let itemPickerService: jasmine.SpyObj<ItemPickerService>;
  let siteService: SiteServiceStub;
  let context: ContextServiceTesting;

  const defaultRootItemIds = ['root1', 'root2'];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule, SiteLanguageServiceTestingModule],
      declarations: [ItemPickerComponent, TestTreeComponent, NormalizeGuidTestPipe],
      providers: [
        {
          provide: ItemPickerService,
          useValue: jasmine.createSpyObj<ItemPickerService>('ItemPickerService', {
            getAncestorsWithSiblings: EMPTY,
            getChildren: EMPTY,
          }),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    siteService = TestBed.inject(SiteServiceStub);

    context = TestBed.inject(ContextServiceTesting);
    context.provideDefaultTestContext();

    fixture = TestBed.createComponent(ItemPickerComponent);
    sut = fixture.componentInstance;

    testTree = fixture.debugElement.query(By.directive(TestTreeComponent)).componentInstance;

    itemPickerService = TestBedInjectSpy(ItemPickerService);

    itemPickerService.getAncestorsWithSiblings
      .withArgs('invalid', context.language, context.siteName, defaultRootItemIds)
      .and.returnValue(throwError(() => 'ItemNotFound'));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(sut).toBeTruthy();
  });

  describe('fetch tree data', () => {
    const itemId = 'foo';

    describe('validate site and langauge', () => {
      describe('WHEN site and/or langauge DO NOT exist in the lists of avalible ones', () => {
        it('should pass context values', () => {
          // act
          sut.itemId = itemId;
          sut.language = 'xxxx';
          sut.site = 'yyyy';
          fixture.detectChanges();

          expect(itemPickerService.getAncestorsWithSiblings).toHaveBeenCalledWith(
            itemId,
            DEFAULT_TEST_CONTEXT.language,
            DEFAULT_TEST_CONTEXT.siteName,
            [siteService.defaultSiteContext.id],
          );
        });
      });

      describe('WHEN site and/or langauge DO exist in the lists of avalible ones', () => {
        it('should pass those values', () => {
          // act
          sut.itemId = itemId;
          sut.language = dummyLanguages[1].name;
          sut.site = dummySites[1].name;
          fixture.detectChanges();

          expect(itemPickerService.getAncestorsWithSiblings).toHaveBeenCalledWith(
            itemId,
            dummyLanguages[1].name!,
            dummySites[1].name!,
            [siteService.defaultSiteContext.id],
          );
        });
      });
    });

    it('should supply the data to the tree', () => {
      // arrange
      const parentNode: RawItemAncestor = {
        displayName: 'dark node',
        id: 'Vader',
        hasChildren: true,
        isFolder: false,
        parentId: '-',
      };

      const childNode: RawItemAncestor = {
        displayName: 'dark node',
        id: 'Vaderson',
        hasChildren: false,
        isFolder: false,
        parentId: 'Vader',
      };

      // act
      itemPickerService.getAncestorsWithSiblings.and.returnValue(of([parentNode, childNode]));
      sut.itemId = itemId;
      sut.language = null;
      sut.site = null;
      fixture.detectChanges();

      // assert
      const result: TreeNode[] = mostRecentCallFirstArg(testTree.dataSpy);
      // check expect separately because if it doesn't match its easier to spot what failed
      expect(result).toEqual([
        {
          displayName: parentNode.displayName,
          hasChildren: true,
          id: normalizeGuid(parentNode.id),
          isSelectable: true,
          isFolder: false,
          children: jasmine.anything(),
        },
      ]);
      expect(result[0].children).toEqual([
        {
          displayName: childNode.displayName,
          hasChildren: false,
          id: normalizeGuid(childNode.id),
          isSelectable: true,
          isFolder: false,
          children: undefined,
        },
      ]);
    });

    describe('WHEN the initial request cannot fetch tree with a selected site', () => {
      it('should retry with a scoped site without selection', () => {
        // arrange
        const siteRoot = 'siteid';
        siteService.defaultSiteContext = { id: siteRoot } as Site;
        itemPickerService.getAncestorsWithSiblings.and
          .returnValue(of([]))
          .withArgs(itemId, jasmine.anything(), jasmine.anything(), [siteRoot])
          .and.returnValue(throwError(() => 'RootNotReachable'));

        // act
        sut.itemId = itemId;
        sut.language = null;
        sut.site = 'website';
        fixture.detectChanges();

        // assert
        const [call1, call2] = itemPickerService.getAncestorsWithSiblings.calls.allArgs();
        expect(call1).toEqual([itemId, DEFAULT_TEST_CONTEXT.language, 'website', [siteRoot]]);
        expect(call2).toEqual([siteRoot, DEFAULT_TEST_CONTEXT.language, 'website', [siteRoot]]);
      });
    });
  });

  describe('is node selectable', () => {
    const itemId = 'foo';

    describe('AND the node is a folder', () => {
      it('should not be selectable', waitForAsync(() => {
        // arrange
        const parentNode: RawItemAncestor = {
          displayName: 'dark node',
          id: 'Vader',
          hasChildren: true,
          isFolder: false,
          parentId: '-',
        };

        const childNode: RawItemAncestor = {
          displayName: 'dark node',
          id: 'Vaderson',
          hasChildren: false,
          isFolder: true,
          parentId: 'Vader',
        };

        itemPickerService.getAncestorsWithSiblings.and.returnValue(of([parentNode, childNode]));

        // act
        sut.itemId = itemId;
        sut.language = null;
        sut.site = null;
        fixture.detectChanges();

        // assert
        const result: TreeNode[] = mostRecentCallFirstArg(testTree.dataSpy);
        expect(result[0].isSelectable).toBe(true);
        expect(result[0].children![0].isSelectable).toBe(false);
      }));
    });
  });

  describe('getChildren', () => {
    const node: TreeNode = {
      displayName: '',
      hasChildren: true,
      id: 'nodeId',
      isFolder: false,
      isSelectable: false,
    };

    describe('AND node already has children', () => {
      it('should return the children of the node', () => {
        const child = { bar: 'foo' };

        expect(sut.getChildrenThisBound({ ...node, children: [child as any] })).toEqual([child as any]);
      });
    });

    describe('AND node hasChildren but it isnt fetched', () => {
      it('should fetch the node children', () => {
        itemPickerService.getChildren.and.returnValue(of([]));

        resolveMaybeObservables(sut.getChildrenThisBound(node)).subscribe();

        expect(itemPickerService.getChildren).toHaveBeenCalledWith(
          node.id,
          DEFAULT_TEST_CONTEXT.language,
          DEFAULT_TEST_CONTEXT.siteName,
        );
      });
    });

    describe('AND node indicates it doesnt have any children', () => {
      it('should return `[]`', () => {
        expect(sut.getChildrenThisBound({ ...node, hasChildren: false })).toEqual([]);
      });
    });
  });

  describe('the tree emits a selectChange event', () => {
    const value = 'order 46';
    it('should forward the event', () => {
      // act
      fixture.detectChanges();

      const spy = createSpyObserver();
      sut.selectChange.subscribe(spy);

      // assert
      testTree.emitSelectChange(value);
      expect(spy.next).toHaveBeenCalledWith(value);
    });

    it('should update the select property', () => {
      fixture.detectChanges();

      testTree.emitSelectChange(value);
      expect(sut.select).toBe(value);
    });
  });
});
