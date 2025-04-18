/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule } from '@sitecore/ng-spd-lib';
import { CanvasLayoutServices, CanvasServices } from 'app/editor/shared/canvas.services';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { PersonalizationLayoutService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { Context } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { DatasourceDialogService } from 'app/shared/dialogs/datasource-dialog/datasource-dialog.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EMPTY, of } from 'rxjs';
import { RenderingDataSourceComponent } from './rendering-data-source.component';

const INITIAL_CONTEXT: Context = {
  itemId: 'foo',
  itemVersion: 1,
  language: 'ab-cd',
  siteName: 'siteInitial001',
  variant: 'variant1',
};

@Component({
  selector: `app-data-view`,
})
class DataViewTestComponent {
  @Input() item: any;
  @Input() mode: any;
}

describe(RenderingDataSourceComponent.name, () => {
  let sut: RenderingDataSourceComponent;
  let fixture: ComponentFixture<RenderingDataSourceComponent>;

  let canvasServices: jasmine.SpyObj<CanvasServices>;
  let canvasLayoutServices: jasmine.SpyObj<CanvasLayoutServices>;
  let personalizationLayoutServiceSpy: jasmine.SpyObj<PersonalizationLayoutService>;
  let datasourceDialogServiceSpy: jasmine.SpyObj<DatasourceDialogService>;
  let personalizationServiceSpy: jasmine.SpyObj<PersonalizationService>;
  let itemDalServiceSpy: jasmine.SpyObj<BaseItemDalService>;
  let contextService: ContextServiceTesting;

  const getSelectItemLink = () =>
    fixture.debugElement.query(By.css('.select-datasource-item')).nativeElement as HTMLButtonElement;

  beforeEach(async () => {
    personalizationLayoutServiceSpy = jasmine.createSpyObj<PersonalizationLayoutService>(
      'PersonalizationLayoutService',
      ['addSetDataSourcePersonalizationRule', 'getPersonalizedRenderingInfo', 'getPersonalizedRenderingDataSource'],
    );
    datasourceDialogServiceSpy = jasmine.createSpyObj<DatasourceDialogService>('dialog', ['show']);
    itemDalServiceSpy = jasmine.createSpyObj<BaseItemDalService>('itemDalService', ['getItem']);
    personalizationServiceSpy = jasmine.createSpyObj<PersonalizationService>('personalizationService', [
      'getIsInPersonalizationMode',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule,
        CommonModule,
        TranslateServiceStubModule,
        FormsModule,
        ContextServiceTestingModule,
        FeatureFlagsModule,
        IconButtonModule,
      ],
      declarations: [RenderingDataSourceComponent, DataViewTestComponent],
      providers: [
        {
          provide: CanvasServices,
          useValue: jasmine.createSpyObj<CanvasServices>({
            getCurrentLayout: jasmine.createSpyObj<CanvasLayoutServices>([
              'getRendering',
              'findRendering',
              'updateRenderings',
              'removeRendering',
              'setRenderingsPersonalizationRules',
            ]),
          }),
        },
        {
          provide: PersonalizationLayoutService,
          useValue: personalizationLayoutServiceSpy,
        },
        {
          provide: DatasourceDialogService,
          useValue: datasourceDialogServiceSpy,
        },
        {
          provide: BaseItemDalService,
          useValue: itemDalServiceSpy,
        },
        {
          provide: PersonalizationService,
          useValue: personalizationServiceSpy,
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RenderingDataSourceComponent);
    sut = fixture.componentInstance;

    canvasServices = TestBedInjectSpy(CanvasServices);

    personalizationLayoutServiceSpy.getPersonalizedRenderingDataSource.and.resolveTo(undefined);
    canvasLayoutServices = canvasServices.getCurrentLayout() as any;
    canvasLayoutServices.getRendering.and.returnValue({
      dataSource: 'testDs001',
      instanceId: 'instanceId1',
      parameters: { param1: 'value1', param2: 'value2' },
      placeholderKey: '',
      id: '',
    });

    datasourceDialogServiceSpy = TestBedInjectSpy(DatasourceDialogService);
    personalizationLayoutServiceSpy = TestBedInjectSpy(PersonalizationLayoutService);
    personalizationServiceSpy = TestBedInjectSpy(PersonalizationService);
    personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(false);

    itemDalServiceSpy = TestBedInjectSpy(BaseItemDalService);
    itemDalServiceSpy.getItem.and.returnValue(of({ displayName: 'display-name' } as any));

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(INITIAL_CONTEXT);

    sut.chrome = {
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

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('Change data source item', () => {
    it('should set default datasource: context varian is empty', async () => {
      datasourceDialogServiceSpy.show.and.returnValue(
        of({ itemId: 'testDataSourceItemId', layoutRecord: 'testDataSourceItemId' }),
      );
      contextService.provideTestValue({ itemId: 'id1', language: 'lang1', siteName: 'site1', variant: undefined });

      fixture.detectChanges();
      getSelectItemLink().click();
      await fixture.whenStable();

      expect(personalizationLayoutServiceSpy.addSetDataSourcePersonalizationRule).not.toHaveBeenCalled();
      expect(canvasLayoutServices.updateRenderings).toHaveBeenCalledWith([
        {
          renderingInstanceId: 'test-rendering-instance-id',
          update: { dataSource: 'testDataSourceItemId' },
        },
      ]);
    });

    it('should set default datasource: context varian is not empty, not in personalization mode and without AB test', async () => {
      datasourceDialogServiceSpy.show.and.returnValue(
        of({ itemId: 'testDataSourceItemId', layoutRecord: 'testDataSourceItemId' }),
      );
      contextService.provideTestValue({ itemId: 'id1', language: 'lang1', siteName: 'site1', variant: undefined });
      personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(false);

      fixture.detectChanges();
      getSelectItemLink().click();
      await fixture.whenStable();

      expect(personalizationLayoutServiceSpy.addSetDataSourcePersonalizationRule).not.toHaveBeenCalled();
      expect(canvasLayoutServices.updateRenderings).toHaveBeenCalledWith([
        {
          renderingInstanceId: 'test-rendering-instance-id',
          update: { dataSource: 'testDataSourceItemId' },
        },
      ]);
    });

    it('should set rule datasource in personalized mode', async () => {
      datasourceDialogServiceSpy.show.and.returnValue(
        of({ itemId: 'testDataSourceItemId', layoutRecord: 'testDataSourceItemId' }),
      );
      contextService.provideTestValue({ itemId: 'id1', language: 'lang1', siteName: 'site1', variant: 'var001' });
      personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(true);

      fixture.detectChanges();
      getSelectItemLink().click();
      await fixture.whenStable();

      expect(canvasLayoutServices.updateRenderings).not.toHaveBeenCalled();
      expect(personalizationLayoutServiceSpy.addSetDataSourcePersonalizationRule).toHaveBeenCalledWith(
        sut.chrome.renderingInstanceId,
        'var001',
        'testDataSourceItemId',
      );
    });

    it('should set rule datasource: context variant is used in AB test rules', async () => {
      datasourceDialogServiceSpy.show.and.returnValue(
        of({ itemId: 'testDataSourceItemId', layoutRecord: 'testDataSourceItemId' }),
      );
      contextService.provideTestValue({ itemId: 'id1', language: 'lang1', siteName: 'site1', variant: 'var001' });
      personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(false);
      personalizationLayoutServiceSpy.getPersonalizedRenderingInfo.and.resolveTo({ dataSource: 'prevDs001' });
      sut.abTest = {} as any;

      fixture.detectChanges();
      getSelectItemLink().click();
      await fixture.whenStable();

      expect(canvasLayoutServices.updateRenderings).not.toHaveBeenCalled();
      expect(personalizationLayoutServiceSpy.addSetDataSourcePersonalizationRule).toHaveBeenCalledWith(
        sut.chrome.renderingInstanceId,
        'var001',
        'testDataSourceItemId',
      );
    });

    it('should set default datasource: context variant is not used in AB test rules', async () => {
      datasourceDialogServiceSpy.show.and.returnValue(
        of({ itemId: 'testDataSourceItemId', layoutRecord: 'testDataSourceItemId' }),
      );
      contextService.provideTestValue({ itemId: 'id1', language: 'lang1', siteName: 'site1', variant: 'var001' });
      personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(false);
      personalizationLayoutServiceSpy.getPersonalizedRenderingInfo.and.resolveTo({});
      sut.abTest = {} as any;

      fixture.detectChanges();
      getSelectItemLink().click();
      await fixture.whenStable();

      expect(personalizationLayoutServiceSpy.addSetDataSourcePersonalizationRule).not.toHaveBeenCalled();
      expect(canvasLayoutServices.updateRenderings).toHaveBeenCalledWith([
        {
          renderingInstanceId: 'test-rendering-instance-id',
          update: { dataSource: 'testDataSourceItemId' },
        },
      ]);
    });

    it('should pass rendering details to data source service', async () => {
      datasourceDialogServiceSpy.show.and.returnValue(EMPTY);
      contextService.provideTestValue({ itemId: 'id1', language: 'lang1', siteName: 'site1', variant: undefined });

      await sut.selectDataSource();

      expect(datasourceDialogServiceSpy.show).toHaveBeenCalledWith({
        renderingId: 'test-rendering-id',
        select: 'testDs001',
        renderingDetails: {
          instanceId: 'instanceId1',
          parameters: { param1: 'value1', param2: 'value2' },
          placeholderKey: '',
        },
        mode: 'ChangeDatasource',
      });
    });
  });
});
