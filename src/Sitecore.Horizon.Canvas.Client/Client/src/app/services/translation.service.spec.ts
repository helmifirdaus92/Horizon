/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { TranslationChannelDef } from '../messaging/horizon-canvas.contract.defs';
import {
  TranslationCanvasEvents,
  TranslationCanvasRpcServices,
  TranslationHorizonEvents,
  TranslationHorizonRpcServices,
  TranslationSource,
} from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { findTranslationInSource, TranslationService } from './translation.service';

describe(TranslationService.name, () => {
  let sut: TranslationService;

  let getTranslationsSpy: jasmine.Spy;
  let messaging: TestMessagingP2PChannel<
    TranslationHorizonEvents,
    TranslationCanvasEvents,
    TranslationHorizonRpcServices,
    TranslationCanvasRpcServices
  >;

  const testTranslationSource = {
    i1: '1',
  };

  beforeEach(() => {
    getTranslationsSpy = jasmine.createSpy('getTranslationsSpy');
    getTranslationsSpy.and.callFake(async () => testTranslationSource);
    messaging = makeTestMessagingP2PChannelFromDef(TranslationChannelDef, {
      getTranslations: getTranslationsSpy,
    });

    sut = new TranslationService({ translationChannel: messaging } as unknown as MessagingService);
  });

  describe('init', () => {
    it('should fetch translations', async () => {
      await sut.init();

      expect(getTranslationsSpy).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return result', async () => {
      await sut.init();

      expect(TranslationService.get('i1')).toBe('1');
    });
  });
});

describe(findTranslationInSource.name, () => {
  describe('WHEN source OR key are INVALID', () => {
    it('should return key ', () => {
      let key = 'key';
      // eslint-disable-next-line prefer-const
      let source: TranslationSource | undefined;
      expect(findTranslationInSource(key, source)).toBe(key);

      key = '';
      source = { ONE: 'One' };
      expect(findTranslationInSource(key, source)).toBe(key);
    });
  });

  describe('WHEN source AND key are VALID', () => {
    it('should return value or key', () => {
      const source = {
        /* eslint-disable quote-props */
        i1: '1',
        i2: '2',
        i3: {
          i31: '31',
          i32: {
            i321: {
              i3211: '3211',
            },
          },
        },
        'i4.i4.i4': '4',
      };

      expect(findTranslationInSource('i1', source)).toBe('1');
      expect(findTranslationInSource('i2', source)).toBe('2');
      expect(findTranslationInSource('i3', source)).toBe('i3');
      expect(findTranslationInSource('i3.i31', source)).toBe('31');
      expect(findTranslationInSource('i3.i32', source)).toBe('i3.i32');
      expect(findTranslationInSource('i3.i32.i321', source)).toBe('i3.i32.i321');
      expect(findTranslationInSource('i3.i32.i321.i3211', source)).toBe('3211');
      expect(findTranslationInSource('i4.i4.i4', source)).toBe('4');
    });
  });
});
