/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PlatformRef, Testability, TestabilityRegistry } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgGlobalTestabilityGetter, TestabilitySource } from './ng-global-testability-getter';

describe(NgGlobalTestabilityGetter.name, () => {
  let sut: NgGlobalTestabilityGetter;
  let platformRefSpy: jasmine.SpyObj<PlatformRef>;
  let windowStub: ReturnType<typeof NgGlobalTestabilityGetter.getWindow>;
  let testabilityRegistrySpy: jasmine.SpyObj<TestabilityRegistry>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NgGlobalTestabilityGetter,
        {
          provide: PlatformRef,
          useValue: jasmine.createSpyObj<PlatformRef>({ onDestroy: undefined }),
        },
      ],
    }).compileComponents();

    sut = TestBed.inject(NgGlobalTestabilityGetter);
    platformRefSpy = TestBed.inject(PlatformRef) as any;

    windowStub = {} as any;
    spyOn(NgGlobalTestabilityGetter, 'getWindow').and.returnValue(windowStub);

    testabilityRegistrySpy = jasmine.createSpyObj<TestabilityRegistry>({ getAllTestabilities: [] });
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('addToWindow()', () => {
    it('should init global functions', () => {
      sut.addToWindow(testabilityRegistrySpy);

      expect(windowStub.FED_UI_TESTABILITY_SOURCES).toBeDefined();
      expect(windowStub.getAllAngularTestabilities).toBeDefined();
      expect(windowStub.getAllNgGlobalTestabilities).toBeDefined();
    });

    it('should return all testabilities from global functions', () => {
      const testability1 = jasmine.createSpyObj<Testability>({ isStable: true });
      const testability2 = jasmine.createSpyObj<Testability>({ isStable: true });
      NgGlobalTestabilityGetter.initWindow();
      windowStub.FED_UI_TESTABILITY_SOURCES.push({ getTestabilities: () => [testability1] });
      testabilityRegistrySpy.getAllTestabilities.and.returnValue([testability2]);

      sut.addToWindow(testabilityRegistrySpy);

      expect(windowStub.getAllAngularTestabilities()).toEqual([testability1, testability2]);
      expect(windowStub.getAllNgGlobalTestabilities()).toEqual([testability1, testability2]);
    });

    it('should add testabilityToRegistry', () => {
      const testability = jasmine.createSpyObj<Testability>({ isStable: true });
      testabilityRegistrySpy.getAllTestabilities.and.returnValue([testability]);

      sut.addToWindow(testabilityRegistrySpy);

      expect(windowStub.FED_UI_TESTABILITY_SOURCES.length).toBe(1);
      expect(windowStub.FED_UI_TESTABILITY_SOURCES[0].getTestabilities()[0]).toBe(testability);
    });
  });

  describe('onPlatformDestroy', () => {
    it('should remove own provider', () => {
      const source1 = jasmine.createSpyObj<TestabilitySource>({ getTestabilities: [] });
      const source2 = jasmine.createSpyObj<TestabilitySource>({ getTestabilities: [] });
      const destroyCallback = platformRefSpy.onDestroy.calls.mostRecent().args[0];
      NgGlobalTestabilityGetter.initWindow();
      windowStub.FED_UI_TESTABILITY_SOURCES.push(source1, source2);

      sut.addToWindow(testabilityRegistrySpy);
      destroyCallback();

      expect(windowStub.FED_UI_TESTABILITY_SOURCES).toEqual([source1, source2]);
    });
  });
});
