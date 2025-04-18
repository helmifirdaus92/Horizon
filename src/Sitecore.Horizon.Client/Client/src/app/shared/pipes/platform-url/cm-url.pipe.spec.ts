/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { nextTick } from 'app/testing/test.utils';
import { ConfigurationService } from '../../configuration/configuration.service';
import { CmUrlPipe } from './cm-url.pipe';

@Component({
  template: `<div [attr.data-result]="value | cmUrl"></div>`,
})
class TestComponent {
  @Input() value = '';
}

describe(CmUrlPipe.name, () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;

  const getResult = () => fixture.debugElement.query(By.css('div')).attributes['data-result']!;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [StaticConfigurationServiceStubModule],
      declarations: [TestComponent, CmUrlPipe],
    });

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;

    fixture.detectChanges();

    ConfigurationService.xmCloudTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'test-org',
      url: 'http://base.com',
      gqlEndpointUrl: 'http://base.com/graph',
      cdpEmbeddedTenantId: '123',
      customerEnvironmentType: 'prd',
      environmentId: '321',
      environmentName: 'prodev',
      projectId: '12',
      projectName: 'proj',
    };
  }));

  new Array<[string, string]>(
    ['/relative', 'http://base.com'],
    ['relative', 'http://base.com'],
    ['/relative', 'http://base.com/'],
  ).forEach(([url, baseUrl]) =>
    it(`['${url}', '${baseUrl}'] should correctly concatenate url`, async () => {
      // arrange
      const sut = new CmUrlPipe();

      // act
      const result = sut.transform(url);

      // assert
      expect(result).toBe('http://base.com/relative');
    }),
  );

  it('should return empty output for empty input', async () => {
    await nextTick();

    testComponent.value = '';
    fixture.detectChanges();

    expect(getResult()).toBe('');
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
  });
});
