/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { A11yModule } from '@angular/cdk/a11y';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, CheckboxModule, IconButtonModule, ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { VersionsWorkflowService } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { VariantPublishedStatusService } from 'app/pages/left-hand-side/personalization/personalization-services/variant-published-status.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { PublishingService } from 'app/shared/graphql/publishing.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { nextTick, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EMPTY, ReplaySubject, Subject } from 'rxjs';
import { WorkflowNotificationService } from '../workflow-notification.service';
import { getTestItem } from '../workflow.test.utils';
import { PublishButtonComponent } from './publish-button.component';

describe('PublishButtonComponent', () => {
  let component: PublishButtonComponent;
  let fixture: ComponentFixture<PublishButtonComponent>;
  let workflowNotificationServiceSpy: jasmine.SpyObj<WorkflowNotificationService>;
  let publishingService: jasmine.SpyObj<PublishingService>;
  let versionsWorkflowServiceSpy: jasmine.SpyObj<VersionsWorkflowService>;
  let contextService: ContextServiceTesting;
  let pageLiveStatusServiceSpy: jasmine.SpyObj<VariantPublishedStatusService>;
  let siteServiceSpy: jasmine.SpyObj<SiteService>;

  let versionsAndWorkflowContext$: ReplaySubject<Partial<any>>;
  let publishing$: Subject<any>;
  let trackingpublish$: Subject<any>;

  function getPublishOptionsBtn(): DebugElement {
    return fixture.debugElement.query(By.css('.btn-main'));
  }

  function getPublishPageWithSubpagesCheckbox(): DebugElement | undefined {
    return fixture.debugElement
      .queryAll(By.css('ng-spd-checkbox'))
      .find((el) => el.nativeElement.innerText === 'EDITOR.WORKFLOW.PUBLISH_PAGE_WITH_SUBPAGES');
  }

  function getPublishPageWithLanguagesCheckbox(): DebugElement | undefined {
    return fixture.debugElement
      .queryAll(By.css('ng-spd-checkbox'))
      .find((el) => el.nativeElement.innerText === 'EDITOR.WORKFLOW.PUBLISH_PAGE_WITH_LANGUAGES');
  }

  function getPublishPageBtn(): DebugElement {
    return fixture.debugElement.query(By.css('.publish'));
  }

  function dispatchMouseEvent(): void {
    const contentBlockEl = fixture.debugElement.query(By.css('.content-wrapper')).nativeElement as HTMLElement;
    const event = new MouseEvent('mouseenter');
    contentBlockEl.dispatchEvent(event);
  }

  const messageEl = () => fixture.debugElement.query(By.css('.popover-dialog span')).nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublishButtonComponent],
      imports: [
        ButtonModule,
        ContextServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        PopoverModule,
        ListModule,
        NoopAnimationsModule,
        A11yModule,
        IconButtonModule,
        CheckboxModule,
      ],
      providers: [
        {
          provide: VersionsWorkflowService,
          useValue: jasmine.createSpyObj<VersionsWorkflowService>(['watchVersionsAndWorkflow', 'watchVersionsLoading']),
        },

        {
          provide: WorkflowNotificationService,
          useValue: jasmine.createSpyObj<WorkflowNotificationService>([
            'showOnPublishFailedNotification',
            'showSuccessNotification',
          ]),
        },
        {
          provide: PublishingService,
          useValue: jasmine.createSpyObj<PublishingService>('PublishingService', {
            getPublishingStatus: EMPTY,
            publishItem: EMPTY,
            watchPublishingStatus: EMPTY,
          }),
        },
        {
          provide: VariantPublishedStatusService,
          useValue: jasmine.createSpyObj<VariantPublishedStatusService>([
            'isPagePublished',
            'updateLivePageVariantsCheckStatus',
          ]),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('SiteService', {
            getSiteLanguages: [
              {
                name: 'uk-UA',
                displayName: 'Ukrainian',
                nativeName: 'Українська',
                iso: 'uk',
                englishName: 'Ukrainian (ukraine)',
              },
              { name: 'en', displayName: 'English', nativeName: 'English', iso: 'en', englishName: 'English' },
              { name: 'foo', displayName: 'foo', nativeName: 'foo', iso: 'bar', englishName: 'foo (bar)' },
            ],
          }),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    versionsAndWorkflowContext$ = new ReplaySubject<Partial<any>>();
    publishing$ = new Subject<any>();
    trackingpublish$ = new Subject<any>();

    workflowNotificationServiceSpy = TestBedInjectSpy(WorkflowNotificationService);

    versionsWorkflowServiceSpy = TestBedInjectSpy(VersionsWorkflowService);
    versionsWorkflowServiceSpy.watchVersionsAndWorkflow.and.returnValue(versionsAndWorkflowContext$ as any);

    publishingService = TestBedInjectSpy(PublishingService);
    publishingService.publishItem.and.returnValue(publishing$);
    publishingService.watchPublishingStatus.and.returnValue(trackingpublish$);

    pageLiveStatusServiceSpy = TestBedInjectSpy(VariantPublishedStatusService);
    siteServiceSpy = TestBedInjectSpy(SiteService);

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideDefaultTestContext();
    spyOn(contextService, 'getItem').and.resolveTo({ id: 'id1', displayName: 'Display name' } as any);

    versionsAndWorkflowContext$.next({ ...getTestItem() });

    fixture = TestBed.createComponent(PublishButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Publishing is disabled', () => {
    it('should be disabled and have proper title message when no publish permisions', () => {
      versionsAndWorkflowContext$.next(
        getTestItem({
          canPublish: false,
        }),
      );
      component.buttonState.title = 'EDITOR.WORKFLOW.NO_ACCESS_RIGHTS_TO_PUBLISH';
      fixture.detectChanges();

      dispatchMouseEvent();

      expect(getPublishOptionsBtn().nativeElement.disabled).toBeTruthy();
      expect(messageEl().innerText).toBe('EDITOR.WORKFLOW.NO_ACCESS_RIGHTS_TO_PUBLISH');
    });

    it('should be disabled and have proper title message when item is not publishable', () => {
      versionsAndWorkflowContext$.next(
        getTestItem({
          isPublishable: false,
        }),
      );
      component.buttonState.title = 'EDITOR.WORKFLOW.NOT_PUBLISHABLE_VERSION_WARNING_TEXT';
      fixture.detectChanges();

      dispatchMouseEvent();

      expect(getPublishOptionsBtn().nativeElement.disabled).toBeTruthy();
      expect(messageEl().innerText).toBe('EDITOR.WORKFLOW.NOT_PUBLISHABLE_VERSION_WARNING_TEXT');
    });

    it('should be disabled and have proper title message when item has no publishable versions', () => {
      versionsAndWorkflowContext$.next(
        getTestItem({
          hasPublishableVersion: false,
        }),
      );
      component.buttonState.title = 'EDITOR.WORKFLOW.NOT_PUBLISHABLE_VERSION_WARNING_TEXT';
      fixture.detectChanges();

      dispatchMouseEvent();

      expect(getPublishOptionsBtn().nativeElement.disabled).toBeTruthy();
      expect(messageEl().innerText).toBe('EDITOR.WORKFLOW.NOT_PUBLISHABLE_VERSION_WARNING_TEXT');
    });

    it('should be disabled and have proper title message when current version is not lates publishable', () => {
      versionsAndWorkflowContext$.next(
        getTestItem({
          isLatestPublishableVersion: false,
        }),
      );
      component.buttonState.title = 'EDITOR.WORKFLOW.NOT_LATEST_PUBLISHABLE';
      fixture.detectChanges();

      dispatchMouseEvent();

      expect(getPublishOptionsBtn().nativeElement.disabled).toBeTruthy();
      expect(messageEl().innerText).toContain('EDITOR.WORKFLOW.NOT_LATEST_PUBLISHABLE');
    });

    it('should be disabled and have Publshing name when publish is in progress', () => {
      versionsAndWorkflowContext$.next(getTestItem());
      component.publishInProgress = true;
      fixture.detectChanges();

      expect(getPublishOptionsBtn().nativeElement.disabled).toBeTruthy();
      expect(getPublishOptionsBtn().nativeElement.innerText).toEqual('EDITOR.WORKFLOW.PUBLISHING');
    });

    it('should show publish options when click on publish button', () => {
      (getPublishOptionsBtn().nativeElement as HTMLButtonElement).click();
      fixture.detectChanges();

      const publishButtons = fixture.debugElement.queryAll(By.css('ng-spd-checkbox'));
      expect(publishButtons.map((c) => c.nativeElement.innerText)).toEqual([
        'EDITOR.WORKFLOW.PUBLISH_PAGE',
        'EDITOR.WORKFLOW.PUBLISH_PAGE_WITH_SUBPAGES',
        'EDITOR.WORKFLOW.PUBLISH_PAGE_WITH_LANGUAGES',
      ]);
    });
  });

  describe('publish process', () => {
    const triggerPublishBtnClick = async () => {
      getPublishOptionsBtn().triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();
      getPublishPageBtn()?.triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();

      await nextTick();
    };

    const triggerPublishWithSubPagesBtnClick = async () => {
      getPublishOptionsBtn().triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();
      getPublishPageWithSubpagesCheckbox()?.triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();
      getPublishPageBtn()?.triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();

      await nextTick();
    };

    const triggerPublishWithLanguagesBtnClick = async () => {
      getPublishOptionsBtn().triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();
      getPublishPageWithLanguagesCheckbox()?.triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();
      getPublishPageBtn()?.triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();

      await nextTick();
    };

    const triggerPublishWithLanguagesAndSubpagesBtnClick = async () => {
      getPublishOptionsBtn().triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();
      getPublishPageWithSubpagesCheckbox()?.triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();
      getPublishPageWithLanguagesCheckbox()?.triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();
      getPublishPageBtn()?.triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();

      await nextTick();
    };

    it('should start publishing of the context page when publish button is clicked', async () => {
      await triggerPublishBtnClick();

      expect(component.publishInProgress).toBeTruthy();
      expect(publishingService.publishItem).toHaveBeenCalledWith(
        jasmine.objectContaining({
          rootItemId: 'foo1bar2-baz3-0000-aaaa-bbbbcccc1234',
          publishSubItems: false,
          languages: ['pt-BR'],
          publishRelatedItems: true,
          publishItemMode: 'SMART',
        }),
      );
    });

    it('should start publishing with subpages when subpage option is checked and publish button is clicked', async () => {
      await triggerPublishWithSubPagesBtnClick();

      expect(component.publishInProgress).toBeTruthy();
      expect(publishingService.publishItem).toHaveBeenCalledWith(
        jasmine.objectContaining({
          rootItemId: 'foo1bar2-baz3-0000-aaaa-bbbbcccc1234',
          languages: ['pt-BR'],
          publishSubItems: true,
          publishRelatedItems: true,
          publishItemMode: 'SMART',
        }),
      );
    });

    it('should start publishing with languages when language option is checked and publish button is clicked', async () => {
      await triggerPublishWithLanguagesBtnClick();

      expect(component.publishInProgress).toBeTruthy();
      expect(siteServiceSpy.getSiteLanguages).toHaveBeenCalled();
      expect(publishingService.publishItem).toHaveBeenCalledWith(
        jasmine.objectContaining({
          rootItemId: 'foo1bar2-baz3-0000-aaaa-bbbbcccc1234',
          languages: ['uk-UA', 'en', 'foo'],
          publishSubItems: false,
          publishRelatedItems: true,
          publishItemMode: 'SMART',
        }),
      );
    });

    it('should start publishing with languages and subpages when subpage and language options are checked and publish button is clicked', async () => {
      await triggerPublishWithLanguagesAndSubpagesBtnClick();

      expect(component.publishInProgress).toBeTruthy();
      expect(siteServiceSpy.getSiteLanguages).toHaveBeenCalled();
      expect(publishingService.publishItem).toHaveBeenCalledWith(
        jasmine.objectContaining({
          rootItemId: 'foo1bar2-baz3-0000-aaaa-bbbbcccc1234',
          languages: ['uk-UA', 'en', 'foo'],
          publishSubItems: true,
          publishRelatedItems: true,
          publishItemMode: 'SMART',
        }),
      );
    });

    it('should show error and stop publishing when publish request failed', async () => {
      await triggerPublishBtnClick();

      publishing$.next({ operationId: undefined });
      fixture.detectChanges();

      expect(component.publishInProgress).toBeFalsy();
      expect(workflowNotificationServiceSpy.showOnPublishFailedNotification).toHaveBeenCalledWith(
        'foo1bar2-baz3-0000-aaaa-bbbbcccc1234',
      );
    });

    describe('publish tracking', () => {
      const operationId = 'abc';

      it('should start tracking publishing with operationId when publish request is acknowledged', async () => {
        await triggerPublishBtnClick();
        publishing$.next({ operationId });
        fixture.detectChanges();

        expect(publishingService.watchPublishingStatus).toHaveBeenCalledWith(operationId);
      });

      it('should show error and stop publishing when publish tracking failed', async () => {
        await triggerPublishBtnClick();
        publishing$.next({ operationId });
        trackingpublish$.error('error');
        fixture.detectChanges();

        expect(component.publishInProgress).toBeFalsy();
        expect(workflowNotificationServiceSpy.showOnPublishFailedNotification).toHaveBeenCalledWith(
          'foo1bar2-baz3-0000-aaaa-bbbbcccc1234',
        );
      });

      it('should show success message and stop publishing when publish tracking return FINISHED status', async () => {
        await triggerPublishBtnClick();
        publishing$.next({ operationId });
        trackingpublish$.next({ isDone: true, isFailed: false, processed: 10, state: 'FINISHED' });
        fixture.detectChanges();

        expect(component.publishInProgress).toBeFalsy();
        expect(workflowNotificationServiceSpy.showSuccessNotification).toHaveBeenCalledWith(
          'foo1bar2-baz3-0000-aaaa-bbbbcccc1234',
          'Display name',
          undefined,
        );
      });

      it('should call watchLivePageVariants when publish tracking return FINISHED status', async () => {
        await triggerPublishBtnClick();
        publishing$.next({ operationId });
        trackingpublish$.next({ isDone: true, isFailed: false, processed: 10, state: 'FINISHED' });
        fixture.detectChanges();

        // Assert
        expect(pageLiveStatusServiceSpy.updateLivePageVariantsCheckStatus).toHaveBeenCalledWith(true);
      });

      it('should show success message with pages count and stop publishing when publish with subpages tracking return FINISHED status', async () => {
        await triggerPublishWithSubPagesBtnClick();
        publishing$.next({ operationId });
        trackingpublish$.next({ isDone: true, isFailed: false, processed: 10, state: 'FINISHED' });
        fixture.detectChanges();

        expect(component.publishInProgress).toBeFalsy();
        expect(workflowNotificationServiceSpy.showSuccessNotification).toHaveBeenCalledWith(
          'foo1bar2-baz3-0000-aaaa-bbbbcccc1234',
          'Display name',
          10,
        );
      });
    });
  });
});
