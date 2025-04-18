/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { NgCommandManager } from '@sitecore/ng-page-composer';
import { DialogOverlayService, InlineNotificationModule } from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { PersonalizationLayoutService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { PersonalizationModule } from 'app/pages/left-hand-side/personalization/personalization.module';
import { Context } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EMPTY, of } from 'rxjs';
import { DatasourceDialogCommands } from 'sdk';
import { EditorRhsService } from '../../editor-rhs.service';
import { RhsEditorMessaging } from '../../rhs-editor-messaging';
import { RenderingDetailsPersonalizedComponent } from './rendering-details-personalized.component';

const INITIAL_CONTEXT: Context = {
  itemId: 'foo',
  itemVersion: 1,
  language: 'maorie',
  siteName: 'supermutantninjaturtles',
  variant: 'variant1',
};

@Component({
  template: `<app-rendering-details-personalized
    [chrome]="chrome"
    [rhsMessaging]="rhsMessaging"
    [displayName]="displayName"
    [isRenderingHidden]="isRenderingHidden"
  ></app-rendering-details-personalized>`,
})
class PersonalizedRenderingTestComponent {
  @Input() chrome?: RenderingChromeInfo;
  @Input() rhsMessaging?: RhsEditorMessaging;
  @Input() displayName?: string;
  @Input() isRenderingHidden = false;
}
@Component({
  template: '<ng-content></ng-content>',
  selector: 'ng-spd-switch',
})
class TestSwitchComponent {
  @Input() disabled = false;
  @Input() checked = false;
  @Input() text = '';
}

