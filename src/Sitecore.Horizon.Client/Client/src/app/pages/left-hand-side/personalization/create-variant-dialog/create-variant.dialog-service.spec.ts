/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { BehaviorSubject } from 'rxjs';
import { BXPersonalizationFlowDefinition } from '../personalization.types';
import { Steps } from '../stepper/stepper.component';
import { CreateVariantDialogComponent } from './create-variant-dialog.component';
import { CreateVariantDialogService } from './create-variant-dialog.service';

describe(CreateVariantDialogService.name, () => {
  let sut: CreateVariantDialogService;
  let dialogOverlayServiceSpy: jasmine.SpyObj<DialogOverlayService>;

  const getDefaultPersonalizationFlowDefinition = (): Partial<BXPersonalizationFlowDefinition> => {
    return {
      siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
      ref: 'ref',
      friendlyId: '123_1',
      traffic: {
        type: 'audienceTraffic',
        weightingAlgorithm: 'USER_DEFINED',
        splits: [],
      },
    };
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DialogOverlayService,
          useValue: jasmine.createSpyObj<DialogOverlayService>(['open']),
        },
      ],
    });
    dialogOverlayServiceSpy = TestBedInjectSpy(DialogOverlayService);
    sut = TestBed.inject(CreateVariantDialogService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should call open() of given service', () => {
    // arrange
    dialogOverlayServiceSpy.open.and.returnValue({ component: {} } as any);

    // act
    sut.show({ action: '', flowDefinition: null, variantId: '' });

    // assert
    expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
  });

  it('should set flowDefinition,variantId and action of the component as returned by the service.open()', () => {
    // arrange
    const componentObj: Partial<CreateVariantDialogComponent> = { variantId: '', flowDefinition: null };

    const variantId = 'testId';
    const flowDefinition = getDefaultPersonalizationFlowDefinition() as BXPersonalizationFlowDefinition;

    dialogOverlayServiceSpy.open.and.returnValue({ component: componentObj } as any);

    // act
    sut.show({ variantId, flowDefinition });

    // assert
    expect(componentObj.variantId).toEqual('testId');
    expect(componentObj.flowDefinition).toEqual(flowDefinition);
  });

  it('should set createVariantSteps of the component based on actions type in service', () => {
    const componentObj: Partial<CreateVariantDialogComponent> = {
      variantId: '',
      flowDefinition: null,
      dialogSteps$: new BehaviorSubject<Steps | null>(null),
    };

    dialogOverlayServiceSpy.open.and.returnValue({ component: componentObj } as any);

    sut.show({ variantId: '', flowDefinition: null, action: 'createVariant' });
    expect(componentObj.dialogSteps$?.value).toBe('createVariant');

    sut.show({ variantId: '', flowDefinition: null, action: 'editVariant' });
    expect(componentObj.dialogSteps$?.value).toBe('editVariant');
  });
});
