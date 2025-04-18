/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SaveService } from 'app/editor/shared/save/save.service';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { Subject } from 'rxjs';
import { SaveIndicatorComponent } from './save-indicator.component';

describe('SaveIndicatorComponent', () => {
  let component: SaveIndicatorComponent;
  let fixture: ComponentFixture<SaveIndicatorComponent>;

  beforeEach(waitForAsync(() => {
    const saveService: Partial<SaveService> = {
      saveState$: new Subject(),
    };

    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule],
      providers: [{ provide: SaveService, useValue: saveService }],
      declarations: [SaveIndicatorComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
