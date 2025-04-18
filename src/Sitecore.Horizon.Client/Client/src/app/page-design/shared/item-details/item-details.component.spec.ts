/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { CmUrlTestingModule } from 'app/shared/pipes/platform-url/cm-url.module.testing';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ItemDetailsComponent } from './item-details.component';

describe(ItemDetailsComponent.name, () => {
  let sut: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let pageTemplatesService: jasmine.SpyObj<PageTemplatesService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent],
      imports: [TranslateServiceStubModule, TranslateModule, CmUrlTestingModule],
      providers: [
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>(['getTemplateUsageCount']),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    pageTemplatesService = TestBedInjectSpy(PageTemplatesService);
    fixture = TestBed.createComponent(ItemDetailsComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should render empty-state when no item or template is provided', () => {
    fixture.detectChanges();
    const selectDefaultElement = fixture.debugElement.query(By.css('.select-default'));
    expect(selectDefaultElement).toBeTruthy();
  });

  it('should render details when item is provided', () => {
    sut.createdDate = new Date('2023-01-01T00:00:00').toISOString();
    sut.updatedDate = new Date('2023-01-01T00:00:00').toISOString();
    sut.displayName = 'Test Item';
    sut.thumbanailAltText = 'Test Item';
    sut.fallbackIcon = 'mdi-view-compact-outline';
    sut.thumbnailUrl = 'testUrl';
    sut.templateUsedByPagesCount = 10;

    fixture.detectChanges();

    const detailsElement = fixture.debugElement.query(By.css('.details'));
    const thumbnailElement = fixture.debugElement.query(By.css('.thumbnail-image'));
    const createdDateElement = fixture.debugElement.query(By.css('.details-heading'));

    expect(detailsElement).toBeTruthy();
    expect(thumbnailElement).toBeTruthy();
    expect(createdDateElement).toBeTruthy();
  });
});
