/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { MessagingRpcServicesClient } from '@sitecore/page-composer-sdk';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { Context } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ItemChangeService } from 'app/shared/client-state/item-change-service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { Item } from 'app/shared/graphql/item.interface';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { filter, firstValueFrom } from 'rxjs';
import { EditingCanvasRpc } from 'sdk';
import { LayoutSwitchService, SET_LAYOUT_EDITING_KIND_MUTATION } from './layout-switch.service';

const INITIAL_CONTEXT: Context = {
  itemId: 'foo',
  itemVersion: 1,
  variant: undefined,
  language: 'en',
  siteName: 'test.com',
};

describe(LayoutSwitchService.name, () => {
  let sut: LayoutSwitchService;
  let contextService: ContextServiceTesting;
  let itemChangeService: ItemChangeService;
  let apolloTestingController: ApolloTestingController;
  let globalMessaging: Partial<NgGlobalMessaging>;
  let rpcServiceSpy: jasmine.SpyObj<MessagingRpcServicesClient<EditingCanvasRpc>>;
  let itemWithlayoutEditingKind: Promise<Item>;

  beforeEach(() => {
    globalMessaging = {
      async getRpc(_contract) {
        return rpcServiceSpy as MessagingRpcServicesClient<any>;
      },
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ItemChangeService,
          useValue: jasmine.createSpyObj<ItemChangeService>(['notifyChange']),
        },
        {
          provide: NgGlobalMessaging,
          useValue: globalMessaging,
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>({ isSiteParameterSupportedForSetLayoutType: true }),
        },
        LayoutSwitchService,
      ],
      imports: [ApolloTestingModule, ContextServiceTestingModule],
    });

    rpcServiceSpy = jasmine.createSpyObj('rpcServiceSpy', {
      reload: async () => {},
    });

    sut = TestBed.inject(LayoutSwitchService);
    apolloTestingController = TestBed.inject(ApolloTestingController);
    contextService = TestBed.inject(ContextServiceTesting);
    itemChangeService = TestBed.inject(ItemChangeService);
    globalMessaging = TestBedInjectSpy(NgGlobalMessaging);
    itemWithlayoutEditingKind = Promise.resolve({ layoutEditingKind: 'SHARED' } as Item);
    spyOn(contextService, 'getItem').and.callFake(() => itemWithlayoutEditingKind);

    contextService.provideTestValue(INITIAL_CONTEXT);
  });

  it('should update layout editing kind when context is changed', async () => {
    // Arrange
    itemWithlayoutEditingKind = Promise.resolve({ layoutEditingKind: 'FINAL' } as Item);
    contextService.provideTestValue({ itemVersion: 3 });

    // Act
    const result = await firstValueFrom(sut.layoutEditingKind$.pipe(filter((l) => !!l && l === 'FINAL')));

    // Assert
    expect(result).toBe('FINAL');
  });

  it('should reset a layout kind when switch between sites', async () => {
    // Arrange
    itemWithlayoutEditingKind = new Promise(() => {});
    contextService.provideTestValue({ siteName: 'newSite' });

    // Act
    const result = await firstValueFrom(sut.layoutEditingKind$);

    // Assert
    expect(result).toBe(undefined);
  });

  it('should force page reload if layout kind is different after item switch', async () => {
    // Arrange
    const reloadCanvasSpy = spyOn<any>(sut, 'reloadCanvas');
    itemWithlayoutEditingKind = Promise.resolve({ layoutEditingKind: 'FINAL' } as Item);
    contextService.provideTestValue({ itemId: 'id123' });

    // Act
    await firstValueFrom(sut.layoutEditingKind$.pipe(filter((l) => !!l && l === 'FINAL')));

    // Assert
    expect(reloadCanvasSpy).toHaveBeenCalled();
  });

  it('should not reload a page when layout kind changes after a site change', async () => {
    // Arrange
    const reloadCanvasSpy = spyOn<any>(sut, 'reloadCanvas');
    await sut.getLayoutEditingKind();
    itemWithlayoutEditingKind = Promise.resolve({ layoutEditingKind: 'FINAL' } as Item);
    contextService.provideTestValue({ siteName: 'newSite' });

    // Act
    await firstValueFrom(sut.layoutEditingKind$.pipe(filter((l) => !!l && l === 'FINAL')));

    // Assert
    expect(reloadCanvasSpy).not.toHaveBeenCalled();
  });

  it('getLayoutEditingKind should return the layout kind from getItem', async () => {
    // Arrange
    itemWithlayoutEditingKind = Promise.resolve({ layoutEditingKind: 'FINAL' } as Item);
    contextService.provideTestValue({ siteName: 'newSite' });
    await firstValueFrom(sut.layoutEditingKind$.pipe(filter((l) => l !== 'SHARED')));

    // Act
    const result = await sut.getLayoutEditingKind();

    // Assert
    expect(result).toBe('FINAL');
  });

  describe('setLayoutEditingKind', () => {
    it('should set layout editing kind successfully and update context', fakeAsync(() => {
      sut.setLayoutEditingKind('FINAL');
      tick();

      const op = apolloTestingController.expectOne(SET_LAYOUT_EDITING_KIND_MUTATION);
      op.flush({
        data: { setLayoutEditingKind: { success: true } },
      });
      tick();

      expect(op.operation.variables).toEqual({
        input: {
          kind: 'FINAL',
          site: 'test.com',
        },
      });
      expect(itemChangeService.notifyChange).toHaveBeenCalledWith(INITIAL_CONTEXT.itemId, [
        'layout',
        'layoutEditingKind',
      ]);
      flush();
    }));
  });
});
