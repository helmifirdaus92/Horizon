/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { IconLabelButtonModule } from '@sitecore/ng-spd-lib';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { NavigationBarComponent } from './navigation-bar.component';

@Component({
  selector: 'app-user-info',
  template: '',
})
class TestUserInfoComponent {}

describe(NavigationBarComponent.name, () => {
  let sut: NavigationBarComponent;
  let fixture: ComponentFixture<NavigationBarComponent>;

  const getLinksEl = () => fixture.debugElement.queryAll(By.css('.links'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateServiceStubModule, TranslateModule, RouterTestingModule, IconLabelButtonModule],
      declarations: [NavigationBarComponent, TestUserInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationBarComponent);

    sut = fixture.componentInstance;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should show all tabs on the navigational panel', async () => {
    fixture.detectChanges();

    const tabs = getLinksEl();
    expect(tabs.length).toBe(4);
    expect((tabs[0].nativeElement as HTMLButtonElement).innerText).toBe('Editor');
    expect((tabs[1].nativeElement as HTMLButtonElement).innerText).toBe('Templates');
    expect((tabs[2].nativeElement as HTMLButtonElement).innerText).toBe('Personalize');
    expect((tabs[3].nativeElement as HTMLButtonElement).innerText).toBe('Analyze');
  });
});
