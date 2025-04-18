/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { DroplistModule, PopoverModule, TabsModule } from '@sitecore/ng-spd-lib';
import { Device, DeviceService } from 'app/shared/client-state/device.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject } from 'rxjs';
import { ColumnAppendDialogService } from './column-append-dialog/column-append-dialog.service';
import { LayoutContainerDetailsComponent } from './layout-container-details.component';
import { LayoutContainerModel, LayoutContainerRenderingService } from './layout-container-rendering-service';
import { layoutTemplates } from './layout-size-templates';

describe('LayoutContainerDetailsComponent', () => {
  let component: LayoutContainerDetailsComponent;
  let fixture: ComponentFixture<LayoutContainerDetailsComponent>;
  let layoutContainerRenderingService: jasmine.SpyObj<LayoutContainerRenderingService>;
  let currentLayoutContainerModel$: BehaviorSubject<LayoutContainerModel>;
  let appendColumnDialogServiceSpy: jasmine.SpyObj<ColumnAppendDialogService>;
  let deviceServiceSpy: jasmine.SpyObj<DeviceService>;

  const layoutTemplateEls = () => fixture.debugElement.queryAll(By.css('.layout-template'));
  const activelayoutTemplateEl = () => fixture.debugElement.query(By.css('.layout-template.active'));
  const showMoreBtn = () => fixture.debugElement.query(By.css('.templates-toggle')).nativeElement as HTMLButtonElement;
  const settingsTabButton = () =>
    fixture.debugElement.query(By.css('[role="tab"][title="RHS.SUPER_LAYOUT.SETTINGS"]'))
      .nativeElement as HTMLButtonElement;
  const allignmentComponents = () => fixture.debugElement.queryAll(By.css('app-layout-alignment'));
  const widthDropListButton = () =>
    fixture.debugElement.query(By.css('.layout-container-settings .width-setting ng-spd-droplist button'))
      .nativeElement;
  const dropListItems = () =>
    fixture.debugElement.queryAll(By.css('ng-spd-droplist-item')).map((el) => el.nativeElement);
  const widthInput = () => fixture.debugElement.query(By.css('.width-input')).nativeNode as HTMLInputElement;
  const paddingSettingsEl = () => fixture.debugElement.query(By.css('app-padding-setting')) as DebugElement;
  const gapInput = () => fixture.debugElement.query(By.css('.gap-input')).nativeElement as HTMLInputElement;
  const stackDropListButton = () =>
    fixture.debugElement.query(By.css('.column-stack ng-spd-droplist button')).nativeElement;

  const gapUnitDropList = () => {
    const gapUnitDropList = fixture.debugElement.query(By.css('.gap button')).nativeElement;
    gapUnitDropList.click();
    fixture.detectChanges();
  };
  const widthUnitDropList = () => {
    const widthUnitDropList = fixture.debugElement.query(By.css('.width button')).nativeElement;
    widthUnitDropList.click();
    fixture.detectChanges();
  };
  const paddingUnitDropList = () => {
    const paddingUnitDropList = fixture.debugElement.query(By.css('.padding button')).nativeElement;
    paddingUnitDropList.click();
    fixture.detectChanges();
  };

  const mockDevices: Device[] = [
    {
      id: 'mobile',
      name: 'Mobile',
      width: '370',
      stackBreakpoint: 'sm',
      icon: 'mdi-cellphone',
      type: 'fixed',
    },
    {
      id: 'tablet',
      name: 'Tablet Portrait',
      width: '768',
      stackBreakpoint: 'md',
      icon: 'mdi-tablet mdi-rotate-90',
      type: 'fixed',
    },
  ];

  beforeEach(async () => {
    currentLayoutContainerModel$ = new BehaviorSubject<LayoutContainerModel>({
      layoutTemplateKey: '1/2-1/2',
      columns: [
        { size: 'basis-1-2', direction: 'horizontal', wrap: false, position: 'center-center' },
        { size: 'basis-1-2', direction: 'horizontal', wrap: false, position: 'center-center' },
      ],
      stackBreakpoint: '',
      containerStyles: {
        width: { value: 1000, unit: 'px' },
        gap: { value: 0, unit: 'px' },
        padding: { value: { top: 10, right: 20, bottom: 30, left: 40 }, unit: 'px' },
      },
    });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        PopoverModule,
        TabsModule,
        TranslateModule,
        TranslateServiceStubModule,
        FormsModule,
        DroplistModule,
        NoopAnimationsModule,
      ],
      declarations: [LayoutContainerDetailsComponent],
      providers: [
        {
          provide: LayoutContainerRenderingService,
          useValue: jasmine.createSpyObj<LayoutContainerRenderingService>(
            'LayoutContainerRenderingService',
            [
              'initFromRendering',
              'updateLayoutTemplate',
              'updateContainerStyles',
              'updateColumnLayout',
              'getRenderingsInsideRemovingColumn',
              'updateColumnStackBreakpoint',
            ],
            {
              layoutContainerModel$: currentLayoutContainerModel$,
            },
          ),
        },
        {
          provide: ColumnAppendDialogService,
          useValue: jasmine.createSpyObj<ColumnAppendDialogService>('ColumnAppendDialogService', [
            'showColumnAppendDialog',
          ]),
        },
        {
          provide: DeviceService,
          useValue: jasmine.createSpyObj<DeviceService>('DeviceService', ['getDevicesInfo']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutContainerDetailsComponent);
    component = fixture.componentInstance;
    component.chrome = { renderingInstanceId: 'test' } as any;
    component.baseFactor = 10;
    fixture.detectChanges();

    layoutContainerRenderingService = TestBedInjectSpy(LayoutContainerRenderingService);
    appendColumnDialogServiceSpy = TestBedInjectSpy(ColumnAppendDialogService);
    deviceServiceSpy = TestBedInjectSpy(DeviceService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a short list of templates', () => {
    const basicLayoutTemplatesTitles = layoutTemplates.slice(0, 4).map((template) => template.title);
    const showedTemplatesTitles = layoutTemplateEls().map((el) => el.attributes.title);

    expect(showedTemplatesTitles).toEqual(basicLayoutTemplatesTitles);
  });

  it('should show a full list of templates when Show more button is clicked', () => {
    showMoreBtn().click();
    fixture.detectChanges();
    const layoutTemplatesTitles = layoutTemplates.map((template) => template.title);
    const showedTemplatesTitles = layoutTemplateEls().map((el) => el.attributes.title);

    expect(showedTemplatesTitles).toEqual(layoutTemplatesTitles);
  });

  it('should highlight active template', () => {
    const activeTemplateElTitle = activelayoutTemplateEl()?.attributes.title;

    expect(activeTemplateElTitle).toEqual('½ - ½');
  });

  describe('seletctTemplate', () => {
    it('should show a dialog if new newEnabledColumn < currentColumnCount and removing column has content', async () => {
      layoutContainerRenderingService.getRenderingsInsideRemovingColumn.and.returnValue(
        Promise.resolve([
          {
            instanceId: '123',
            id: '456',
            placeholderKey: 'placeholder1',
            dataSource: 'ds1',
            parameters: { param1: 'value1' },
          },
        ]),
      );

      layoutTemplateEls()[0].nativeElement.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(appendColumnDialogServiceSpy.showColumnAppendDialog).toHaveBeenCalled();
      expect(appendColumnDialogServiceSpy.showColumnAppendDialog).toHaveBeenCalledWith(2, 1, '1/1');
    });

    it('should not show a dialog if new newEnabledColumn < currentColumnCount and removing column has no content', async () => {
      layoutContainerRenderingService.getRenderingsInsideRemovingColumn.and.returnValue(Promise.resolve([]));

      layoutTemplateEls()[0].nativeElement.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(appendColumnDialogServiceSpy.showColumnAppendDialog).not.toHaveBeenCalled();
    });

    it('should not show a dialog if new newEnabledColumn > currentColumnCount', async () => {
      layoutTemplateEls()[3].nativeElement.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(appendColumnDialogServiceSpy.showColumnAppendDialog).not.toHaveBeenCalled();
    });

    it('should change a template if new newEnabledColumn > currentColumnCount', async () => {
      layoutContainerRenderingService.getRenderingsInsideRemovingColumn.and.returnValue(Promise.resolve([]));

      layoutTemplateEls()[3].nativeElement.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(layoutContainerRenderingService.updateLayoutTemplate).toHaveBeenCalledWith('1/4-1/4-1/4-1/4');
    });
  });

  it('should change a template when click on a template', async () => {
    layoutContainerRenderingService.getRenderingsInsideRemovingColumn.and.returnValue(Promise.resolve([]));

    layoutTemplateEls()[3].nativeElement.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(layoutContainerRenderingService.updateLayoutTemplate).toHaveBeenCalledWith('1/4-1/4-1/4-1/4');
  });

  describe('Settings tab', () => {
    beforeEach(() => {
      settingsTabButton().click();
      fixture.detectChanges();
    });

    it('should show a content alignment component for each column', () => {
      expect(allignmentComponents().length).toEqual(2);
    });

    it('should change gap of a container', () => {
      gapInput().click();
      gapInput().value = '100';
      gapInput().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(layoutContainerRenderingService.updateContainerStyles).toHaveBeenCalledWith({
        gap: { value: 100, unit: 'px' },
      } as any);
    });

    it('should set a limited width when select it in the width drop down', () => {
      widthDropListButton().click();
      fixture.detectChanges();
      dropListItems()[1].click();
      fixture.detectChanges();

      expect(layoutContainerRenderingService.updateContainerStyles).toHaveBeenCalledWith({
        width: { value: 1000, unit: 'px' },
      } as any);
    });

    it('should change a limited width using the width input', () => {
      currentLayoutContainerModel$.next({
        ...currentLayoutContainerModel$.value,
        containerStyles: { ...currentLayoutContainerModel$.value.containerStyles, width: { value: 1000, unit: 'px' } },
      });
      fixture.detectChanges();

      widthInput().value = '800';
      widthInput().dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(layoutContainerRenderingService.updateContainerStyles).toHaveBeenCalledWith({
        width: { value: 800, unit: 'px' },
      } as any);
    });

    it('should change colum stack breakpoint using the stack drop down', async () => {
      deviceServiceSpy.getDevicesInfo.and.returnValue(Promise.resolve({ devices: mockDevices, default: 'mobile' }));
      await fixture.whenStable();

      stackDropListButton().click();
      fixture.detectChanges();
      dropListItems()[1].click();
      fixture.detectChanges();

      expect(layoutContainerRenderingService.updateColumnStackBreakpoint).toHaveBeenCalledWith('md');
    });

    it('should set a padding to a padding setting component', () => {
      expect(paddingSettingsEl().properties.top).toEqual(
        currentLayoutContainerModel$.value.containerStyles.padding.value.top,
      );
      expect(paddingSettingsEl().properties.right).toEqual(
        currentLayoutContainerModel$.value.containerStyles.padding.value.right,
      );
      expect(paddingSettingsEl().properties.bottom).toEqual(
        currentLayoutContainerModel$.value.containerStyles.padding.value.bottom,
      );
      expect(paddingSettingsEl().properties.left).toEqual(
        currentLayoutContainerModel$.value.containerStyles.padding.value.left,
      );
    });

    it('should change a respective padding style when padding settings component emits change', () => {
      paddingSettingsEl().triggerEventHandler('submitSetting', { position: 'left', value: 100 });
      fixture.detectChanges();
      expect(layoutContainerRenderingService.updateContainerStyles).toHaveBeenCalledWith({
        padding: { value: { top: 10, right: 20, bottom: 30, left: 100 }, unit: 'px' },
      } as any);
    });

    describe('Columns layout', () => {
      it('should send a column layout  to a layout alignmnet component for each column', () => {
        for (let i = 0; i < currentLayoutContainerModel$.value.columns.length; i++) {
          expect(allignmentComponents()[i].properties.direction).toEqual(
            currentLayoutContainerModel$.value.columns[i].direction,
          );
          expect(allignmentComponents()[i].properties.isWrapped).toEqual(
            currentLayoutContainerModel$.value.columns[i].wrap,
          );
          expect(allignmentComponents()[i].properties.position).toEqual(
            currentLayoutContainerModel$.value.columns[i].position,
          );
        }
      });

      it('should change a column direction from layout alignmnet component', () => {
        allignmentComponents()[1].triggerEventHandler('directionChanged', 'vertical');
        fixture.detectChanges();
        expect(layoutContainerRenderingService.updateColumnLayout).toHaveBeenCalledWith(
          {
            direction: 'vertical',
            wrap: false,
          } as any,
          1,
        );
      });

      it('should change a column wrap from layout alignmnet component', () => {
        allignmentComponents()[1].triggerEventHandler('isWrappedChanged', true);
        fixture.detectChanges();
        expect(layoutContainerRenderingService.updateColumnLayout).toHaveBeenCalledWith(
          {
            wrap: true,
          } as any,
          1,
        );
      });

      it('should change a column wrap from layout alignmnet component', () => {
        allignmentComponents()[1].triggerEventHandler('positionChanged', 'top-right');
        fixture.detectChanges();
        expect(layoutContainerRenderingService.updateColumnLayout).toHaveBeenCalledWith(
          {
            position: 'top-right',
          } as any,
          1,
        );
      });
    });

    describe('Handle unit update', () => {
      it('should update gap value on unit change from px to rem', async () => {
        currentLayoutContainerModel$.next({
          ...currentLayoutContainerModel$.value,
          containerStyles: { ...currentLayoutContainerModel$.value.containerStyles, gap: { value: 100, unit: 'px' } },
        });
        fixture.detectChanges();

        gapUnitDropList();

        const gapUnitDropListItem = fixture.debugElement.queryAll(By.css('ng-spd-droplist-item'));
        gapUnitDropListItem[1].nativeElement.click();
        fixture.detectChanges();

        expect(layoutContainerRenderingService.updateContainerStyles).toHaveBeenCalledWith({
          gap: { value: 10, unit: 'rem' },
        } as any);
      });

      it('should update gap value on unit change from rem to px', async () => {
        currentLayoutContainerModel$.next({
          ...currentLayoutContainerModel$.value,
          containerStyles: { ...currentLayoutContainerModel$.value.containerStyles, gap: { value: 10, unit: 'rem' } },
        });
        fixture.detectChanges();

        gapUnitDropList();

        const gapUnitDropListItem = fixture.debugElement.queryAll(By.css('ng-spd-droplist-item'));
        gapUnitDropListItem[0].nativeElement.click();
        fixture.detectChanges();

        expect(layoutContainerRenderingService.updateContainerStyles).toHaveBeenCalledWith({
          gap: { value: 100, unit: 'px' },
        } as any);
      });

      it('should update width value on unit change from px to rem', async () => {
        currentLayoutContainerModel$.next({
          ...currentLayoutContainerModel$.value,
          containerStyles: {
            ...currentLayoutContainerModel$.value.containerStyles,
            width: { value: 999, unit: 'px' },
          },
        });
        fixture.detectChanges();

        widthUnitDropList();

        const widthUnitDropListItem = fixture.debugElement.queryAll(By.css('ng-spd-droplist-item'));
        widthUnitDropListItem[1].nativeElement.click();
        fixture.detectChanges();

        expect(layoutContainerRenderingService.updateContainerStyles).toHaveBeenCalledWith({
          width: { value: 99.9, unit: 'rem' },
        } as any);
      });

      it('should update width value on unit change from rem to px', async () => {
        currentLayoutContainerModel$.next({
          ...currentLayoutContainerModel$.value,
          containerStyles: {
            ...currentLayoutContainerModel$.value.containerStyles,
            width: { value: 99.9, unit: 'rem' },
          },
        });
        fixture.detectChanges();

        widthUnitDropList();

        const widthUnitDropListItem = fixture.debugElement.queryAll(By.css('ng-spd-droplist-item'));
        widthUnitDropListItem[0].nativeElement.click();
        fixture.detectChanges();

        expect(layoutContainerRenderingService.updateContainerStyles).toHaveBeenCalledWith({
          width: { value: 999, unit: 'px' },
        } as any);
      });

      it('should update padding value on unit change from px to rem', async () => {
        currentLayoutContainerModel$.next({
          ...currentLayoutContainerModel$.value,
          containerStyles: {
            ...currentLayoutContainerModel$.value.containerStyles,
            padding: { value: { top: 10, right: 20, bottom: 30, left: 40 }, unit: 'px' },
          },
        });
        fixture.detectChanges();

        paddingUnitDropList();

        const widthUnitDropListItem = fixture.debugElement.queryAll(By.css('ng-spd-droplist-item'));
        widthUnitDropListItem[1].nativeElement.click();
        fixture.detectChanges();

        expect(layoutContainerRenderingService.updateContainerStyles).toHaveBeenCalledWith({
          padding: { value: { top: 1, right: 2, bottom: 3, left: 4 }, unit: 'rem' },
        } as any);
      });

      it('should update padding value on unit change from rem to px', async () => {
        currentLayoutContainerModel$.next({
          ...currentLayoutContainerModel$.value,
          containerStyles: {
            ...currentLayoutContainerModel$.value.containerStyles,
            padding: { value: { top: 2, right: 3, bottom: 4, left: 5 }, unit: 'rem' },
          },
        });
        fixture.detectChanges();

        paddingUnitDropList();

        const widthUnitDropListItem = fixture.debugElement.queryAll(By.css('ng-spd-droplist-item'));
        widthUnitDropListItem[0].nativeElement.click();
        fixture.detectChanges();

        expect(layoutContainerRenderingService.updateContainerStyles).toHaveBeenCalledWith({
          padding: { value: { top: 20, right: 30, bottom: 40, left: 50 }, unit: 'px' },
        } as any);
      });
    });
  });
});
