/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ItemChange, ItemChangeService } from 'app/shared/client-state/item-change-service';
import { BaseItemDalService, ItemDalService } from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { PlaceholderChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { createSpyObserver } from 'app/testing/test.utils';
import { BehaviorSubject, firstValueFrom, NEVER, of, Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { CanvasServices, ChromeSelectEvent } from '../shared/canvas.services';
import { CanvasSelectionContext, EditorRhsService } from './editor-rhs.service';

describe(EditorRhsService.name, () => {
  let canvasServices_chromeSelect$: BehaviorSubject<ChromeSelectEvent>;
  let itemDalServiceSpy: jasmine.SpyObj<ItemDalService>;
  let itemChangeServiceSpy: jasmine.SpyObj<ItemChangeService>;
  let contextServiceTesting: ContextServiceTesting;
  let canvasServicesSpy: jasmine.SpyObj<CanvasServices>;
  let sut: EditorRhsService;

  beforeEach(() => {
    canvasServices_chromeSelect$ = new BehaviorSubject<ChromeSelectEvent>({
      selection: undefined,
      eventSource: undefined,
    });
    canvasServicesSpy = jasmine.createSpyObj<CanvasServices>({}, { chromeSelect$: canvasServices_chromeSelect$ });

    itemDalServiceSpy = jasmine.createSpyObj<ItemDalService>({
      getItemDisplayName: NEVER,
      getItem: NEVER,
    });
    itemChangeServiceSpy = jasmine.createSpyObj<ItemChangeService>({
      watchForChanges: NEVER,
    });

    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        { provide: CanvasServices, useValue: canvasServicesSpy },
        { provide: BaseItemDalService, useValue: itemDalServiceSpy },
        { provide: ItemChangeService, useValue: itemChangeServiceSpy },

        EditorRhsService,
      ],
    });

    contextServiceTesting = TestBed.inject(ContextServiceTesting);
    contextServiceTesting.provideDefaultTestContext();

    sut = TestBed.inject(EditorRhsService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('watchContext', () => {
    it('should return information from context and item service', async () => {
      contextServiceTesting.setTestItemId('item-id-from-context');
      const placeholderChrome: PlaceholderChromeInfo = {
        chromeId: 'ph_1',
        chromeType: 'placeholder',
        name: 'test-placeholder-name',
        placeholderKey: 'test-ph-key',
        displayName: 'test-placeholder-displayName',
        allowedRenderingIds: [],
        contextItem: {
          id: 'test-item-id',
          language: 'lang',
          version: 1,
        },
      };
      canvasServices_chromeSelect$.next({
        selection: { chrome: placeholderChrome, messaging: {} as any },
        eventSource: undefined,
      });

      const result = await firstValueFrom(sut.watchSelectionContext().pipe(first()));

      expect(result.displayName).toBe('test-placeholder-displayName');
      expect(result.itemId).toBe('test-item-id');
    });

    it('should re-fetch information on item change', fakeAsync(() => {
      itemDalServiceSpy.getItem.and.returnValue(of({ id: 'test-item-id', name: 'test-item-from-service-name' } as any));
      const itemChanges$ = new Subject<ItemChange>();
      itemChangeServiceSpy.watchForChanges.and.returnValue(itemChanges$);
      spyOn(contextServiceTesting, 'getItem').and.resolveTo({ displayName: 'displayName' } as Item);
      contextServiceTesting.setTestItemId('test-item-id');
      const contextStreamSpy = createSpyObserver<CanvasSelectionContext>();

      sut.watchSelectionContext().subscribe(contextStreamSpy);
      tick();

      itemChanges$.next({ itemId: 'test-item-id', scopes: ['workflow'] });
      tick();

      expect(contextStreamSpy.next).toHaveBeenCalledTimes(2);
      flush();
    }));
  });

  describe('watchCanWrite()', () => {
    it('should return [canWrite] information from item service ', fakeAsync(() => {
      const permissions = { canWrite: true };
      const spy = jasmine.createSpy('spy');
      spyOn(contextServiceTesting, 'getItem').and.resolveTo({ permissions } as Item);

      sut.watchCanWrite().subscribe(spy);
      tick();

      expect(spy).toHaveBeenCalledWith(permissions.canWrite);
      flush();
    }));
  });
});
