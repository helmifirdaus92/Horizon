/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';

import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TabComponent, TabsModule } from '@sitecore/ng-spd-lib';
import { SiteType } from 'app/page-design/page-templates.types';
import { PageDesignModule } from '../../page-design.module';
import { TemplatesSharedSitesTabsComponent } from './templates-shared-sites-tabs.component';

describe(TemplatesSharedSitesTabsComponent.name, () => {
  let sut: TemplatesSharedSitesTabsComponent;
  let fixture: ComponentFixture<TemplatesSharedSitesTabsComponent>;

  const getTabs = () => fixture.debugElement.queryAll(By.directive(TabComponent));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        PageDesignModule,
        NoopAnimationsModule,
        TabsModule,
      ],
      declarations: [TemplatesSharedSitesTabsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TemplatesSharedSitesTabsComponent);
    sut = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('Shared sites', () => {
    it('Should select shared site type', () => {
      // Arrange
      spyOn(sut.changeSiteType, 'emit');
      const siteType: SiteType = 'shared';

      // Act
      const sharedTabButton = getTabs()[1].nativeElement as HTMLButtonElement;
      sharedTabButton.click();
      fixture.detectChanges();

      // Assert
      expect(sut.changeSiteType.emit).toHaveBeenCalledWith(siteType);
      expect(getTabs()[0].nativeElement as HTMLElement).not.toContain('active');
      expect((getTabs()[1].nativeElement as HTMLElement).classList).toContain('active');
    });

    it('Should select current site', () => {
      // Arrange
      spyOn(sut.changeSiteType, 'emit');
      const siteType: SiteType = 'current';

      // Act
      const currentTabButton = getTabs()[0].nativeElement as HTMLButtonElement;
      currentTabButton.click();
      fixture.detectChanges();

      // Assert
      expect(sut.changeSiteType.emit).toHaveBeenCalledWith(siteType);
      expect((getTabs()[0].nativeElement as HTMLElement).classList).toContain('active');
      expect((getTabs()[1].nativeElement as HTMLElement).classList).not.toContain('active');
    });
  });
});
