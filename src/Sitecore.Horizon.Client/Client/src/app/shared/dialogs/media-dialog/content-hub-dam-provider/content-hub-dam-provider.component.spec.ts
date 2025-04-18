/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { nextTick, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ContentHubDamDALService } from './content-hub-dam-ext.dal.service';
import { ContentHubDamProviderComponent } from './content-hub-dam-provider.component';

const TEST_AUTH_DETAILS = {
  m_instance: 'mInstance',
  search_page: 'searchPage',
  external_redirect_key: 'externalRedirectKey',
};

const TEST_CURRENT_SITE_ID = { site_id: 'site_id' };

const TEST_CONTENT_DETAILS = new Response();
TEST_CONTENT_DETAILS.headers.set('content-type', 'format/jpg');
TEST_CONTENT_DETAILS.headers.set('content-disposition', 'filename="file name"');

const TEST_WINDOW_MESSAGE = {
  alt: 'alt',
  alternative: 'alternative',
  public_link: 'public_link',
  selected_asset_id: 'selected_asset_id',
  height: '100',
  width: '200',
};

const TEST_SRC = 'https://hzbox2.sitecoresandbox.cloud/api/public/content/cb3d8fc011cd46898171e29e64af619b?v=0434b990';
const TEST_ALT = 'small-image.jpg';
const TEST_WIDTH = 400;
const TEST_HEIGHT = 300;
const TEST_DAM_PROPERTIES = [
  { name: 'dam-id', value: 'WFr8p-TAQsukQOePjzpaXQ' },
  { name: 'dam-content-type', value: 'Image' },
];
const TEST_DAM_ATTRIBUTES = TEST_DAM_PROPERTIES.map((x) => `${x.name}="${x.value}"`).join(' ');

const TEST_RAWFIELD_RESPONSE = `<image src="${TEST_SRC}" alt="${TEST_ALT}" width="${TEST_WIDTH}" height="${TEST_HEIGHT}" ${TEST_DAM_ATTRIBUTES} />`;
const TEST_EMBEDEDHTML_RESPONSE = `<image src="${TEST_SRC}" alt="${TEST_ALT}" width="${TEST_WIDTH}" height="${TEST_HEIGHT}" ${TEST_DAM_ATTRIBUTES} />`;