describe(RenderingDetailsPersonalizedComponent.name, () => {
  let sut: RenderingDetailsPersonalizedComponent;
  let testComponent: PersonalizedRenderingTestComponent;
  let switchComponent: TestSwitchComponent;
  let fixture: ComponentFixture<PersonalizedRenderingTestComponent>;
  let rhsServiceSpy: jasmine.SpyObj<EditorRhsService>;

  let personalizationLayoutServiceSpy: jasmine.SpyObj<PersonalizationLayoutService>;
  let contextService: ContextServiceTesting;
  let personalizationServiceSpy: jasmine.SpyObj<PersonalizationService>;

  const getHideRenderingSwitch = () =>
    fixture.debugElement.query(By.css('ng-spd-switch')).nativeElement as HTMLButtonElement;
  const getResetButton = () =>
    fixture.debugElement.query(By.css('div.reset button')).nativeElement as HTMLButtonElement;
  const selectRendering = () => fixture.debugElement.query(By.css('.rendering button')).nativeElement;

  const detectChanges = async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(waitForAsync(() => {
    rhsServiceSpy = jasmine.createSpyObj<EditorRhsService>('rhsService', {
      getFriendlyDataSourceValue: EMPTY,
      watchCanWrite: EMPTY,
    });

    personalizationLayoutServiceSpy = jasmine.createSpyObj<PersonalizationLayoutService>(
      'PersonalizationLayoutService',
      [
        'addSetDataSourcePersonalizationRule',
        'addSetRenderingPersonalizationRule',
        'addHideRenderingPersonalizationRule',
        'isPersonalizedRenderingHidden',
        'removeHideRenderingPersonalizationRule',
        'removePersonalizationRuleFromRendering',
        'getPersonalizedReplacedRenderingId',
        'invokeInsertRenderingAction',
        'addRenderingDetailsPersonalizationRule',
      ],
    );
    personalizationServiceSpy = jasmine.createSpyObj('PersonalizationService', [
      'getActiveVariant',
      'isDefaultVariant',
    ]);

    TestBed.configureTestingModule({
      declarations: [RenderingDetailsPersonalizedComponent, PersonalizedRenderingTestComponent, TestSwitchComponent],
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        FormsModule,
        SlideInPanelModule,
        NoopAnimationsModule,
        AppLetModule,
        PersonalizationModule,
        ContextServiceTestingModule,
        InlineNotificationModule,
      ],
      providers: [
        { provide: EditorRhsService, useValue: rhsServiceSpy },
        { provide: DialogOverlayService, useValue: {} },

        {
          provide: NgCommandManager,
          useValue: jasmine.createSpyObj<NgCommandManager<DatasourceDialogCommands>>({ invoke: undefined }),
        },
        {
          provide: PersonalizationLayoutService,
          useValue: personalizationLayoutServiceSpy,
        },
        { provide: PersonalizationService, useValue: personalizationServiceSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalizedRenderingTestComponent);
    testComponent = fixture.componentInstance;
    switchComponent = fixture.debugElement.query(By.directive(TestSwitchComponent)).componentInstance;
    sut = fixture.debugElement.query(By.directive(RenderingDetailsPersonalizedComponent)).componentInstance;

    testComponent.chrome = {
      chromeId: '-1',
      chromeType: 'rendering',
      displayName: 'displayName',
      renderingInstanceId: 'test-rendering-instance-id',
      renderingDefinitionId: 'test-rendering-id',
      contextItem: {
        id: 'ctx-item-id',
        language: 'ctx-item-lng',
        version: 22,
      },
      isPersonalized: true,
      appliedPersonalizationActions: [],
      inlineEditorProtocols: ['dummy-protocol'],
      compatibleRenderings: [],
      parentPlaceholderChromeInfo: {} as any,
    };

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(INITIAL_CONTEXT);

    rhsServiceSpy.watchCanWrite.and.returnValue(of(true));
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(sut).toBeDefined();
    expect(testComponent).toBeDefined();
  });

  describe('Personalization-section', () => {
    it('should show slide-in-panel ON personalization button click', () => {
      fixture.detectChanges();

      const slideInPanel = fixture.debugElement.query(By.css('ng-spd-slide-in-panel'));

      expect(slideInPanel).toBeDefined();
    });

    describe('replace rendering', () => {
      it('should replace current rendering with selected rendering', async () => {
        // arrange
        personalizationLayoutServiceSpy.invokeInsertRenderingAction.and.returnValue(
          Promise.resolve({
            renderingDetails: {
              instanceId: 'testId123',
              renderingId: 'test_rendering_id',
              placeholderKey: '1',
              dataSource: 'testDsId',
              parameters: { parameter1: 'value1' },
            },
            cancelRenderingInsert: false,
          }),
        );
        await detectChanges();

        // act
        sut.replaceRendering('rendering id');
        await detectChanges();

        // assert
        expect(personalizationLayoutServiceSpy.addRenderingDetailsPersonalizationRule).toHaveBeenCalledWith(
          'test-rendering-instance-id',
          'variant1',
          { renderingId: 'rendering id', dataSource: null, renderingParameters: { parameter1: 'value1' } },
        );
      });
    });

    describe('hide rendering switch', () => {
      it('should hide the rendering when it is on', fakeAsync(() => {
        // arrange
        contextService.provideTestValue({
          itemId: 'id1',
          language: 'lang1',
          siteName: 'site1',
          variant: 'variant1',
        });
        testComponent.isRenderingHidden = false;

        // act
        fixture.detectChanges();
        getHideRenderingSwitch().click(); // Turn on the hide switch
        tick();

        // assert
        expect(personalizationLayoutServiceSpy.addHideRenderingPersonalizationRule).toHaveBeenCalledWith(
          'test-rendering-instance-id',
          'variant1',
        );
        flush();
      }));

      it('should show the rendering when it is off', fakeAsync(() => {
        // arrange
        contextService.provideTestValue({
          itemId: 'id1',
          language: 'lang1',
          siteName: 'site1',
          variant: 'variant1',
        });
        testComponent.isRenderingHidden = true;

        // act
        fixture.detectChanges();
        getHideRenderingSwitch().click(); // Turn off the hide switch
        tick();

        // assert
        expect(personalizationLayoutServiceSpy.removeHideRenderingPersonalizationRule).toHaveBeenCalledWith(
          'test-rendering-instance-id',
          'variant1',
        );
        flush();
      }));
    });

    describe('reset personalization', () => {
      it('should remove personalization rules', fakeAsync(() => {
        // arrange
        contextService.provideTestValue({
          itemId: 'id1',
          language: 'lang1',
          siteName: 'site1',
          variant: 'variant1',
        });

        // act
        fixture.detectChanges();
        getResetButton().click();
        tick();

        // assert
        expect(personalizationLayoutServiceSpy.removePersonalizationRuleFromRendering).toHaveBeenCalledWith(
          'test-rendering-instance-id',
          'variant1',
        );
        flush();
      }));
    });

    describe('canWrite', () => {
      it('should disable all personalization controls if user do not have write access', () => {
        rhsServiceSpy.watchCanWrite.and.returnValue(of(false));
        fixture.detectChanges();

        expect(getResetButton().hasAttribute('disabled')).toBeTruthy();
        expect(selectRendering().hasAttribute('disabled')).toBeTruthy();
        expect(switchComponent.disabled).toBe(true);
      });
    });
  });
});
