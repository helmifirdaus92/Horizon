/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule } from '@sitecore/ng-spd-lib';
import { LhsPanelStateService } from 'app/editor/lhs-panel/lhs-panel.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ReloadCanvasButtonComponent } from './reload-canvas-button.component';

describe(ReloadCanvasButtonComponent.name, () => {
  let sut: ReloadCanvasButtonComponent;
  let fixture: ComponentFixture<ReloadCanvasButtonComponent>;
  let contextServiceSpy: jasmine.SpyObj<ContextService>;
  let lhsPanelStateService: LhsPanelStateService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, IconButtonModule],
      declarations: [ReloadCanvasButtonComponent],
      providers: [
        {
          provide: ContextService,
          useValue: jasmine.createSpyObj<ContextService>(['updateContext'], {
            value: 'ContextValue' as any,
          }),
        },
        LhsPanelStateService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    lhsPanelStateService = TestBed.inject(LhsPanelStateService);

    contextServiceSpy = TestBedInjectSpy(ContextService);
    contextServiceSpy.updateContext.and.returnValue(Promise.resolve());

    fixture = TestBed.createComponent(ReloadCanvasButtonComponent);
    sut = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should init Context update that will initiate Canvas reload', () => {
    fixture.debugElement.query(By.css('#reloadCanvas')).nativeElement.click();

    fixture.detectChanges();

    expect(contextServiceSpy.updateContext.calls.mostRecent().args[0]).toEqual('ContextValue' as any);
  });

  describe('expanded LHS panel', () => {
    afterEach(() => {
      lhsPanelStateService.setExpand(false);
    });

    it('should disable device switcher when LHS panel is expanded', () => {
      lhsPanelStateService.setExpand(true);
      fixture.detectChanges();

      const sutEl = fixture.debugElement.query(By.css('#reloadCanvas')).nativeElement;
      expect(sutEl.disabled).toBeTrue();
    });
  });
});
