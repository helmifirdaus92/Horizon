/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule, IconButtonModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { BXComponentGoals, BXComponentVariant } from 'app/pages/left-hand-side/personalization/personalization.types';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { TreeNode } from 'app/shared/item-tree/item-tree.component';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { getFlowDefinition, mockComponentFlowDefinition } from '../ab-test-component.utils';
import { GoalSettingComponent } from './goal-setting.component';

@Component({
  selector: 'app-page-picker',
  template: '',
})
class PagePickerStubComponent {
  @Output() selectItem = new EventEmitter<TreeNode>();
}
@Component({
  selector: 'app-content-tree-search',
  template: '',
})
class ContentTreeSearchStubComponent {
  @Output() selectItem = new EventEmitter<TreeNode>();
}

describe(GoalSettingComponent.name, () => {
  let sut: GoalSettingComponent;
  let fixture: ComponentFixture<GoalSettingComponent>;
  let contextService: ContextServiceTesting;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;
  let canvasServicesSpy: jasmine.SpyObj<CanvasServices>;

  const pageParametersList = () => fixture.debugElement.queryAll(By.css('app-tag'));
  const radioInputButtons = () => fixture.debugElement.queryAll(By.css('input[type="radio"]'));
  const pagePicker = () => fixture.debugElement.query(By.directive(PagePickerStubComponent));
  const contentTreeSearch = () => fixture.debugElement.query(By.directive(ContentTreeSearchStubComponent));
  const searchIconButton = () => fixture.debugElement.query(By.css('ng-spd-accordion-content button')).nativeElement;
  const goalsContainerEl = () => fixture.debugElement.queryAll(By.css('.goal'));

  const mockTraffic: any = {
    type: 'simpleTraffic',
    weightingAlgorithm: 'USER_DEFINED',
    modifiedAt: undefined,
    allocation: 100,
    splits: [{ ref: 'control', split: 100 }],
    coupled: false,
  };

  const mockVariants: BXComponentVariant[] = [{ ref: 'test', name: 'testVariant', isControl: false, tasks: [] }];

  const layoutObj = {
    findRendering: () => {
      return {
        dataSource: 'testDs002',
      };
    },
  };

  beforeEach(waitForAsync(() => {
    featureFlagsServiceSpy = jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']);
    canvasServicesSpy = jasmine.createSpyObj<CanvasServices>(['getCurrentLayout']);

    TestBed.configureTestingModule({
      imports: [
        ContextServiceTestingModule,
        CommonModule,
        FormsModule,
        TranslateModule,
        TranslateServiceStubModule,
        AccordionModule,
        IconButtonModule,
        InputLabelModule,
      ],
      providers: [
        { provide: FeatureFlagsService, useValue: featureFlagsServiceSpy },
        { provide: CanvasServices, useValue: canvasServicesSpy },
      ],
      declarations: [GoalSettingComponent, PagePickerStubComponent, ContentTreeSearchStubComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalSettingComponent);
    sut = fixture.componentInstance;

    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);
    canvasServicesSpy.getCurrentLayout.and.returnValue(layoutObj as any);

    contextService = TestBedInjectSpy(ContextServiceTesting);
    contextService.provideDefaultTestContext();

    spyOn(contextService, 'getItem').and.resolveTo({ id: 'id1', name: 'page001' } as any);

    sut.internalFlowDefinition = mockComponentFlowDefinition;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should render pageParameters value if test has goals configured ', () => {
    // Arrange
    sut.internalFlowDefinition = getFlowDefinition();
    fixture.detectChanges();

    // Act
    sut.ngOnInit();
    fixture.detectChanges();

    // Assert
    expect(goalsContainerEl().length).toBe(1);
    expect(goalsContainerEl()[0].nativeElement.textContent).toContain('test1');
  });

  it('should render page target accordion if pageViewGoal is selected', () => {
    // Arrange
    radioInputButtons()[0].nativeElement.click();
    fixture.detectChanges();

    const accordionEl = fixture.debugElement.query(By.css('ng-spd-accordion'));

    // Assert
    expect(accordionEl).toBeTruthy();
  });

  it('should not render page target accordion if bouncesGoal is selected', () => {
    // Arrange
    radioInputButtons()[1].nativeElement.click();
    fixture.detectChanges();

    const accordionEl = fixture.debugElement.query(By.css('ng-spd-accordion'));

    // Assert
    expect(accordionEl).toBeFalsy();
  });

  describe('ngOnInit', () => {
    it('should not reflect page parameters in template if initial setting is bouncesGoal or exitsGoal', () => {
      // Arrange
      const testGoals: BXComponentGoals = {
        primary: {
          type: 'bouncesGoal',
          name: '',
          friendlyId: '',
          ref: '',
          description: '',
          goalCalculation: {
            type: 'binary',
            calculation: 'INCREASE',
            target: 'conversionPerSession',
          },
          pageParameters: [
            {
              matchCondition: 'Equals',
              parameterString: '',
            },
          ],
        },
      };
      const testFlowDefinition = {
        ...mockComponentFlowDefinition,
        goals: testGoals,
      };

      // Act
      sut.internalFlowDefinition = testFlowDefinition;
      sut.ngOnInit();
      fixture.detectChanges();

      radioInputButtons()[0].nativeElement.click();

      // Assert
      expect(pageParametersList().length).toBe(0);
    });

    it('should reflect page parameters in template if initial setting is pageViewGoal', () => {
      // Arrange
      const testGoals: BXComponentGoals = {
        primary: {
          type: 'pageViewGoal',
          name: '',
          friendlyId: '',
          ref: '',
          description: '',
          goalCalculation: {
            type: 'binary',
            calculation: 'INCREASE',
            target: 'conversionPerSession',
          },
          pageParameters: [
            {
              matchCondition: 'Equals',
              parameterString: 'test',
            },
          ],
        },
      };
      const testFlowDefinition = {
        ...mockComponentFlowDefinition,
        goals: testGoals,
      };

      // Act
      sut.internalFlowDefinition = testFlowDefinition;
      sut.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(pageParametersList().length).toBe(1);
    });
  });

  describe('addBouncesGoal', () => {
    it('should emit bouncesGoalChange event', () => {
      // Arrange
      const emitSpy = spyOn(sut.bouncesGoalChange, 'emit');

      radioInputButtons()[1].nativeElement.click();

      // Assert
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should emit bouncesGoalChange event with correct parameters', async () => {
      // Arrange
      const emitSpy = spyOn(sut.bouncesGoalChange, 'emit');
      sut.ngOnInit();
      await fixture.whenStable();

      radioInputButtons()[1].nativeElement.click();

      // Assert
      expect(emitSpy).toHaveBeenCalledWith({
        primary: {
          type: 'bouncesGoal',
          name: 'bounces_goal',
          friendlyId: 'friendly_id_bounces_goal',
          ref: '',
          description: '',
          goalCalculation: {
            type: 'binary',
            calculation: 'DECREASE',
            target: 'conversionPerSession',
          },
          pageParameters: [{ matchCondition: 'Equals', parameterString: 'page001' }],
          eventType: undefined,
        },
      });
    });
  });

  describe('addExitGoal', () => {
    it('should emit exitsGoalsChange event', () => {
      // Arrange
      const emitSpy = spyOn(sut.exitsGoalsChange, 'emit');

      // Act
      radioInputButtons()[2].nativeElement.click();

      // Assert
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should emit exitsGoalsChange event with correct parameters', async () => {
      // Arrange
      const emitSpy = spyOn(sut.exitsGoalsChange, 'emit');

      // Act
      sut.ngOnInit();
      await fixture.whenStable();

      radioInputButtons()[2].nativeElement.click();

      // Assert
      expect(emitSpy).toHaveBeenCalledWith({
        primary: {
          type: 'exitsGoal',
          name: 'exits_goal',
          friendlyId: 'friendly_id_exits_goal',
          ref: '',
          description: '',
          goalCalculation: {
            type: 'binary',
            calculation: 'DECREASE',
            target: 'conversionPerSession',
          },
          pageParameters: [{ matchCondition: 'Equals', parameterString: 'page001' }],
          eventType: undefined,
        },
      });
    });
  });

  describe('addPageViewGoal', () => {
    it('should emit pageViewGoalChange event', () => {
      // Arrange
      const emitSpy = spyOn(sut.pageViewGoalsChange, 'emit');

      radioInputButtons()[0].nativeElement.click();

      // Assert
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should emit pageViewGoalChange event with correct type if no target is selected', async () => {
      // Arrange
      const emitSpy = spyOn(sut.pageViewGoalsChange, 'emit');

      radioInputButtons()[0].nativeElement.click();

      // Assert
      expect(emitSpy).toHaveBeenCalledWith({
        primary: {
          type: 'pageViewGoal',
          name: '',
          friendlyId: '',
          ref: '',
          description: '',
          goalCalculation: {
            type: 'binary',
            calculation: 'INCREASE',
            target: 'conversionPerSession',
          },
          pageParameters: [],
          eventType: undefined,
        },
      });
    });

    it('should emit pageViewGoalChange event with correct type and target page if page is selected', async () => {
      // Arrange
      const emitSpy = spyOn(sut.pageViewGoalsChange, 'emit');
      sut.renderPagesPicker = true;
      radioInputButtons()[0].nativeElement.click();
      fixture.detectChanges();

      // Act
      const pagePickerComponentInstance = pagePicker().componentInstance;
      const testNode: TreeNode = {
        id: 'test1',
        displayName: 'test1',
        hasChildren: false,
        children: [],
        isFolder: false,
        isSelectable: false,
      };
      pagePickerComponentInstance.selectItem.emit(testNode);
      await fixture.whenStable();

      // Assert
      expect(emitSpy).toHaveBeenCalledWith({
        primary: {
          type: 'pageViewGoal',
          name: '',
          friendlyId: '',
          ref: '',
          description: '',
          goalCalculation: {
            type: 'binary',
            calculation: 'INCREASE',
            target: 'conversionPerSession',
          },
          pageParameters: [{ matchCondition: 'Equals', parameterString: 'test1' }],
          eventType: undefined,
        },
      });
    });

    it('should show placeholder text when there are no goals are configured', () => {
      // Arrange
      const pageParameters = [] as any;

      // Act
      sut.internalFlowDefinition = getFlowDefinition(mockTraffic, mockVariants, pageParameters);
      fixture.detectChanges();

      const placeholderEl = fixture.debugElement.query(By.css('.goals-container span'));

      // Assert
      expect(placeholderEl.nativeElement.textContent).toContain('COMPONENT_TESTING.CONFIGURE.SELECT_PAGES');
    });

    it('should render page picker when renderPagesPicker is enabled', () => {
      // Arrange
      sut.renderPagesPicker = true;
      fixture.detectChanges();

      // Assert
      expect(pagePicker().componentInstance).toBeTruthy();
    });

    it('should hide page picker when search is enabled', () => {
      //Act
      searchIconButton().click();
      fixture.detectChanges();

      // Assert
      expect(pagePicker()).toBeNull();
    });

    it('should render content tree search component when search icon is clicked', () => {
      // Act
      searchIconButton().click();
      fixture.detectChanges();

      // Assert
      expect(contentTreeSearch().componentInstance).toBeTruthy();
    });

    it('should emit selectItem event on selectItem emit from content tree search component', async () => {
      // Arrange
      const emitSpy = spyOn(sut.pageViewGoalsChange, 'emit');

      searchIconButton().click();
      fixture.detectChanges();

      const contentTreeSearchComponentInstance = contentTreeSearch().componentInstance;

      const testNode: TreeNode = {
        id: 'test1',
        displayName: 'home',
        hasChildren: false,
        children: [],
        isFolder: false,
        isSelectable: false,
      };

      // Act
      contentTreeSearchComponentInstance.selectItem.emit(testNode);
      await fixture.whenStable();

      // Assert
      expect(sut.componentFlowDefinition.goals.primary.pageParameters.length).toEqual(1);
      expect(emitSpy).toHaveBeenCalledWith({
        primary: {
          type: 'pageViewGoal',
          name: '',
          friendlyId: '',
          ref: '',
          description: '',
          goalCalculation: {
            type: 'binary',
            calculation: 'INCREASE',
            target: 'conversionPerSession',
          },
          pageParameters: [{ matchCondition: 'Equals', parameterString: 'home' }],
          eventType: undefined,
        },
      });
    });
  });

  describe('removeTargetPage', () => {
    it('should remove target page from pageParameters', () => {
      // Arrange
      const emitSpy = spyOn(sut.removeGoal, 'emit');
      const pageParameters = [
        { matchCondition: 'Equals', parameterString: 'test1' },
        { matchCondition: 'Equals', parameterString: 'test2' },
      ];
      sut.internalFlowDefinition = getFlowDefinition(mockTraffic, mockVariants, pageParameters);
      fixture.detectChanges();

      // Act
      sut.removeTargetPage('test1');
      fixture.detectChanges();

      // Assert
      expect(goalsContainerEl().length).toBe(1);
      expect(goalsContainerEl()[0].nativeElement.textContent).toContain('test2');
      expect(emitSpy).toHaveBeenCalledWith([{ matchCondition: 'Equals', parameterString: 'test2' }]);
    });
  });
});
