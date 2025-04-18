/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule, LoadingIndicatorModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { VersionDetails } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { DatePipeMockModule } from 'app/testing/date-pipe-testing.module';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { VersionListComponent } from './version-list.component';

@Component({
  template: `<app-version-list
      [list]="list"
      [active]="active"
      [isLoading]="!!isLoading"
      [popoverContent]="popoverContent"
      (selectChange)="selectChange($event)"
    ></app-version-list>

    <ng-template #popoverContent let-item="item">
      Template content. Item Version ID {{ item.versionNumber }}
    </ng-template> `,
})
class TestVersionListComponent {
  list: VersionDetails[] = [];
  active?: number;
  isLoading?: boolean;
  selectChange(event: any) {
    return event;
  }
}

describe(VersionListComponent.name, () => {
  let sut: VersionListComponent;
  let testComponent: TestVersionListComponent;
  let fixture: ComponentFixture<TestVersionListComponent>;

  const dummyVersionList = [
    {
      versionNumber: 1,
      name: '',
      workflowState: 'Draft1',
      lastModifiedBy: 'author1',
      lastModifiedAt: '2020-01-09T12:05:14.815Z',
      validFrom: '2020-01-09T12:05:14.815Z',
      validTo: '2020-09-09T12:07:05.816Z',
      isLatestPublishableVersion: false,
      isAvailableToPublish: true,
    },
    {
      versionNumber: 2,
      name: 'test-version',
      workflowState: 'Draft2',
      lastModifiedBy: 'author2',
      lastModifiedAt: '2021-01-09T12:05:14.815Z',
      validFrom: '0001-01-01T00:00:00Z',
      validTo: '2021-09-09T12:07:05.816Z',
      isLatestPublishableVersion: true,
      isAvailableToPublish: true,
    },
  ];

  const versionList = () => fixture.debugElement.queryAll(By.css('[ngSpdListItem]'));
  const versionNameEl = () => fixture.debugElement.queryAll(By.css('.version-name'));
  const versionNumberEl = () => fixture.debugElement.queryAll(By.css('.version-number'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PopoverModule,
        TranslateModule,
        TranslateServiceStubModule,
        LoadingIndicatorModule,
        NoopAnimationsModule,
        PipesModule,
        DatePipeMockModule,
        ListModule,
      ],
      declarations: [VersionListComponent, TestVersionListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestVersionListComponent);
    testComponent = fixture.componentInstance;
    sut = fixture.debugElement.query(By.directive(VersionListComponent)).componentInstance;
    testComponent.list = dummyVersionList;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(testComponent).toBeTruthy();
    expect(sut).toBeTruthy();
  });

  describe('List of items', () => {
    it('should render list of versions in reverse order', () => {
      const [item1, item2] = versionList();
      const args1 = item1.queryAll(By.css('span'));
      const args2 = item2.queryAll(By.css('span'));

      expect(versionList().length).toBe(2);
      expect(args1[0].nativeElement.innerText).toEqual('test-version');
      expect(args2[0].nativeElement.innerText).toEqual('Version');
      expect(args1[1].nativeElement.innerText).toEqual('(Version 2)');
      expect(args2[1].nativeElement.innerText).toEqual('1');
    });

    it('should render version name in list if version name is defined', () => {
      expect(versionNameEl()[0].nativeElement.innerText).toBe('test-version');
    });

    it('should render static text `Version` in list if version name is not defined', () => {
      expect(versionNameEl()[1].nativeElement.innerText).toBe('Version');
    });

    it('should show version number in a version-number field if version-name is not defined', () => {
      const versionNumberFiled = versionNumberEl()[1].nativeElement.innerText;

      expect(versionNumberFiled).toEqual('1');
    });

    it('should append text `Version` & version number in a version-number field if version-name is defined', () => {
      const versionNumberFiled = versionNumberEl()[0].nativeElement.innerText;

      expect(versionNumberFiled).toEqual('(Version 2)');
    });
  });

  describe('Loading', () => {
    it('should NOT show loader AND show list', () => {
      testComponent.list = dummyVersionList;
      fixture.detectChanges();

      const loader = fixture.debugElement.query(By.css('ng-spd-loading-indicator'));
      const list = fixture.debugElement.query(By.css('.list-container'));

      expect(loader).toBeFalsy();
      expect(list).toBeTruthy();
    });

    it('should show loader AND do NOT show list WHEN loading', () => {
      testComponent.isLoading = true;
      testComponent.list = dummyVersionList;
      fixture.detectChanges();

      const loader = fixture.debugElement.query(By.css('ng-spd-loading-indicator'));
      const list = fixture.debugElement.query(By.css('ng-spd-list'));

      expect(loader).toBeTruthy();
      expect(list).toBeFalsy();
    });
  });
});
