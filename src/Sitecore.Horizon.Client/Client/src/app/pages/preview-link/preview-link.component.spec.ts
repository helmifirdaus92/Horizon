/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule } from '@sitecore/ng-spd-lib';
import { CanvasRenderingApiService } from 'app/shared/canvas/canvas-rendering-api.service';
import { CanvasUrlBuilder } from 'app/shared/canvas/url-builder';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { Item } from 'app/shared/graphql/item.interface';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { PreviewLinkComponent } from './preview-link.component';

const url = 'http://www.example.com/';

const Initial_Context = {
  itemId: 'itemId2',
  itemVersion: 1,
  language: 'lang1',
  siteName: 'website1',
  variant: 'abc',
  deviceLayoutId: '',
};

describe(PreviewLinkComponent.name, () => {
  let sut: PreviewLinkComponent;
  let fixture: ComponentFixture<PreviewLinkComponent>;
  let contextService: ContextServiceTesting;
  let canvasUrlBuilder: jasmine.SpyObj<CanvasUrlBuilder>;
  const messagingSyncEmitSpy = jasmine.createSpy();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        IconButtonModule,
        AppLetModule,
      ],
      declarations: [PreviewLinkComponent],
      providers: [
        {
          provide: CanvasUrlBuilder,
          useValue: jasmine.createSpyObj<CanvasUrlBuilder>({ buildPreviewModeUrl: Promise.resolve(url) }),
        },
        {
          provide: CanvasRenderingApiService,
          useValue: jasmine.createSpyObj<CanvasRenderingApiService>({
            fetchPageRendering: Promise.resolve('htmlPreviewPage001'),
          }),
        },
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>({
            getEditingCanvasChannel: { syncEmit: messagingSyncEmitSpy } as any,
          }),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(async () => {
    canvasUrlBuilder = TestBedInjectSpy(CanvasUrlBuilder);
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(Initial_Context);
    spyOn(contextService, 'getItem').and.resolveTo({ route: 'mockRoute' } as Item);
    messagingSyncEmitSpy.and.resolveTo({});

    fixture = TestBed.createComponent(PreviewLinkComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  describe('build preview mode url', () => {
    it('should build preview Url from initial context', fakeAsync(() => {
      // arrange
      const spy = createSpyObserver();
      sut.previewUrl$!.subscribe(spy);

      // act
      fixture.detectChanges();
      tick();

      // assert
      expect(spy.next).toHaveBeenCalledWith(url);
      expect(canvasUrlBuilder.buildPreviewModeUrl).toHaveBeenCalledTimes(1);
      expect(canvasUrlBuilder.buildPreviewModeUrl).toHaveBeenCalledWith(Initial_Context, 'mockRoute');
      flush();
    }));

    it('should build a new preview Url on context change', fakeAsync(() => {
      // arrange
      //spy on contextService.getItem() and return a mock item with a route

      const spy = createSpyObserver();
      sut.previewUrl$!.subscribe(spy);

      // act
      contextService.setTestVariant('new variant');
      fixture.detectChanges();
      tick();

      // assert
      expect(spy.next).toHaveBeenCalledWith(url);
      expect(canvasUrlBuilder.buildPreviewModeUrl).toHaveBeenCalledTimes(2);
      expect(canvasUrlBuilder.buildPreviewModeUrl).toHaveBeenCalledWith(Initial_Context, 'mockRoute');
      expect(canvasUrlBuilder.buildPreviewModeUrl).toHaveBeenCalledWith(
        {
          itemId: Initial_Context.itemId,
          itemVersion: Initial_Context.itemVersion,
          language: Initial_Context.language,
          siteName: Initial_Context.siteName,
          variant: 'new variant',
          deviceLayoutId: Initial_Context.deviceLayoutId,
        },
        'mockRoute',
      );
      flush();
    }));

    it('should open preview mode page in a new browser tab', fakeAsync(() => {
      spyOn(window, 'open').and.callFake(() => {
        return {} as any;
      });

      fixture.detectChanges();
      tick();

      // act
      const previewLink = fixture.debugElement.query(By.css('[icon=eye-outline]')).nativeElement as HTMLLinkElement;
      previewLink.click();

      fixture.detectChanges();
      tick();

      // assert
      expect(window.open).toHaveBeenCalled();
      expect(messagingSyncEmitSpy).toHaveBeenCalledOnceWith('sc-mode-cookie:set', Object({ scMode: 'preview' }));
      flush();
    }));
  });
});