describe(ContentHubDamProviderComponent.name, () => {
  let sut: ContentHubDamProviderComponent;
  let fixture: ComponentFixture<ContentHubDamProviderComponent>;

  let dalService: jasmine.SpyObj<ContentHubDamDALService>;

  let mediaSelectSpy: jasmine.Spy;

  const getIframe = () => fixture.debugElement.nativeElement.querySelector('iframe');
  const getFallbackMessage = () => fixture.debugElement.nativeElement.querySelector('p')?.textContent;

  const runOnInit = async () => {
    await sut.ngOnInit();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentHubDamProviderComponent],
      imports: [TranslateServiceStubModule, TranslateModule],
      providers: [
        {
          provide: ContentHubDamDALService,
          useValue: jasmine.createSpyObj<ContentHubDamDALService>({
            getAuthenticationDetails: Promise.resolve(TEST_AUTH_DETAILS),
            getCurrentSiteId: Promise.resolve(TEST_CURRENT_SITE_ID),
            getContentDetails: Promise.resolve(TEST_CONTENT_DETAILS),
            mapDamPropsToXmcAttributes: Promise.resolve(TEST_RAWFIELD_RESPONSE),
            getEmbeddedHtml: Promise.resolve(TEST_EMBEDEDHTML_RESPONSE),
            getRawFieldWithMappedAttributes: Promise.resolve(TEST_RAWFIELD_RESPONSE),
          }),
        },
      ],
    }).compileComponents();

    dalService = TestBedInjectSpy(ContentHubDamDALService);

    dalService.getRawFieldWithMappedAttributes.and.returnValue(
      Promise.resolve(
        `<image src="${TEST_SRC}" alt="${TEST_ALT}" width="${TEST_WIDTH}" height="${TEST_HEIGHT}" ${TEST_DAM_ATTRIBUTES} />`,
      ),
    );
    fixture = TestBed.createComponent(ContentHubDamProviderComponent);
    sut = fixture.componentInstance;

    mediaSelectSpy = jasmine.createSpy('media select');
    sut.mediaSelect.subscribe(mediaSelectSpy);
  });

  it('should create', async () => {
    await runOnInit();

    expect(sut).toBeTruthy();
  });

  it('should create iframe with a correct source', async () => {
    await runOnInit();

    const url = new URL(getIframe().src);
    const params = url.searchParams;

    expect(url.pathname).toBe('/searchPage');
    expect(params.get('externalRedirectKey')).toBe(TEST_AUTH_DETAILS.external_redirect_key);
    expect(params.get('externalRedirectUrl')).toContain(window.location.host + window.location.pathname);
    expect(params.get('id')).toBe(TEST_CURRENT_SITE_ID.site_id);
  });

  describe('cannot show iframe', () => {
    describe('WHEN cannot get authDetails', () => {
      it('should show appropriate error message and not show iFrame', async () => {
        dalService.getAuthenticationDetails.and.returnValue(Promise.reject());

        await runOnInit();

        expect(getIframe()).toBeFalsy();
        expect(getFallbackMessage()).toBe('DAM.CANNOT_LOAD_IFRAME_TEXT');
      });
    });

    describe('WHEN cannot get currentSiteId', () => {
      it('should show appropriate error message and not show iFrame', async () => {
        dalService.getCurrentSiteId.and.returnValue(Promise.reject());

        await runOnInit();

        expect(getIframe()).toBeFalsy();
        expect(getFallbackMessage()).toBe('DAM.CANNOT_LOAD_IFRAME_TEXT');
      });
    });
  });

  describe('handle "window" messages from iframe', () => {
    it('should subscribe to window messages', async () => {
      await runOnInit();

      window.postMessage(TEST_WINDOW_MESSAGE, '*');
      const result = {
        rawValue: `<image src="${TEST_SRC}" alt="${TEST_ALT}" width="${TEST_WIDTH}" height="${TEST_HEIGHT}" ${TEST_DAM_ATTRIBUTES} />`,
        alt: TEST_ALT,
        src: TEST_WINDOW_MESSAGE.public_link,
        height: TEST_HEIGHT,
        width: TEST_WIDTH,
        embeddedHtml: TEST_EMBEDEDHTML_RESPONSE,
        damExtraProperties: jasmine.arrayContaining(TEST_DAM_PROPERTIES),
        isDam: true,
      };

      await nextTick();
      expect(mediaSelectSpy).toHaveBeenCalledWith(result);
    });

    describe('WHEN content type is Image', () => {
      it('should emit source parameter', async () => {
        const contentDetainsImage = new Response();
        contentDetainsImage.headers.set('content-type', 'image/jpg');
        dalService.getContentDetails.and.returnValue(Promise.resolve(contentDetainsImage));

        await runOnInit();

        window.postMessage(TEST_WINDOW_MESSAGE, '*');

        await nextTick();
        expect(mediaSelectSpy.calls.mostRecent().args[0].src).toBe(TEST_WINDOW_MESSAGE.public_link);
      });
    });

    describe('WHEN content type is Video', () => {
      it('should emit source parameter', async () => {
        const contentDetainsImage = new Response();
        contentDetainsImage.headers.set('content-type', 'video/jpg');
        dalService.getContentDetails.and.returnValue(Promise.resolve(contentDetainsImage));

        await runOnInit();

        window.postMessage(TEST_WINDOW_MESSAGE, '*');

        await nextTick();
        expect(mediaSelectSpy.calls.mostRecent().args[0].src).toBe(TEST_WINDOW_MESSAGE.public_link);
      });
    });

    describe('WHEN content type is Other', () => {
      it('should emit source parameter', async () => {
        const contentDetainsImage = new Response();
        contentDetainsImage.headers.set('content-type', 'file/jpg');
        dalService.getContentDetails.and.returnValue(Promise.resolve(contentDetainsImage));

        await runOnInit();

        window.postMessage(TEST_WINDOW_MESSAGE, '*');

        await nextTick();
        expect(mediaSelectSpy.calls.mostRecent().args[0].src).toBe(TEST_WINDOW_MESSAGE.public_link);
      });
    });
  });

  it('should remove event listener for window message when component destroys', async () => {
    await runOnInit();

    sut.ngOnDestroy();
    fixture.detectChanges();

    window.postMessage(TEST_WINDOW_MESSAGE, '*');

    await nextTick();
    expect(mediaSelectSpy).toHaveBeenCalled();
  });
});
