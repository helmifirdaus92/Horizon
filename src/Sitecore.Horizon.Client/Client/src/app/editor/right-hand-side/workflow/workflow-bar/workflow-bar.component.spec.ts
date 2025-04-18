/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { VersionsWorkflowService } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import {
  ContextServiceTesting,
  ContextServiceTestingModule,
  DEFAULT_TEST_CONTEXT,
} from 'app/shared/client-state/context.service.testing';
import { WorkflowCommand } from 'app/shared/graphql/item.interface';
import { nextTick, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ReplaySubject, Subject } from 'rxjs';
import { WorkflowConfirmationDialogService } from '../workflow-confirmation-dialog/workflow-confirmation-dialog.service';
import { WorkflowNotificationService } from '../workflow-notification.service';
import { getTestItem, getTestItemWithNoWorkflow } from '../workflow.test.utils';
import { WorkflowBarComponent } from './workflow-bar.component';

@Component({
  selector: `<app-publish-button></app-publish-button>`,
})
class PublishButtonStubComponent {}

describe('WorkflowBarComponent', () => {
  let component: WorkflowBarComponent;
  let fixture: ComponentFixture<WorkflowBarComponent>;

  let workflowNotificationServiceSpy: jasmine.SpyObj<WorkflowNotificationService>;
  let workflowConfirmationDialogService: jasmine.SpyObj<WorkflowConfirmationDialogService>;
  let versionsWorkflowServiceSpy: jasmine.SpyObj<VersionsWorkflowService>;
  let contextService: ContextServiceTesting;

  let versionsAndWorkflowContext$: ReplaySubject<Partial<any>>;
  let confirmationDialogResult$: Subject<any>;

  function getPublishBtn(): DebugElement {
    return fixture.debugElement.query(By.css('app-publish-button'));
  }

  function getActionsBtn(): DebugElement {
    return fixture.debugElement.query(By.css('#workflowActionsBtn'));
  }

  function executeCommand(command: WorkflowCommand) {
    component.executeCommand(command);
    fixture.detectChanges();
  }

  function clickCommandButton(index: number) {
    const commandButtons = fixture.debugElement.queryAll(By.css('button[ngSpdListItem]'));
    commandButtons[index].triggerEventHandler('click', new MouseEvent('click'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkflowBarComponent, PublishButtonStubComponent],
      imports: [
        CommonModule,
        ButtonModule,
        ContextServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        PopoverModule,
        ListModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: VersionsWorkflowService,
          useValue: jasmine.createSpyObj<VersionsWorkflowService>(['watchVersionsAndWorkflow', 'executeCommand']),
        },
        {
          provide: WorkflowConfirmationDialogService,
          useValue: jasmine.createSpyObj<WorkflowConfirmationDialogService>(['show']),
        },
        {
          provide: WorkflowNotificationService,
          useValue: jasmine.createSpyObj<WorkflowNotificationService>(['showExecuteCommandErrorNotification']),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    versionsAndWorkflowContext$ = new ReplaySubject<Partial<any>>();
    confirmationDialogResult$ = new Subject<any>();

    workflowNotificationServiceSpy = TestBedInjectSpy(WorkflowNotificationService);

    versionsWorkflowServiceSpy = TestBedInjectSpy(VersionsWorkflowService);
    versionsWorkflowServiceSpy.watchVersionsAndWorkflow.and.returnValue(versionsAndWorkflowContext$ as any);

    workflowConfirmationDialogService = TestBedInjectSpy(WorkflowConfirmationDialogService);
    workflowConfirmationDialogService.show.and.returnValue(confirmationDialogResult$ as any);

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideDefaultTestContext();

    versionsAndWorkflowContext$.next({ ...getTestItem() });

    fixture = TestBed.createComponent(WorkflowBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show workflow state badge', () => {
    const badge = fixture.debugElement.query(By.css('.workflow-state-badge'));
    expect(badge.nativeElement.innerText).toEqual('FOO');
  });

  describe('publish button', () => {
    it('should show  publish button and hide actions button when item has no workflow', () => {
      versionsAndWorkflowContext$.next({ ...getTestItemWithNoWorkflow() });
      fixture.detectChanges();

      expect(getPublishBtn()).toBeTruthy();
      expect(getActionsBtn()).toBeFalsy();
    });

    it('should show publish button and hide actions button when workflow state is not final', () => {
      versionsAndWorkflowContext$.next({
        ...getTestItem({ finalState: true }),
      });
      fixture.detectChanges();

      expect(getPublishBtn()).toBeTruthy();
      expect(getActionsBtn()).toBeFalsy();
    });
  });

  describe('disable actions button', () => {
    it('should disable actions button when cannot edit workflow', () => {
      versionsAndWorkflowContext$.next({ ...getTestItem({ canEdit: false }) });
      fixture.detectChanges();

      expect(getActionsBtn().nativeElement.disabled).toBeTruthy();
    });

    it('should disable actions button when workflow has no commands', () => {
      const testItem = getTestItem();
      if (testItem.workflow) {
        testItem.workflow.commands = [];
      }
      versionsAndWorkflowContext$.next(testItem);
      fixture.detectChanges();

      expect(getActionsBtn().nativeElement.disabled).toBeTruthy();
    });

    it('should disable actions button when workflow is in progress', () => {
      component.workflowInProgress = true;
      fixture.detectChanges();

      expect(getActionsBtn().nativeElement.disabled).toBeTruthy();
    });
  });

  it('should show drop down with workflow commands when click on workflow actions button', () => {
    (getActionsBtn().nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    const commandButtons = fixture.debugElement.queryAll(By.css('button[ngSpdListItem]'));
    expect(commandButtons.map((c) => c.nativeElement.innerText)).toEqual(['baz', 'lar']);
  });

  describe('execute command', () => {
    beforeEach(() => {
      (getActionsBtn().nativeElement as HTMLButtonElement).click();
      fixture.detectChanges();
    });

    it('should show confirmation dialog when suppressComment is disabled', () => {
      const command: WorkflowCommand = {
        id: 'command2',
        displayName: 'Reject',
        suppressComment: false,
      };

      executeCommand(command);

      expect(workflowConfirmationDialogService.show).toHaveBeenCalled();
    });

    it('should not show comment dialog if suppressComment is enabled', () => {
      const command: WorkflowCommand = {
        id: 'command3',
        displayName: 'Submit',
        suppressComment: true,
      };

      executeCommand(command);

      expect(workflowConfirmationDialogService.show).not.toHaveBeenCalled();
    });

    it('should execute command with an empty string as comment if suppressComment is enabled', async () => {
      const command: WorkflowCommand = {
        id: 'command4',
        displayName: 'Submit',
        suppressComment: true,
      };

      executeCommand(command);

      expect(versionsWorkflowServiceSpy.executeCommand).toHaveBeenCalledWith(
        'command4',
        '',
        jasmine.objectContaining(DEFAULT_TEST_CONTEXT),
      );
    });

    it('should not execute command when confirmation is canceled', () => {
      confirmationDialogResult$.next({ state: 'canceled' });
      fixture.detectChanges();

      expect(versionsWorkflowServiceSpy.executeCommand).not.toHaveBeenCalled();
    });

    it('should execute command when confirmation is submitted', () => {
      clickCommandButton(1);

      confirmationDialogResult$.next({
        state: 'submitted',
        comment: 'comment1',
      });

      fixture.detectChanges();

      expect(versionsWorkflowServiceSpy.executeCommand).toHaveBeenCalledWith(
        'faz',
        'comment1',
        jasmine.objectContaining(DEFAULT_TEST_CONTEXT),
      );
    });

    it('should show error when execute command fails when confirmation is submitted', async () => {
      clickCommandButton(1);

      versionsWorkflowServiceSpy.executeCommand.and.returnValue(Promise.resolve({ error: 'error1' }) as any);
      confirmationDialogResult$.next({
        state: 'submitted',
        comment: 'comment1',
      });
      fixture.detectChanges();
      await nextTick();

      expect(workflowNotificationServiceSpy.showExecuteCommandErrorNotification).toHaveBeenCalled();
    });
  });
});
