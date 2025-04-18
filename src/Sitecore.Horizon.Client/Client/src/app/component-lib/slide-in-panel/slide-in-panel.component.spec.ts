/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconButtonModule } from '@sitecore/ng-spd-lib';
import { SlideInPanelContentComponent } from './slide-in-panel-content.component';
import { SlideInPanelHeaderComponent } from './slide-in-panel-header.component';
import { SlideInPanelComponent } from './slide-in-panel.component';

@Component({
  selector: 'test-slide-in-panel',
  template: `
    <ng-spd-slide-in-panel>
      <ng-spd-slide-in-panel-header [icon]="icon">foo</ng-spd-slide-in-panel-header>
      <ng-spd-slide-in-panel-content>bar</ng-spd-slide-in-panel-content>
    </ng-spd-slide-in-panel>
  `,
})
class TestSlideInPanelComponent {
  icon?: string;
}

describe('SlideInPanelComponent', () => {
  let de: DebugElement;
  let component: SlideInPanelComponent;
  let fixture: ComponentFixture<TestSlideInPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IconButtonModule],
      declarations: [
        TestSlideInPanelComponent,
        SlideInPanelComponent,
        SlideInPanelContentComponent,
        SlideInPanelHeaderComponent,
      ],
    });
    fixture = TestBed.createComponent(TestSlideInPanelComponent);
    de = fixture.debugElement.query(By.css('ng-spd-slide-in-panel'));
    component = de.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
