/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';

import { adminPermissions } from 'app/page-design/shared/page-templates-test-data';
import { AssignPageDesignDialogComponent } from './assign-page-design-dialog.component';
import { AssignPageDesignDialogService } from './assign-page-design-dialog.service';

describe(AssignPageDesignDialogService.name, () => {
  let sut: AssignPageDesignDialogService;
  let dialogOverlayServiceSpy: jasmine.SpyObj<DialogOverlayService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DialogOverlayService,
          useValue: jasmine.createSpyObj<DialogOverlayService>(['open']),
        },
      ],
    });
    dialogOverlayServiceSpy = TestBedInjectSpy(DialogOverlayService);
    sut = TestBed.inject(AssignPageDesignDialogService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('show()', () => {
    it('should call open() of given service', () => {
      // arrange
      dialogOverlayServiceSpy.open.and.returnValue({ component: {} } as any);

      const tenantTemplates = [
        {
          template: { templateId: 'test-template', name: 'Test Template', access: adminPermissions },
          pageDesign: {
            path: '/path/to/page-design2',
            displayName: 'page design 2',
            itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
            name: 'page design 2',
            version: 1,
            hasChildren: false,
            thumbnailUrl: 'thumbnail-url',
            hasPresentation: true,
            isFolder: false,
            createdDate: '20230428T111641Z',
            updatedDate: '20230429T111641Z',
            children: undefined,
            access: adminPermissions,
          },
        },
      ];

      // act
      sut.show('test-template', tenantTemplates, 'test-desginId');

      // assert
      expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
    });

    it('should set AssignPageDesignDialogComponent props value as returned by the service.open()', () => {
      // arrange
      const designId = 'designId';
      const templateId = 'templateId';
      const componentObj: Partial<AssignPageDesignDialogComponent> = {
        templateId,
        alreadyAssignedDesignId: designId,
      };
      const tenantTemplates = [
        {
          template: { templateId: 'test-template', name: 'Test Template', access: adminPermissions },
          pageDesign: {
            path: '/path/to/page-design2',
            displayName: 'page design 2',
            itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
            name: 'page design 2',
            version: 1,
            hasChildren: false,
            thumbnailUrl: 'thumbnail-url',
            hasPresentation: true,
            isFolder: false,
            createdDate: '20230428T111641Z',
            updatedDate: '20230429T111641Z',
            children: undefined,
            access: adminPermissions,
          },
        },
      ];

      dialogOverlayServiceSpy.open.and.returnValue({ component: componentObj } as any);

      // act
      sut.show(templateId, tenantTemplates, designId);

      // assert
      expect(componentObj.alreadyAssignedDesignId).toEqual(designId);
      expect(componentObj.templateId).toEqual(templateId);
      expect(componentObj.tenantPageTemplates).toEqual(tenantTemplates);
    });
  });
});
