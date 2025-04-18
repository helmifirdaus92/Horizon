/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, ListModule } from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { TestBedInjectSpy, createSpyObserver } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { firstValueFrom, of } from 'rxjs';
import { first, skip } from 'rxjs/operators';
import { DatasourceDalService } from '../datasource.dal.service';
import { DatasourceTemplatePickerComponent, PageDataItemId } from './datasource-template-picker.component';

describe(DatasourceTemplatePickerComponent.name, () => {
  let sut: DatasourceTemplatePickerComponent;
  let sutFixture: ComponentFixture<DatasourceTemplatePickerComponent>;
  let configurationService: jasmine.SpyObj<ConfigurationService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        SlideInPanelModule,
        TranslateModule,
        TranslateServiceStubModule,
        ListModule,
        ContextServiceTestingModule,
      ],
      declarations: [DatasourceTemplatePickerComponent],
      providers: [
        {
          provide: DatasourceDalService,
          useValue: jasmine.createSpyObj<DatasourceDalService>('DatasourceService', {
            getInsertOptions: of([
              { id: '1', displayName: '1' },
              { id: '2', displayName: '2' },
            ]),
          }),
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>('ConfigurationService', [
            'isRenderingDefinitionIncludesBranchTemplate',
          ]),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    configurationService = TestBedInjectSpy(ConfigurationService);
    configurationService.isRenderingDefinitionIncludesBranchTemplate.and.returnValue(true);
    sutFixture = TestBed.createComponent(DatasourceTemplatePickerComponent);
    sut = sutFixture.componentInstance;
    sut.item = { id: 'rootItem' };
    sut.renderingDefinition = {
      datasourceRootItems: [],
      templates: [],
    };
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('when slide panel is open', () => {
    it('should return result as ok with selection', () => {
      sutFixture.detectChanges();
      const currentValueSpy = createSpyObserver();
      sut.result.subscribe(currentValueSpy);
      const list = sutFixture.debugElement.queryAll(By.css('ng-spd-list button'));
      const firstItem = list[0].nativeElement as HTMLElement;

      firstItem.dispatchEvent(new MouseEvent('click'));

      expect(currentValueSpy.next).toHaveBeenCalledWith({ kind: 'OK', templateId: '1' });
    });

    it('should return result as cancel', () => {
      sutFixture.detectChanges();
      const currentValueSpy = createSpyObserver();
      sut.result.subscribe(currentValueSpy);
      const returnBtn = sutFixture.debugElement.query(By.css('ng-spd-slide-in-panel-header button'))
        .nativeElement as HTMLElement;

      returnBtn.dispatchEvent(new MouseEvent('click'));

      expect(currentValueSpy.next).toHaveBeenCalledWith({ kind: 'Cancel' });
    });
  });

  describe('renderingDefinition has templates for root item', () => {
    it('should show only templates from rendering definition if item is a page data folder', async () => {
      sut.renderingDefinition = {
        datasourceRootItems: [{ id: 'rootItem' }],
        templates: [{ id: '3', name: '3', displayName: '3', path: '', isBranchTemplate: true }],
      };
      sut.item = { id: 'rootItem', template: { id: 'foo', baseTemplateIds: [PageDataItemId] } };

      sutFixture.detectChanges();
      const result = await firstValueFrom(sut.insertOptions$.pipe(skip(1), first()));

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('3');
    });

    it('should show branch template from rendering definition if item is a page data folder', async () => {
      sut.renderingDefinition = {
        datasourceRootItems: [{ id: 'rootItem' }],
        templates: [
          { id: '3', name: '3', displayName: '3', path: '', isBranchTemplate: false },
          { id: '2', name: '2', displayName: '2', path: '', isBranchTemplate: true },
        ],
      };
      sut.item = { id: 'rootItem', template: { id: 'foo', baseTemplateIds: [PageDataItemId] } };

      sutFixture.detectChanges();
      const result = await firstValueFrom(sut.insertOptions$.pipe(skip(1), first()));

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('2');
    });
  });

  describe('renderingDefinition has templates for non-root item', () => {
    it('should show insertOptionList for non page data folder items', () => {
      sut.renderingDefinition = {
        datasourceRootItems: [{ id: 'nonRootItem' }],
        templates: [{ id: '3', name: '3', displayName: '3', path: '' }],
      };

      sutFixture.detectChanges();

      const list = sutFixture.debugElement.queryAll(By.css('ng-spd-list button'));
      expect(list.length).toBe(2);

      expect((list[0].nativeElement as HTMLElement).textContent).toBe(' 1');
      expect((list[1].nativeElement as HTMLElement).textContent).toBe(' 2');
    });
  });
});
