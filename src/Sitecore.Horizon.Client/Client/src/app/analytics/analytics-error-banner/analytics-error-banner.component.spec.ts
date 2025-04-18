/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { AnalyticsErrorBannerComponent } from './analytics-error-banner.component';

@Component({
  template: `<app-analytics-error-banner
    [title]="title"
    [text]="text"
    [linkText]="linkText"
    [linkUrl]="linkUrl"
    [icon]="icon"
  ></app-analytics-error-banner>`,
})
class TestComponent {
  title = '';
  text = '';
  linkText = '';
  linkUrl = '';
  icon = '';
}

describe(AnalyticsErrorBannerComponent.name, () => {
  let sut: AnalyticsErrorBannerComponent;
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalyticsErrorBannerComponent, TestComponent],
      imports: [TranslateServiceStubModule, TranslateModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;

    sut = fixture.debugElement.query(By.directive(AnalyticsErrorBannerComponent)).componentInstance;

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
    expect(testComponent).toBeTruthy();
  });

  describe('inputs', () => {
    it('should render correct title', () => {
      testComponent.title = 'test title';
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('h3')).nativeElement as HTMLHeadingElement;
      expect(title.textContent).toBe('test title');
    });

    it('should render correct text', () => {
      testComponent.text = 'test text';
      fixture.detectChanges();

      const text = fixture.debugElement.query(By.css('p')).nativeElement as HTMLParagraphElement;
      expect(text.textContent).toContain('test text');
    });

    it('should assign linkText and linkUrl if value is not empty', () => {
      testComponent.linkText = 'link text';
      testComponent.linkUrl = '/test/url';
      fixture.detectChanges();

      const anchorEl = fixture.debugElement.query(By.css('a'));

      expect(anchorEl.attributes.href).toContain('/test/url');
      expect(anchorEl.nativeElement.innerText).toEqual('link text');
    });

    it('should update icon when its value changes', () => {
      testComponent.icon = 'home';
      fixture.detectChanges();

      const iconEl = fixture.debugElement.query(By.css('.no-data-icon span i')).nativeElement;

      expect(iconEl.classList).toContain('mdi-home');
    });
  });
});
