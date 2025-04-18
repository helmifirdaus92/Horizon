/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { DesigningService } from 'app/editor/designing/designing.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { Writable } from 'app/shared/utils/lang.utils';
import { Subject } from 'rxjs';
import {
  ComponentGalleryService,
  ComponentInfo,
  ComponentsResult,
  GET_ALL_COMPONENTS,
} from './component-gallery.service';

describe(ComponentGalleryService.name, () => {
  let sut: ComponentGalleryService;
  let designingService: jasmine.SpyObj<DesigningService>;
  let designingServiceRenderingIds: Subject<readonly string[]>;
  let apolloController: ApolloTestingController;
  let contextService: ContextServiceTesting;

  beforeEach(waitForAsync(() => {
    designingService = jasmine.createSpyObj<DesigningService>('designingService', ['init']);
    designingServiceRenderingIds = new Subject();
    (designingService as Writable<DesigningService>).droppableRenderingIds = designingServiceRenderingIds;

    TestBed.configureTestingModule({
      imports: [ApolloTestingModule, ContextServiceTestingModule],
      providers: [ComponentGalleryService, { provide: DesigningService, useValue: designingService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideDefaultTestContext();

    sut = TestBed.inject(ComponentGalleryService);
    apolloController = TestBed.inject(ApolloTestingController);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('watchComponents', () => {
    it('should return only allowed ungrouped renderings', fakeAsync(() => {
      let value: ComponentsResult | undefined;
      sut.watchComponents().subscribe((val) => (value = val));
      const allComponents: ComponentInfo[] = [
        { displayName: 'c1', iconUrl: 'u1', id: '8df3f3a7-0023-494c-8945-3d51b78c79cc', category: 'q1' },
        { displayName: 'c2', iconUrl: 'u2', id: '633F68C5-E944-4D93-8CED-4638B910DE21', category: 'q1' },
        { displayName: 'c3', iconUrl: 'u3', id: '349557d0-1e3f-4353-a13b-c1e4d2fb2b22', category: 'q1' },
      ];
      const componentsResult: ComponentsResult = {
        ungrouped: allComponents,
        groups: [],
      };
      const allowedRenderingIds = ['8DF3F3A70023494C89453D51B78C79CC', '349557D0-1E3F-4353-A13B-C1E4D2FB2B22'];
      const expectedResult = {
        ungrouped: [componentsResult.ungrouped[0], componentsResult.ungrouped[2]],
        groups: componentsResult.groups,
      };

      apolloController.expectOne(GET_ALL_COMPONENTS).flush({
        data: { components: componentsResult },
      });
      designingServiceRenderingIds.next(allowedRenderingIds);
      tick();

      expect(value).toEqual(expectedResult);
      flush();
    }));

    it('should return only allowed rendering groups', fakeAsync(() => {
      let value: ComponentsResult | undefined;
      sut.watchComponents().subscribe((val) => (value = val));
      const componentsResult: ComponentsResult = {
        ungrouped: [],
        groups: [
          {
            title: 'first',
            components: [
              { displayName: 'c1', iconUrl: 'u1', id: '8df3f3a7-0023-494c-8945-3d51b78c79cc', category: 'first' },
              { displayName: 'c2', iconUrl: 'u2', id: '633F68C5-E944-4D93-8CED-4638B910DE21', category: 'first' },
            ],
          },
          {
            title: 'second',
            components: [
              { displayName: 'c4', iconUrl: 'u4', id: '8b760fa3-1067-4bf8-ad16-09bc1b00007d', category: 'second' },
              { displayName: 'c3', iconUrl: 'u3', id: '349557d0-1e3f-4353-a13b-c1e4d2fb2b22', category: 'second' },
            ],
          },
        ],
      };
      const allowedRenderingIds = [
        '8DF3F3A70023494C89453D51B78C79CC',
        '349557D0-1E3F-4353-A13B-C1E4D2FB2B22',
        '8B760FA3-1067-4BF8-AD16-09BC1B00007D',
      ];
      const expectedResult = {
        ungrouped: componentsResult.ungrouped,
        groups: [
          {
            title: componentsResult.groups[0].title,
            components: [componentsResult.groups[0].components[0]],
          },
          {
            title: componentsResult.groups[1].title,
            components: [componentsResult.groups[1].components[0], componentsResult.groups[1].components[1]],
          },
        ],
      };

      apolloController.expectOne(GET_ALL_COMPONENTS).flush({
        data: { components: componentsResult },
      });
      designingServiceRenderingIds.next(allowedRenderingIds);
      tick();

      expect(value).toEqual(expectedResult);
      flush();
    }));

    it('should exclude a rendering group of none of its rendering is in allowed list', fakeAsync(() => {
      let value: ComponentsResult | undefined;
      const componentsResult: ComponentsResult = {
        ungrouped: [],
        groups: [
          {
            title: 'first',
            components: [
              { displayName: 'c1', iconUrl: 'u1', id: '8df3f3a7-0023-494c-8945-3d51b78c79cc', category: 'first' },
              { displayName: 'c2', iconUrl: 'u2', id: '633F68C5-E944-4D93-8CED-4638B910DE21', category: 'first' },
            ],
          },
          {
            title: 'second',
            components: [
              { displayName: 'c4', iconUrl: 'u4', id: '8b760fa3-1067-4bf8-ad16-09bc1b00007d', category: 'second' },
              { displayName: 'c3', iconUrl: 'u3', id: '349557d0-1e3f-4353-a13b-c1e4d2fb2b22', category: 'second' },
            ],
          },
        ],
      };
      const placeholderAllowedRenderingIds = [
        '349557D0-1E3F-4353-A13B-C1E4D2FB2B22',
        '8B760FA3-1067-4BF8-AD16-09BC1B00007D',
      ];
      const expectedResult = {
        ungrouped: componentsResult.ungrouped,
        groups: [
          {
            title: componentsResult.groups[1].title,
            components: [componentsResult.groups[1].components[0], componentsResult.groups[1].components[1]],
          },
        ],
      };

      sut.getPlaceholderAllowedComponents(placeholderAllowedRenderingIds).subscribe((val) => (value = val));
      apolloController.expectOne(GET_ALL_COMPONENTS).flush({
        data: { components: componentsResult },
      });
      tick();

      expect(value).toEqual(expectedResult);
      flush();
    }));

    it('should filter out repeated emissions', fakeAsync(() => {
      const spy = jasmine.createSpy();
      sut.watchComponents().subscribe((val) => spy(val));

      const allComponents: ComponentInfo[] = [
        { displayName: 'c1', iconUrl: 'u1', id: '8df3f3a7-0023-494c-8945-3d51b78c79cc', category: 'q1' },
        { displayName: 'c2', iconUrl: 'u2', id: '633F68C5-E944-4D93-8CED-4638B910DE21', category: 'q1' },
        { displayName: 'c3', iconUrl: 'u3', id: '349557d0-1e3f-4353-a13b-c1e4d2fb2b22', category: 'q1' },
      ];
      const componentsResult: ComponentsResult = {
        ungrouped: allComponents,
        groups: [],
      };
      const allowedRenderingIds = ['8DF3F3A70023494C89453D51B78C79CC', '349557D0-1E3F-4353-A13B-C1E4D2FB2B22'];
      const expectedResult = {
        ungrouped: [componentsResult.ungrouped[0], componentsResult.ungrouped[2]],
        groups: componentsResult.groups,
      };

      apolloController.expectOne(GET_ALL_COMPONENTS).flush({
        data: { components: componentsResult },
      });
      designingServiceRenderingIds.next(allowedRenderingIds);
      tick();

      // Resent the same value
      designingServiceRenderingIds.next(allowedRenderingIds);
      tick();
      designingServiceRenderingIds.next(allowedRenderingIds);
      tick();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(expectedResult);
      flush();
    }));
  });

  describe('getPlaceholderAllowedComponents', () => {
    it('should return only allowed ungrouped renderings', fakeAsync(() => {
      let value: ComponentsResult | undefined;
      const allComponents: ComponentInfo[] = [
        { displayName: 'c1', iconUrl: 'u1', id: '8df3f3a7-0023-494c-8945-3d51b78c79cc', category: 'q1' },
        { displayName: 'c2', iconUrl: 'u2', id: '633F68C5-E944-4D93-8CED-4638B910DE21', category: 'q1' },
        { displayName: 'c3', iconUrl: 'u3', id: '349557d0-1e3f-4353-a13b-c1e4d2fb2b22', category: 'q1' },
      ];
      const componentsResult: ComponentsResult = {
        ungrouped: allComponents,
        groups: [],
      };
      const placeholderAllowedRenderingIds = [
        '8DF3F3A70023494C89453D51B78C79CC',
        '349557D0-1E3F-4353-A13B-C1E4D2FB2B22',
      ];
      const expectedResult = {
        ungrouped: [componentsResult.ungrouped[0], componentsResult.ungrouped[2]],
        groups: componentsResult.groups,
      };

      sut.getPlaceholderAllowedComponents(placeholderAllowedRenderingIds).subscribe((val) => (value = val));
      apolloController.expectOne(GET_ALL_COMPONENTS).flush({
        data: { components: componentsResult },
      });
      tick();

      expect(value).toEqual(expectedResult);
      flush();
    }));

    it('should return only allowed rendering groups', fakeAsync(() => {
      let value: ComponentsResult | undefined;
      const componentsResult: ComponentsResult = {
        ungrouped: [],
        groups: [
          {
            title: 'first',
            components: [
              { displayName: 'c1', iconUrl: 'u1', id: '8df3f3a7-0023-494c-8945-3d51b78c79cc', category: 'first' },
              { displayName: 'c2', iconUrl: 'u2', id: '633F68C5-E944-4D93-8CED-4638B910DE21', category: 'first' },
            ],
          },
          {
            title: 'second',
            components: [
              { displayName: 'c4', iconUrl: 'u4', id: '8b760fa3-1067-4bf8-ad16-09bc1b00007d', category: 'second' },
              { displayName: 'c3', iconUrl: 'u3', id: '349557d0-1e3f-4353-a13b-c1e4d2fb2b22', category: 'second' },
            ],
          },
        ],
      };
      const placeholderAllowedRenderingIds = [
        '8DF3F3A70023494C89453D51B78C79CC',
        '349557D0-1E3F-4353-A13B-C1E4D2FB2B22',
        '8B760FA3-1067-4BF8-AD16-09BC1B00007D',
      ];
      const expectedResult = {
        ungrouped: componentsResult.ungrouped,
        groups: [
          {
            title: componentsResult.groups[0].title,
            components: [componentsResult.groups[0].components[0]],
          },
          {
            title: componentsResult.groups[1].title,
            components: [componentsResult.groups[1].components[0], componentsResult.groups[1].components[1]],
          },
        ],
      };

      sut.getPlaceholderAllowedComponents(placeholderAllowedRenderingIds).subscribe((val) => (value = val));
      apolloController.expectOne(GET_ALL_COMPONENTS).flush({
        data: { components: componentsResult },
      });
      tick();

      expect(value).toEqual(expectedResult);
      flush();
    }));

    it('should exclude a rendering group of none of its rendering is in allowed list', fakeAsync(() => {
      let value: ComponentsResult | undefined;
      const componentsResult: ComponentsResult = {
        ungrouped: [],
        groups: [
          {
            title: 'first',
            components: [
              {
                displayName: 'c1',
                iconUrl: 'u1',
                id: '8df3f3a7-0023-494c-8945-3d51b78c79cc',
                category: 'first',
                componentName: 'c1',
              },
              {
                displayName: 'c2',
                iconUrl: 'u2',
                id: '633F68C5-E944-4D93-8CED-4638B910DE21',
                category: 'first',
                componentName: 'c2',
              },
            ],
          },
          {
            title: 'second',
            components: [
              {
                displayName: 'c4',
                iconUrl: 'u4',
                id: '8b760fa3-1067-4bf8-ad16-09bc1b00007d',
                category: 'second',
                componentName: 'c4',
              },
              {
                displayName: 'c3',
                iconUrl: 'u3',
                id: '349557d0-1e3f-4353-a13b-c1e4d2fb2b22',
                category: 'second',
                componentName: 'c3',
              },
            ],
          },
        ],
      };
      const placeholderAllowedRenderingIds = [
        '349557D0-1E3F-4353-A13B-C1E4D2FB2B22',
        '8B760FA3-1067-4BF8-AD16-09BC1B00007D',
      ];
      const expectedResult = {
        ungrouped: componentsResult.ungrouped,
        groups: [
          {
            title: componentsResult.groups[1].title,
            components: [componentsResult.groups[1].components[0], componentsResult.groups[1].components[1]],
          },
        ],
      };

      sut.getPlaceholderAllowedComponents(placeholderAllowedRenderingIds).subscribe((val) => (value = val));
      apolloController.expectOne(GET_ALL_COMPONENTS).flush({
        data: { components: componentsResult },
      });
      tick();

      expect(value).toEqual(expectedResult);
      flush();
    }));
  });
});
