/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { LayoutDataParseService } from './layout-data-parse.service';
import { LayoutServiceData } from './layout-service-models';

const layoutExample = {
  sitecore: {
    route: {
      fields: {
        Content: {
          value: '',
          editable: `<input class="scFieldValue" value="value 001"/><span class="scChromeData">{"commands":[],"contextItemUri":null,"custom":{"fieldId":"9fadc7cd-174f-4f25-abd3-4f485e96daf2","fieldType":"Rich Text","rawValue":"value 001", "containsStandardValue":false,"contextItem":{"id":"49b43054-6657-4cf6-ba9e-20f5becadc18","version":1,"language":"en","revision":"f5b9f23cc58f49ca86d07ac445ee2e4f"}},"displayName":"Content","expandedDisplayName":null}</span><span>[No text in field]</span>`,
        },
      },
      placeholders: {
        'headless-header': [
          {
            attributes: {
              chrometype: 'placeholder',
              kind: 'open',
            },
            contents: '{"ph1":"v1"}',
            name: 'code',
          },
          {
            attributes: {
              chrometype: 'rendering',
              kind: 'open',
            },
            contents: '{"r1":"v1", "custom": { "renderingInstanceId": "{2497316F-D9B1-4E48-BA54-B0ACE61F6345}" }}',
            name: 'code',
          },
          {
            uid: '2497316f-d9b1-4e48-ba54-b0ace61f6345',
            componentName: 'PartialDesignDynamicPlaceholder',
            dataSource: '',
            field: {
              content: {
                nonfield: 'value',
              },
            },
            placeholders: {
              'sxa-header': [
                {
                  attributes: {
                    chrometype: 'placeholder',
                    kind: 'open',
                  },
                  contents: '{"ph2":"v2"}',
                  name: 'code',
                },
                {
                  attributes: {
                    chrometype: 'rendering',
                    kind: 'open',
                  },
                  contents: '{"r2":"v2", "custom": {"renderingInstanceId": "{AD531E84-C405-4B03-A8B6-667330DDC85F}" }}',
                  name: 'code',
                },
                {
                  componentName: 'RichText',
                  dataSource: '/sitecore/content/site001/site001/Presentation/Partial Designs/Header/Data/Title',
                  uid: 'ad531e84-c405-4b03-a8b6-667330ddc85f',
                  fields: {
                    obj: {
                      inner: {
                        nonvalue: 'abcd',
                      },
                    },
                    foo: {
                      Title: {
                        value: 'test personalization',
                        editable:
                          '<input class="scFieldValue" value="test personalization"/><span class="scChromeData">{"commands":[],"contextItemUri":null,"custom":{"fieldId":"ae5c08d7-e0cd-4030-a3a4-c27487f39b82","fieldType":"Single-Line Text","containsStandardValue":false, "contextItem":{"id":"51575ebf-f8bf-4c23-8fe3-20052e63a6ba","version":1,"language":"da","revision":"6cc6e0a8d5544ae68b2c32579adc64fc"}},"displayName":"Title","expandedDisplayName":null}</span><span>test personalization</span>',
                      },
                    },
                    list: [
                      {
                        a: 'b',
                      },
                      {
                        value: '',
                        editableFirstPart: `<input class="scFieldValue" value=""/><code type="text/sitecore" scFieldType="general link" chromeType="field" kind="open">{"commands":[],"contextItemUri":null,"custom":{"fieldId":"ef24bed2-46ab-4d53-ad1a-1019935a4e89","fieldType":"General Link","containsStandardValue":false,"contextItem":{"id":"f804541e-c7fe-4e7c-9296-ce698292f6d4","version":3,"language":"en","revision":"2c7b28280c3443a5af2377167a5f272c"}},"displayName":"Link","expandedDisplayName":null}</code><span class='scTextWrapper'>[No text in field]</span>`,
                      },
                    ],
                  },
                },
                {
                  attributes: {
                    chrometype: 'rendering',
                    kind: 'close',
                  },
                  contents: '',
                  name: 'code',
                },
                {
                  attributes: {
                    chrometype: 'rendering',
                    kind: 'open',
                  },
                  contents:
                    '{"r3":"v3", "custom": { "renderingInstanceId": "{CE3B47D5-968A-41FF-90E6-84BC07A2AE32}" }}',
                  name: 'code',
                },
                {
                  componentName: 'Navigation',
                  dataSource: '',
                  uid: 'ce3b47d5-968a-41ff-90e6-84bc07a2ae32',
                  fields: {
                    nonEditable: {
                      Title: {
                        value: 'home title',
                      },
                    },
                    EditableField: {
                      value: '',
                      editable:
                        '<input class="scFieldValue" value=""/><span class="scChromeData">{"commands":[],"contextItemUri":null,"custom":{"fieldId":"729034fc-24f3-40b7-8fa4-fb49d7de20dd","fieldType":"Rich Text","containsStandardValue":false,"contextItem":{"id":"6839fbf8-5cc9-44b3-a36f-aadb68b11df0","version":1,"language":"en","revision":"589560975b85428496a7c7f704988eaf"}},"displayName":"Text","expandedDisplayName":null}</span><span>[No text in field]</span>',
                    },
                  },
                },
                {
                  attributes: {
                    chrometype: 'rendering',
                    kind: 'close',
                  },
                  contents: '',
                  name: 'code',
                },
                {
                  attributes: {
                    chrometype: 'placeholder',
                    kind: 'close',
                  },
                  contents: '',
                  name: 'code',
                },
              ],
              'sxa-footer': [
                {
                  componentName: 'ColumnSplitter',
                  dataSource: '',
                  uid: 'a4bc7c4b-aa3c-4310-885a-e987ac352609',
                  placeholders: {
                    'column-2-{*}': [
                      {
                        attributes: {
                          chrometype: 'placeholder',
                          kind: 'open',
                        },
                        contents: '{"ph3":"v3"}',
                        name: 'code',
                      },
                      {
                        attributes: {
                          chrometype: 'placeholder',
                          kind: 'close',
                        },
                        contents: '',
                        name: 'code',
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            attributes: {
              chrometype: 'rendering',
              kind: 'close',
            },
            contents: '',
            name: 'code',
          },
          {
            attributes: {
              chrometype: 'placeholder',
              kind: 'close',
            },
            contents: '',
            name: 'code',
          },
        ],
      },
    },
  },
};

describe('parseLayoutData', () => {
  it('should extract renderings from layout', () => {
    const service = new LayoutDataParseService();
    const editingData = service.parseLayoutData(layoutExample as unknown as LayoutServiceData);
    expect(editingData.renderings).toContain(
      jasmine.objectContaining({
        renderingUid: '2497316f-d9b1-4e48-ba54-b0ace61f6345',
        chromeData: { r1: 'v1', custom: { renderingInstanceId: '{2497316F-D9B1-4E48-BA54-B0ACE61F6345}' } },
      }),
    );

    expect(editingData.renderings).toContain(
      jasmine.objectContaining({
        renderingUid: 'ad531e84-c405-4b03-a8b6-667330ddc85f',
        chromeData: { r2: 'v2', custom: { renderingInstanceId: '{AD531E84-C405-4B03-A8B6-667330DDC85F}' } },
      }),
    );

    expect(editingData.renderings).toContain(
      jasmine.objectContaining({
        renderingUid: 'ce3b47d5-968a-41ff-90e6-84bc07a2ae32',
        chromeData: { r3: 'v3', custom: { renderingInstanceId: '{CE3B47D5-968A-41FF-90E6-84BC07A2AE32}' } },
      }),
    );

    expect(editingData.renderings.length).toBe(3);
  });

  it('should extract placeholders from layout', () => {
    const service = new LayoutDataParseService();
    const editingData = service.parseLayoutData(layoutExample as unknown as LayoutServiceData);

    expect(editingData.placeholders).toEqual([
      jasmine.objectContaining({
        placeholderName: 'headless-header',
        renderingUid: '00000000-0000-0000-0000-000000000000',
        chromeData: { ph1: 'v1' },
      }),
      jasmine.objectContaining({
        placeholderName: 'sxa-header',
        renderingUid: '2497316f-d9b1-4e48-ba54-b0ace61f6345',
        chromeData: { ph2: 'v2' },
      }),
      jasmine.objectContaining({
        placeholderName: 'column-2-{*}',
        renderingUid: 'a4bc7c4b-aa3c-4310-885a-e987ac352609',
        chromeData: { ph3: 'v3' },
      }),
    ]);
  });

  it('should extract editable fields', () => {
    const service = new LayoutDataParseService();
    const editingData = service.parseLayoutData(layoutExample as unknown as LayoutServiceData);
    expect(editingData.fields).toEqual([
      {
        fieldId: '9fadc7cd-174f-4f25-abd3-4f485e96daf2',
        itemId: '49b43054-6657-4cf6-ba9e-20f5becadc18',
        version: 1,
        language: 'en',
        rawValue: 'value 001',
        containsStandardValue: false,
      },
      {
        fieldId: 'ae5c08d7-e0cd-4030-a3a4-c27487f39b82',
        itemId: '51575ebf-f8bf-4c23-8fe3-20052e63a6ba',
        version: 1,
        language: 'da',
        rawValue: 'test personalization',
        containsStandardValue: false,
      },
      {
        fieldId: 'ef24bed2-46ab-4d53-ad1a-1019935a4e89',
        itemId: 'f804541e-c7fe-4e7c-9296-ce698292f6d4',
        version: 3,
        language: 'en',
        rawValue: '',
        containsStandardValue: false,
      },
      {
        fieldId: '729034fc-24f3-40b7-8fa4-fb49d7de20dd',
        itemId: '6839fbf8-5cc9-44b3-a36f-aadb68b11df0',
        version: 1,
        language: 'en',
        rawValue: '',
        containsStandardValue: false,
      },
    ]);
  });
});
