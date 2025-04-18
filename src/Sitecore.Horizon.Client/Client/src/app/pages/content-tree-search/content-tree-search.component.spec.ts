/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import {
  CheckboxModule,
  IconButtonModule,
  LoadingIndicatorModule,
  PopoverModule,
  SearchInputModule,
  TreeModule,
} from '@sitecore/ng-spd-lib';
import { EmptyStateComponent } from 'app/page-design/empty-state/empty-state.component';
import { ItemResponse } from 'app/page-design/page-templates.types';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { Item } from 'app/shared/graphql/item.interface';
import { ItemTreeModule } from 'app/shared/item-tree/item-tree.module';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { AssetsPipeModule } from 'app/shared/utils/assets.module';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { Observable, of, Subject } from 'rxjs';
import { ContentTreeService } from '../content-tree/content-tree.service';
import { ContentTreeSearchComponent } from './content-tree-search.component';
import { ContentTreeSearchDalService } from './content-tree-search.dal.service';

describe('ContentTreeSearchComponent', () => {
  let component: ContentTreeSearchComponent;
  let fixture: ComponentFixture<ContentTreeSearchComponent>;
  let dalService: jasmine.SpyObj<ContentTreeSearchDalService>;
  let timedNotificationService: jasmine.SpyObj<TimedNotificationsService>;
  const searchResult = new Subject<{ isSuccessful: boolean; totalCount: number; items: ItemResponse[] }>();

  const contentTreeRoots = ['rootId001', 'rootId002'];

  const enterSearchString = (searchQuery = 'lookingForYou001') => {
    const input = fixture.debugElement.query(By.css('ng-spd-search-input input')).nativeElement as HTMLInputElement;
    input.value = searchQuery;
    input.dispatchEvent(new Event('keyup'));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TreeModule,
        TranslateModule,
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        SearchInputModule,
        ItemTreeModule,
        IconButtonModule,
        PopoverModule,
        AssetsPipeModule,
        CheckboxModule,
        LoadingIndicatorModule,
        BrowserAnimationsModule,
        EmptyStateComponent,
      ],
      declarations: [ContentTreeSearchComponent],
      providers: [
        {
          provide: ContentTreeSearchDalService,
          useValue: jasmine.createSpyObj<ContentTreeSearchDalService>({ search: searchResult }),
        },
        {
          provide: ContentTreeService,
          useValue: jasmine.createSpyObj<ContentTreeService>(
            { fetchItemChildren: of({} as Item) },
            { contentTreeRoots },
          ),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>({ push: undefined }),
        },
      ],
    }).compileComponents();

    dalService = TestBedInjectSpy(ContentTreeSearchDalService);
    timedNotificationService = TestBedInjectSpy(TimedNotificationsService);

    fixture = TestBed.createComponent(ContentTreeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call dal service with debounce time', fakeAsync(() => {
    const searchQuery = 'lookingForYou001';
    const input = fixture.debugElement.query(By.css('ng-spd-search-input input')).nativeElement as HTMLInputElement;
    input.value = searchQuery;
    input.dispatchEvent(new Event('keyup'));

    tick(499);
    expect(dalService.search).not.toHaveBeenCalled();
    tick(1);
    expect(dalService.search).toHaveBeenCalledOnceWith(searchQuery, contentTreeRoots, 'All', { pageSize: 20, skip: 0 });

    flush();
    flush();
  }));

  it('should show/hide loading indicator', fakeAsync(() => {
    enterSearchString();
    tick(500);
    fixture.detectChanges();

    const loadingIndicatorSelector = 'ng-spd-loading-indicator';
    const loadingIndicator = fixture.debugElement.query(By.css(loadingIndicatorSelector)).nativeElement;

    expect(getComputedStyle(loadingIndicator).display).toBe('flex');

    searchResult.next({ isSuccessful: true, totalCount: 0, items: [] });
    tick();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css(loadingIndicatorSelector))).toBeFalsy();

    flush();
  }));

  it('should show no search results empty state', fakeAsync(() => {
    enterSearchString();
    tick(500);

    searchResult.next({ isSuccessful: true, totalCount: 0, items: [] });
    tick();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('app-empty-state'))).toBeTruthy();

    flush();
  }));

  it('should show error timed notification if search fails', fakeAsync(() => {
    enterSearchString();
    tick(500);

    searchResult.next({ isSuccessful: false, totalCount: 0, items: [] });
    tick();
    fixture.detectChanges();

    expect(timedNotificationService.push).toHaveBeenCalledWith('search-error', jasmine.any(Observable), 'error');
    expect(fixture.debugElement.query(By.css('app-empty-state'))).toBeTruthy();

    flush();
  }));

  it('should apply item type filter to the search', fakeAsync(() => {
    const searchQuery = 'lookingForYou001';
    enterSearchString(searchQuery);
    tick(500);

    expect(dalService.search).toHaveBeenCalledOnceWith(searchQuery, contentTreeRoots, 'All', { pageSize: 20, skip: 0 });
    fixture.detectChanges();

    const openFilterButton = fixture.debugElement.query(By.css('button')).nativeElement;
    openFilterButton.click();
    const pagesFilterOptions = fixture.debugElement.queryAll(By.css('ng-spd-checkbox'))[1].nativeElement;
    pagesFilterOptions.click();

    expect(dalService.search).toHaveBeenCalledWith(searchQuery, contentTreeRoots, 'Pages', { pageSize: 20, skip: 0 });

    flush();
  }));

  it('should show search results as the selectable tree items', fakeAsync(() => {
    enterSearchString();
    tick(500);
    const result = {
      isSuccessful: true,
      totalCount: 2,
      items: [
        {
          itemId: 'result001',
          displayName: 'dN001',
        },
        {
          itemId: 'result002',
          displayName: 'dN002',
        },
      ],
    } as any;
    const selectItemEventEmit = spyOn(component.selectItem, 'next').and.callThrough();

    searchResult.next(result);
    tick();
    fixture.detectChanges();

    const treeNodes = fixture.debugElement.queryAll(By.css('ng-spd-nested-tree-node'));
    expect(treeNodes.length).toBe(2);

    treeNodes[1].nativeElement.firstChild.click();
    expect(selectItemEventEmit).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        id: 'result002',
        displayName: 'dN002',
      }),
    );

    flush();
  }));

  describe('Scroll', () => {
    it('should handle a scrolling event', () => {
      component.onScroll({ target: { scrollTop: 10 } } as any);
      expect(component.hasScroll).toBe(true);

      component.onScroll({ target: { scrollTop: 0 } } as any);
      expect(component.hasScroll).toBe(false);
    });

    it('should do pagination', fakeAsync(() => {
      const searchQuery = 'lookingForYou001';
      enterSearchString(searchQuery);
      tick(500);

      expect(dalService.search).toHaveBeenCalledWith(searchQuery, contentTreeRoots, 'All', {
        pageSize: 20,
        skip: 0,
      });

      const result = {
        isSuccessful: true,
        totalCount: 10,
        items: [
          {
            itemId: 'result001',
            displayName: 'dN001',
          },
          {
            itemId: 'result002',
            displayName: 'dN002',
          },
        ],
      } as any;
      searchResult.next(result);
      tick();

      component.onScroll({ target: { scrollHeight: 100, scrollTop: 50, clientHeight: 50 } } as any);
      expect(dalService.search).toHaveBeenCalledWith(searchQuery, contentTreeRoots, 'All', {
        pageSize: 20,
        skip: 2,
      });

      flush();
    }));
  });
});
