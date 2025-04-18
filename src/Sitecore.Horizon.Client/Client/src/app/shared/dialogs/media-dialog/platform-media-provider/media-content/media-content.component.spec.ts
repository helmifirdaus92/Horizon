/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CmUrlTestingModule } from 'app/shared/pipes/platform-url/cm-url.module.testing';
import { MediaPipesModule } from 'app/shared/platform-media/media-pipes/media-pipes.module';
import { VirtualScrollModule } from 'app/shared/virtual-scroll/virtual-scroll-module';
import { TESTING_URL } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { MediaContentComponent } from './media-content.component';

let wrapperWidth = 500;

@Component({
  template: `
    <div [style.width.px]="wrapperWidth">
      <app-media-content [items]="items"></app-media-content>
    </div>
  `,
})
class TestComponent {
  wrapperWidth = wrapperWidth;
  items = Array.from({ length: 2 }).map((_, i) => {
    const [width, height] = [Math.ceil(Math.random() * 250), Math.ceil(Math.random() * 250)];
    return {
      src: `${TESTING_URL}${width}/${height}`,
      name: `dimensions: ${width}x${height}`,
      id: '#' + i,
    };
  });
}

@Component({
  selector: 'app-media-card',
  template: '',
})
class MediaCardStubComponent {
  @Input() src?: string;
  @Input() text = '';
  @Input() select = false;
}

describe('MediaContentComponent', () => {
  let component: MediaContentComponent;
  let componentDe: DebugElement;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [VirtualScrollModule, TranslateServiceStubModule, TranslateModule, MediaPipesModule, CmUrlTestingModule],
      declarations: [MediaContentComponent, MediaCardStubComponent, TestComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: TranslateService, useValue: { get: () => of('hello {{limit}} world') } }],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    componentDe = fixture.debugElement.query(By.directive(MediaContentComponent));
    component = componentDe.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', async () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('WHEN container is 500px width', () => {
    beforeEach(() => {
      wrapperWidth = 600;
      fixture = TestBed.createComponent(TestComponent);
      componentDe = fixture.debugElement.query(By.directive(MediaContentComponent));
      component = componentDe.componentInstance;
      fixture.detectChanges();
    });

    it('should set colCount to 2', async () => {
      await fixture.whenStable();
      expect(component.colCount).toBe(2);
    });
  });

  describe('WHEN container is 800px width', () => {
    beforeEach(() => {
      wrapperWidth = 900;
      fixture = TestBed.createComponent(TestComponent);
      componentDe = fixture.debugElement.query(By.directive(MediaContentComponent));
      component = componentDe.componentInstance;
      fixture.detectChanges();
    });

    it('should set colCount to 4', async () => {
      await fixture.whenStable();
      expect(component.colCount).toBe(4);
    });
  });

  describe('[limitReachedText$]', () => {
    it('should return limit reached text where length$ replaces the limit placeholder', () => {
      component.length$.next(123);

      component.limitReachedText$.subscribe((text) => {
        expect(text).toBe('hello 123 world');
      });
    });
  });
});
