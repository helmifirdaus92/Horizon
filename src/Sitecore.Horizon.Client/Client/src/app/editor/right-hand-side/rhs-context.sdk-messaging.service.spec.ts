/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */


import { TestBed } from '@angular/core/testing';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import {
  MessagingContract,
  MessagingEventsEmitterChannel,
  MessagingRpcProvider,
  MessagingRpcServicesImplementation,
} from '@sitecore/page-composer-sdk';
import { nextTick, TestBedInjectSpy } from 'app/testing/test.utils';
import { NEVER, Observable, of, Subject } from 'rxjs';
import {
  PropertiesPanelContext,
  PropertiesPanelContextContractName,
  PropertiesPanelContextEvents,
  PropertiesPanelContextRpc,
} from 'sdk/contracts/properties-panel-context.contract';
import { RhsContextSdkMessagingService } from './rhs-context.sdk-messaging.service';

describe('RhsContextSdkMessagingService', () => {
  let sut: RhsContextSdkMessagingService;
  let globalMessagingSpy: jasmine.SpyObj<NgGlobalMessaging>;
  let eventEmitterSpy: MessagingEventsEmitterChannel<PropertiesPanelContextEvents>;
  let rpcProviderSpy: MessagingRpcProvider;

  beforeEach(() => {
    eventEmitterSpy = jasmine.createSpyObj({ disconnect: undefined, emit: undefined });
    rpcProviderSpy = jasmine.createSpyObj<MessagingRpcProvider>({ disconnect: undefined });

    TestBed.configureTestingModule({
      providers: [
        RhsContextSdkMessagingService,
        {
          provide: NgGlobalMessaging,
          useValue: jasmine.createSpyObj<NgGlobalMessaging>({
            createRpc: rpcProviderSpy,
            createEventEmitter: eventEmitterSpy,
          }),
        },
      ],
    }).compileComponents();

    globalMessagingSpy = TestBedInjectSpy(NgGlobalMessaging);
    sut = TestBed.inject(RhsContextSdkMessagingService);
  });

  it('should create', () => {
    expect(sut).toBeDefined();
  });

  it('should return latest value via RPC', async () => {
    const [contract, rpcImpl] = globalMessagingSpy.createRpc.calls.mostRecent().args as [
      MessagingContract<unknown, unknown>,
      MessagingRpcServicesImplementation<PropertiesPanelContextRpc>,
    ];

    sut.observeContextChanges(of({ itemId: 'old-test-id' }, { itemId: 'new-test-id' }));

    expect(contract.name).toBe(PropertiesPanelContextContractName);
    await expectAsync(rpcImpl.getContext()).toBeResolvedTo({ itemId: 'new-test-id' });
  });

  it('should not resolve RPC while value is unknown', async () => {
    const [, rpcImpl] = globalMessagingSpy.createRpc.calls.mostRecent().args as [
      MessagingContract<unknown, unknown>,
      MessagingRpcServicesImplementation<PropertiesPanelContextRpc>,
    ];

    sut.observeContextChanges(NEVER);

    const result = rpcImpl.getContext() as Promise<unknown>;
    let hasResult = false;
    result.then(
      () => (hasResult = true),
      () => (hasResult = true),
    );
    await nextTick();
    expect(hasResult).toBeFalse();
  });

  it('should notify about context item change', () => {
    const context$ = new Subject<PropertiesPanelContext>();
    sut.observeContextChanges(context$);

    context$.next({ itemId: 'initial-item-id' });
    context$.next({ itemId: 'new-item-id' });

    expect(eventEmitterSpy.emit).toHaveBeenCalledWith('change', { itemId: 'initial-item-id' });
    expect(eventEmitterSpy.emit).toHaveBeenCalledWith('change', { itemId: 'new-item-id' });
  });

  it('should not notify about change if context is same', () => {
    const context$ = new Subject<PropertiesPanelContext>();
    sut.observeContextChanges(context$);

    context$.next({ itemId: 'new-item-id' });
    context$.next({ itemId: 'new-item-id' });
    context$.next({ itemId: 'new-item-id' });

    expect(eventEmitterSpy.emit).toHaveBeenCalledTimes(1);
  });

  describe('destroy', () => {
    it('should unsubscribe from observed contexts', () => {
      const unsubscribeSpy1 = jasmine.createSpy();
      const unsubscribeSpy2 = jasmine.createSpy();
      const source1$ = new Observable<PropertiesPanelContext>((_subscriber) => unsubscribeSpy1);
      const source2$ = new Observable<PropertiesPanelContext>((_subscriber) => unsubscribeSpy2);

      sut.observeContextChanges(source1$);
      sut.observeContextChanges(source2$);
      sut.ngOnDestroy();

      expect(unsubscribeSpy1).toHaveBeenCalled();
      expect(unsubscribeSpy2).toHaveBeenCalled();
    });

    it('should close event emitter on destroy', () => {
      sut.ngOnDestroy();

      expect(eventEmitterSpy.disconnect).toHaveBeenCalled();
    });

    it('should close RPC service on destroy', () => {
      sut.ngOnDestroy();

      expect(rpcProviderSpy.disconnect).toHaveBeenCalled();
    });
  });
});
