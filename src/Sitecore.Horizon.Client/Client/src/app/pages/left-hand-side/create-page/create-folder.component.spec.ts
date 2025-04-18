/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { InlineNotificationModule, ListItemComponent, ListModule, LoadingIndicatorModule } from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { ContentTreeService } from 'app/pages/content-tree/content-tree.service';
import { ItemInsertOption } from 'app/shared/graphql/item.interface';
import { LoggingService } from 'app/shared/logging.service';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ReplaySubject, Subject } from 'rxjs';
import { CreateFolderComponent } from './create-folder.component';
import { CreateFolderService } from './create-folder.service';

describe('CreatePageComponent', () => {
  let sut: CreateFolderComponent;
  let fixture: ComponentFixture<CreateFolderComponent>;
  let de: DebugElement;
  let contentTreeService: ContentTreeService;
  let insertOptions$: Subject<ItemInsertOption[]>;

  beforeEach(waitForAsync(() => {
    insertOptions$ = new ReplaySubject<ItemInsertOption[]>(1);
    const createPageServiceStub: Partial<CreateFolderService> = {
      getInsertOptions: () => insertOptions$,
    };
    const contentTreeServiceStub: Partial<ContentTreeService> = {
      addTempCreatedItem: (_templateId: string, _kind: 'page' | 'folder', _itemId: string) => {},
    };
    TestBed.configureTestingModule({
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        SlideInPanelModule,
        ListModule,
        InlineNotificationModule,
        LoadingIndicatorModule,
      ],
      declarations: [CreateFolderComponent],
      providers: [
        { provide: CreateFolderService, useValue: createPageServiceStub },
        { provide: ContentTreeService, useValue: contentTreeServiceStub },
        { provide: LoggingService, useValue: jasmine.createSpyObj<LoggingService>({ warn: undefined }) },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFolderComponent);
    de = fixture.debugElement;
    sut = fixture.componentInstance;
    contentTreeService = TestBed.inject(ContentTreeService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('AND action is "create folder"', () => {
    it('should show create folder title', () => {
      fixture.detectChanges();

      const result = fixture.debugElement.query(By.css('ng-spd-slide-in-panel-header')).nativeElement.innerText;
      expect(result).toBe('EDITOR.CREATE_FOLDER');
    });
  });

  describe('when there is a template', () => {
    it(`should call "addTempItem()" on contentTreeService with the template id and parentId,
    when the button is clicked`, () => {
      const templateId = 'bar';
      const parentId = 'item123';

      const addTempItemSpy = spyOn(contentTreeService, 'addTempCreatedItem');
      insertOptions$.next([{ displayName: 'foo', id: templateId }]);

      sut.parentId = parentId;
      fixture.detectChanges();

      const button = de.query(By.directive(ListItemComponent));
      button.triggerEventHandler('click', {});
      fixture.detectChanges();

      expect(addTempItemSpy).toHaveBeenCalledWith(templateId, 'folder', parentId);
    });
  });

  it('should show an loading indicator, until insertOptions$ emits a value', () => {
    sut.parentId = 'foo';
    fixture.detectChanges();

    let el = de.query(By.css('ng-spd-loading-indicator'));
    expect(el).toBeTruthy();

    insertOptions$.next([]);
    fixture.detectChanges();

    el = de.query(By.css('ng-spd-loading-indicator'));
    expect(el).toBeFalsy();
  });
});
