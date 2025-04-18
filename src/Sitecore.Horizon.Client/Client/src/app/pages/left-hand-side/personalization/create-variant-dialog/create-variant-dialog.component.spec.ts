/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By, DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  DialogCloseHandle,
  DialogModule,
  InputLabelModule,
  LoadingIndicatorModule,
} from '@sitecore/ng-spd-lib';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { NotificationsModule } from 'app/shared/notifications/notifications.module';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import {
  StaticConfigurationServiceStub,
  StaticConfigurationServiceStubModule,
} from 'app/testing/static-configuration-stub';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { PersonalizationAPIServiceDisconnected } from '../personalization-api/personalization.api.disconnected';
import { PersonalizationAPIService } from '../personalization-api/personalization.api.service';
import { PersonalizationNotificationsService } from '../personalization-services/personalization.notifications.service';
import { BXPersonalizationFlowDefinition } from '../personalization.types';
import { StepperModule } from '../stepper/stepper.module';
import { CreateVariantDialogComponent } from './create-variant-dialog.component';
import { VariantNameValidatorDirective } from './validate-variant-name.directive';

describe(CreateVariantDialogComponent.name, () => {
  let sut: CreateVariantDialogComponent;
  let fixture: ComponentFixture<CreateVariantDialogComponent>;
  let de: DebugElement;

  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let personalizationAPI: PersonalizationAPIServiceDisconnected;
  let staticConfigurationServiceStub: StaticConfigurationServiceStub;

  const url = 'https://sample-app-url.com/#/embedded/';

  const findIframe = (): HTMLIFrameElement => {
    return de.query(By.css('iframe')).nativeElement;
  };

  const closeBtn = (): HTMLButtonElement => {
    return de.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  };

  const cancelBtn = (): HTMLButtonElement => {
    return de.query(By.css('ng-spd-dialog-actions button.outlined')).nativeElement;
  };

  const saveButton = (): HTMLButtonElement => {
    return de.query(By.css('button.primary')).nativeElement;
  };

  const inputEl = (): HTMLInputElement => {
    return de.query(By.css('#variant-name')).nativeElement;
  };

  const nextBtn = () => de.query(By.css('button:nth-child(2)')).nativeElement;

  const validationErrors = () => de.query(By.css('.error-block'))?.nativeElement?.innerText?.trim() || null;

  const dialogHeader = () => {
    return de.query(By.css('.header')).nativeElement;
  };

  const getDefaultPersonalizationFlowDefinition = (): Partial<BXPersonalizationFlowDefinition> => {
    return {
      siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
      ref: 'ref',
      friendlyId: '123_1',
      traffic: {
        type: 'audienceTraffic',
        weightingAlgorithm: 'USER_DEFINED',
        splits: [
          {
            variantId: 'variant2-en',
            template: '{"variantId":"variantId"}',
            variantName: 'Visitor from Oslo',
            audienceName: 'User has visited home page',
            conditionGroups: [],
          },
        ],
      },
      triggers: [],
    };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateVariantDialogComponent, VariantNameValidatorDirective],
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        DialogCloseHandleStubModule,
        DialogModule,
        ButtonModule,
        LoadingIndicatorModule,
        InputLabelModule,
        FormsModule,
        StepperModule,
        NotificationsModule,
        StaticConfigurationServiceStubModule,
      ],
      providers: [
        {
          provide: PersonalizationAPIService,
          useClass: PersonalizationAPIServiceDisconnected,
          useValue: jasmine.createSpyObj<PersonalizationAPIServiceDisconnected>(
            'PersonalizationAPIServiceDisconnected',
            ['addUpdateVariantToFlowDefinition', 'archiveFlowDefinition'],
          ),
        },
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: PersonalizationNotificationsService,
          useValue: jasmine.createSpyObj<PersonalizationNotificationsService>('PersonalizationNotificationsServices', [
            'showVariantAlreadyExistsNotification',
            'showVariantNameExceedLimitNotification',
            'stopShowingNotifications',
          ]),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateVariantDialogComponent);
    sut = fixture.componentInstance;
    de = fixture.debugElement;

    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    personalizationAPI = TestBed.inject(PersonalizationAPIService) as PersonalizationAPIServiceDisconnected;
    staticConfigurationServiceStub = TestBed.inject(StaticConfigurationServiceStub);

    ConfigurationService.cdpTenant = {
      id: '789',
      name: 'cdtenant',
      displayName: 'cdtenant1',
      organizationId: 'test-org',
      apiUrl: 'http://cdp.com',
      appUrl: 'https://sample-app-url.com',
      analyticsAppUrl: '',
    };

    ConfigurationService.xmCloudTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'test-org',
      url: 'http://cm.com',
      gqlEndpointUrl: 'http://cm.com/graph',
      cdpEmbeddedTenantId: '123',
      customerEnvironmentType: 'prd',
      environmentId: '321',
      environmentName: 'prodev',
      projectId: '12',
      projectName: 'proj',
    };

    sut.isConnectedMode = true;
    sut.variantId = 'variantId';
    sut.variantName = 'name';
    sut.dialogSteps$.next('createVariant');
    sut.flowDefinition = getDefaultPersonalizationFlowDefinition() as BXPersonalizationFlowDefinition;
    fixture.detectChanges();
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
    ConfigurationService.cdpTenant = null;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('init', () => {
    it('should set the "iframeIsLoading" to true', () => {
      expect(sut.iframeIsLoading).toBeTrue();
    });

    it('should encode the variant name', () => {
      const spy = spyOn(window, 'encodeURIComponent');

      sut.ngOnInit();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledOnceWith('name?');
    });

    it('should set the iframe url to the specified edit variant url', () => {
      sut.dialogSteps$.next('editVariant');
      spyOn(window, 'encodeURIComponent').and.returnValue('%name%');

      sut.ngOnInit();
      fixture.detectChanges();

      expect(findIframe().src).toBe(
        `${url}123_1/variantId?pageVariantName=%name%&xmTenantId=123&organization=test-org`,
      );
    });

    it('should pass the correct env to iframe in staging', () => {
      staticConfigurationServiceStub.auth0Settings.domain = 'pages-staging';
      sut.dialogSteps$.next('editVariant');
      spyOn(window, 'encodeURIComponent').and.returnValue('name');

      sut.ngOnInit();
      fixture.detectChanges();

      expect(findIframe().src).toBe(
        `${url}123_1/variantId?pageVariantName=name&xmTenantId=123&organization=test-org&env=staging`,
      );
    });

    it('should pass the correct env to iframe in pre prod', () => {
      staticConfigurationServiceStub.auth0Settings.domain = 'pages-beta';
      sut.dialogSteps$.next('editVariant');
      spyOn(window, 'encodeURIComponent').and.returnValue('name');

      sut.ngOnInit();
      fixture.detectChanges();

      expect(findIframe().src).toBe(
        `${url}123_1/variantId?pageVariantName=name&xmTenantId=123&organization=test-org&env=pre-production`,
      );
    });

    it('should not pass env param to iframe if not staging and pre-prod', () => {
      staticConfigurationServiceStub.auth0Settings.domain = 'pages-cloud';
      sut.dialogSteps$.next('editVariant');
      spyOn(window, 'encodeURIComponent').and.returnValue('name');

      sut.ngOnInit();
      fixture.detectChanges();

      expect(findIframe().src).toBe(`${url}123_1/variantId?pageVariantName=name&xmTenantId=123&organization=test-org`);
    });

    it('should sanitize the url', () => {
      const sanitizer = TestBed.inject(DomSanitizer);
      const spy = spyOn(sanitizer, 'bypassSecurityTrustResourceUrl');
      spyOn(window, 'encodeURIComponent').and.returnValue('%name%');

      sut.ngOnInit();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(
        `${url}123_1/variantId?pageVariantName=%name%&xmTenantId=123&organization=test-org`,
      );
    });
  });

  describe('create variant action', () => {
    it('should show create variant name dialog if create action is [createVariant]', () => {
      sut.dialogSteps$.next('createVariant');
      fixture.detectChanges();

      const variantDialog = fixture.debugElement.query(By.css('.variant-dialog')).nativeElement;

      expect(variantDialog).toBeDefined();
    });

    it('should emit null if dialog closed', async () => {
      sut.dialogSteps$.next('createVariant');
      const onCreateSpy = createSpyObserver();
      sut.onCreate.subscribe(onCreateSpy);
      inputEl().value = 'Visitor from Oslo';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      closeBtn().click();
      fixture.detectChanges();

      expect(onCreateSpy.next).toHaveBeenCalledOnceWith(null);
    });

    it('should show create audience dialog when create action is [createAudience] or [editVariant]', () => {
      sut.dialogSteps$.next('createAudience');
      fixture.detectChanges();

      expect(findIframe()).toBeDefined();

      sut.dialogSteps$.next('editVariant');
      fixture.detectChanges();
      expect(findIframe()).toBeDefined();
    });

    it('should update dialog header title when action is create and edit variant', () => {
      sut.dialogSteps$.next('createVariant');
      fixture.detectChanges();
      expect(dialogHeader().innerText).toBe('PERSONALIZATION.CREATE_PAGE_VARIANT');

      sut.dialogSteps$.next('editVariant');
      fixture.detectChanges();
      expect(dialogHeader().innerText).toBe('PERSONALIZATION.EDIT_AUDIENCE');
    });

    describe('Variant name validation', () => {
      describe('WHEN value is invalid', () => {
        it('should disable next button and NOT show error WHEN input is not touched', () => {
          sut.dialogSteps$.next('createVariant');

          sut.variantName = '';
          fixture.detectChanges();

          expect(nextBtn().disabled).toBeTruthy();
          expect(validationErrors()).toBe(null);
        });

        describe('Min length', () => {
          it('should show error and disable next button', () => {
            sut.dialogSteps$.next('createVariant');
            fixture.detectChanges();

            inputEl().value = '';
            inputEl().dispatchEvent(new Event('input'));

            fixture.detectChanges();

            expect(nextBtn().disabled).toBeTruthy();
            expect(validationErrors()).toBe('PERSONALIZATION.EMPTY_VARIANT_NAME');
          });
        });

        describe('Max length', () => {
          it('should show error and disable next button', () => {
            sut.dialogSteps$.next('createVariant');
            fixture.detectChanges();

            inputEl().value = 'exceeds length of 255 characters'.repeat(10);
            inputEl().dispatchEvent(new Event('input'));

            fixture.detectChanges();

            expect(nextBtn().disabled).toBeTruthy();
            expect(validationErrors()).toBe('PERSONALIZATION.ERROR_LENGTH_LIMIT');
          });
        });

        describe('Invalid characters', () => {
          it('should show error and disable next button', () => {
            sut.dialogSteps$.next('createVariant');
            fixture.detectChanges();

            inputEl().value = 'value!value';
            inputEl().dispatchEvent(new Event('input'));

            fixture.detectChanges();

            expect(nextBtn().disabled).toBeTruthy();
            expect(validationErrors()).toBe('PERSONALIZATION.ERROR_CHARACTERS_VALIDATION');
          });
        });

        describe('Variant name is already in use', () => {
          it('should show error and disable next button', () => {
            sut.dialogSteps$.next('createVariant');
            fixture.detectChanges();

            inputEl().value = 'Visitor from Oslo';
            inputEl().dispatchEvent(new Event('input'));

            fixture.detectChanges();

            expect(nextBtn().disabled).toBeTruthy();
            expect(validationErrors()).toBe('PERSONALIZATION.API_ERRORS.ERROR_VARIANT_NAME_EXISTS');
          });
        });
      });
    });
  });

  describe('iframe load complete', () => {
    it('should set the "iframeIsLoading" to false', () => {
      // arrange
      sut.dialogSteps$.next('createAudience');
      fixture.detectChanges();
      // act
      findIframe().dispatchEvent(new Event('load'));

      // assert
      expect(sut.iframeIsLoading).toBeFalse();
    });
  });

  describe('close dialog', () => {
    describe('AND dialogStep is `createVariant`', () => {
      it('should close the dialog when "X" button is clicked', () => {
        sut.dialogSteps$.next('createAudience');

        closeBtn().click();
        fixture.detectChanges();

        expect(closeHandle.close).toHaveBeenCalled();
      });

      it('should close the dialog when `Cancel` button is clicked', () => {
        cancelBtn().click();
        fixture.detectChanges();

        expect(closeHandle.close).toHaveBeenCalled();
      });

      describe('AND dialogStep is `createAudience`', () => {
        it('should emit the [variantId, variantName] and close the dialog when "Close" button is clicked', () => {
          sut.dialogSteps$.next('createAudience');
          const onCreateSpy = createSpyObserver();
          sut.onCreate.subscribe(onCreateSpy);
          fixture.detectChanges();

          closeBtn().click();

          expect(onCreateSpy.next).toHaveBeenCalledOnceWith({ id: 'variantId', name: 'name' });
          expect(closeHandle.close).toHaveBeenCalled();
        });
      });
    });

    it('should close the dialog when press "Escape"', () => {
      // arrange
      const spy = spyOn(sut, 'close');
      const preventSpy = jasmine.createSpy();
      const event = { preventDefault: preventSpy, code: 'Escape' } as any;

      // act
      sut.onKeydownHandler(event);

      // assert
      expect(preventSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('disconnected mode', () => {
    it('should show input element and save button in disconnected mode', () => {
      sut.isConnectedMode = false;
      sut.dialogSteps$.next('createAudience');
      fixture.detectChanges();

      expect(saveButton()).toBeTruthy();
      expect(inputEl()).toBeTruthy();
    });

    it('should add variant to local flow definition', async () => {
      // arrange
      sut.isConnectedMode = false;
      sut.dialogSteps$.next('createAudience');
      fixture.detectChanges();

      // act
      inputEl().value = 'new audience';
      inputEl().dispatchEvent(new Event('input'));

      saveButton().click();
      fixture.detectChanges();

      // assert
      expect(personalizationAPI.addUpdateVariantToFlowDefinition).toHaveBeenCalledWith({
        audienceName: 'new audience',
        variantId: 'variantId',
        variantName: 'name',
        template: '{"variantId":"variantId"}',
        conditionGroups: [],
      });
    });

    describe('when closing the dialog', () => {
      it('should archive flowDefinition if traffic splits length is 0', async () => {
        // Arrange
        sut.flowDefinition!.traffic.splits = [];
        sut.dialogSteps$.next('createVariant');

        // Act
        closeBtn().click();
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert
        expect(personalizationAPI.archiveFlowDefinition).toHaveBeenCalled();
        expect(closeHandle.close).toHaveBeenCalled();
      });

      it('should not archive flowDefinition if traffic splits length is not 0', async () => {
        // Arrange
        sut.dialogSteps$.next('createVariant');

        // Act
        closeBtn().click();
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert
        expect(personalizationAPI.archiveFlowDefinition).not.toHaveBeenCalled();
        expect(closeHandle.close).toHaveBeenCalled();
      });
    });
  });
});
