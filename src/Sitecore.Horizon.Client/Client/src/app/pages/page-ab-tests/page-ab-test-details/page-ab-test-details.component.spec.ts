/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { TabsModule } from '@sitecore/ng-spd-lib';
import { mockComponentFlowDefinition } from 'app/editor/right-hand-side/test-component/ab-test-component.utils';
import { EditingChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
  PlaceholderChromeInfo,
  RenderingFieldsdData,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ComponentFlowDefinitionWithPublishedStatus } from '../page-ab-tests-dialog.component';
import { AbTestAnalyticsService } from '../services/ab-test-analytics.service';
import { PageAbTestDetailsComponent } from './page-ab-test-details.component';

@Component({
  selector: `<app-page-ab-test-performancee></app-page-ab-test-performance>`,
})
class PageAbTestPerformanceStubComponent {
  @Input() pageAbTest: ComponentFlowDefinitionWithPublishedStatus;
}

@Component({
  selector: `<app-page-ab-test-configuration></app-page-ab-test-configuration>`,
})
class PageAbTestConfigurationStubComponent {
  @Input() pageAbTest: ComponentFlowDefinitionWithPublishedStatus;
}

describe(PageAbTestDetailsComponent.name, () => {
  let sut: PageAbTestDetailsComponent;
  let fixture: ComponentFixture<PageAbTestDetailsComponent>;

  let editingTestChannel: TestMessagingP2PChannel<
    EditingCanvasEvents,
    EditingHorizonEvents,
    EditingCanvasRpcServices,
    EditingHorizonRpcServices
  >;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TabsModule,
        TranslateModule,
        TranslateServiceStubModule,
        StaticConfigurationServiceStubModule,
        DatePipe,
      ],
      declarations: [
        PageAbTestDetailsComponent,
        PageAbTestPerformanceStubComponent,
        PageAbTestConfigurationStubComponent,
      ],
      providers: [
        {
          provide: AbTestAnalyticsService,
          useValue: jasmine.createSpyObj<AbTestAnalyticsService>(['openAnalytics']),
        },
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>('MessagingService', ['getEditingCanvasChannel']),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    editingTestChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, {
      updatePageState: () => {},
      selectChrome: () => {},
      deselectChrome: () => {},
      highlightPartialDesign: () => {},
      unhighlightPartialDesign: () => {},
      getChildRenderings: () => [],
      getChildPlaceholders: () => [{ placeholderKey: '/content/phOnRendering1' } as PlaceholderChromeInfo],
      selectRendering: () => {},
      getRenderingFields: () => ({}) as RenderingFieldsdData,
      getPageFields: () => [],
    });

    const messaging = TestBedInjectSpy(MessagingService);
    messaging.getEditingCanvasChannel.and.returnValue(editingTestChannel);

    fixture = TestBed.createComponent(PageAbTestDetailsComponent);
    sut = fixture.componentInstance;
    sut.pageAbTest = { ...mockComponentFlowDefinition, isPagePublished: true };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
