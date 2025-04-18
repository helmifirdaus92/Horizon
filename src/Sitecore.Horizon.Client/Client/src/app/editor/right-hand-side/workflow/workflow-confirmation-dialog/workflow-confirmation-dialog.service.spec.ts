/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { WorkflowConfirmationDialogComponent } from './workflow-confirmation-dialog.component';
import { WorkflowConfirmationDialogService } from './workflow-confirmation-dialog.service';

describe('WorkflowConfirmationDialogService', () => {
  let sut: WorkflowConfirmationDialogService;
  let overlayServiceSpy: jasmine.SpyObj<DialogOverlayService>;
  let componentSpy: jasmine.SpyObj<WorkflowConfirmationDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkflowConfirmationDialogService,
        { provide: DialogOverlayService, useValue: jasmine.createSpyObj('DialogOverlayService', ['open']) },
      ],
    });
    overlayServiceSpy = TestBedInjectSpy(DialogOverlayService);
    componentSpy = jasmine.createSpyObj('WorkflowConfirmationDialogComponent', [], {
      onClose: new EventEmitter<{ state: 'canceled' | 'submitted'; comment: string }>(),
    });
    overlayServiceSpy.open.and.returnValue({ component: componentSpy } as any);

    sut = TestBedInjectSpy(WorkflowConfirmationDialogService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should open the dialog overlay with the WorkflowConfirmationDialogComponent', () => {
    sut.show();

    expect(overlayServiceSpy.open).toHaveBeenCalledWith(WorkflowConfirmationDialogComponent, { size: 'AutoHeight' });
  });

  it('should return the onClose observable of the WorkflowConfirmationDialogComponent', () => {
    const result = sut.show();

    expect(result).toBe(componentSpy.onClose);
  });
});
