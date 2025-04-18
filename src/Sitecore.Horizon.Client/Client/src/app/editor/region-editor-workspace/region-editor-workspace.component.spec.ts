/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Data } from '@angular/router';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { SitecoreRegionComponent } from 'app/extensibility/sitecore-region.component';
import { ReplaySubject } from 'rxjs';
import { RegionEditorWorkspaceComponent } from './region-editor-workspace.component';

describe('RegionEditorWorkspaceComponent', () => {
  let sut: RegionEditorWorkspaceComponent;
  let fixture: ComponentFixture<RegionEditorWorkspaceComponent>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let routeData: ReplaySubject<Data>;
  let region: any;

  beforeEach(() => {
    routeData = new ReplaySubject<Data>(1);
    activatedRoute = jasmine.createSpyObj<ActivatedRoute>('Activated route', [], {
      data: routeData,
    });

    TestBed.configureTestingModule({
      imports: [SitecoreExtensibilityModule],
      declarations: [RegionEditorWorkspaceComponent],
      providers: [{ provide: ActivatedRoute, useValue: activatedRoute }],
    });

    fixture = TestBed.createComponent(RegionEditorWorkspaceComponent);
    sut = fixture.componentInstance;
    region = fixture.debugElement.query(By.directive(SitecoreRegionComponent)).componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should filter by state parameter', () => {
    // arrange
    const extensionContext: any = {
      parameters: {
        state: 'some state',
      },
    };

    // act
    const filterResult = sut.filterBound(extensionContext, 'some state');

    // assert
    expect(filterResult).toBeTrue();
  });

  it('should set filterFn to the region filter', () => {
    expect(region.filterFn).toBe(sut.filterBound);
  });

  it('should set a data.state to the region input, when new route data is emitted', () => {
    routeData.next({ state: 'some' });
    fixture.detectChanges();
    expect(region.input).toBe('some');
  });
});
