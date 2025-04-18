/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { pactWith } from 'jest-pact';
import axios from 'axios';
import { like, eachLike, decimal } from '@pact-foundation/pact/src/dsl/matchers';

let cdpApiRelativeUrl = '/v2/realTimeAnalytics';

let providerName = 'sitecore.cdp.analytics.api';
let consumerName = 'sitecore.pages.analytics.api.client';
let outDir = 'generated-pacts';

pactWith({ 
  provider: providerName, 
  consumer: consumerName,
  dir: outDir
}, provider => {
    
  beforeEach(() => {
    provider.addInteraction({
      state: 'I have siteMetrics data',
      uponReceiving: 'request to siteMetrics endpoint',
      withRequest: {
        method: 'GET',
        path: cdpApiRelativeUrl + '/siteMetrics',
        query: { pointOfSale: 'sale', duration: '7d', timezoneOffset: '1.5' },
        headers: { Accept: 'application/json' }
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          "activeGuestCount": {
            "data": {
              "current": decimal(0.0),
              "historic": decimal(0.0)
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "SINGLESTAT"
            }
          },
          "activeGuestTimeseries": {
            "data": {
              "current": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "TIMESERIES"
            }
          },
          "activeSessionCount": {
            "data": {
              "current": decimal(0.0),
              "historic": decimal(0.0)
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "SINGLESTAT"
            }
          },
          "bouncedSessionCount": {
            "data": {
              "current": decimal(0.0),
              "historic": decimal(0.0)
            },
            "meta": {
              "unitType": "PERCENTAGE",
              "widgetType": "SINGLESTAT"
            }
          },
          "pageViewCount": {
            "data": {
              "current": decimal(0.0),
              "historic": decimal(0.0)
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "SINGLESTAT"
            }
          },
          "pageViewTimeseries": {
            "data": {
              "current": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "TIMESERIES"
            }
          },
          "sessionDurationAverage": {
            "data": {
              "current": decimal(0.0),
              "historic": decimal(0.0)
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "SINGLESTAT"
            }
          },
          "sessionHeatmap": {
            "data": {
              "current": eachLike({
                "name": like("00:00"),
                "series": [
                  {
                    "name": "Mon",
                    "value": decimal(0.0)
                  },
                  {
                    "name": "Tue",
                    "value": decimal(0.0)
                  },
                  {
                    "name": "Wed",
                    "value": decimal(0.0)
                  },
                  {
                    "name": "Thu",
                    "value": decimal(0.0)
                  },
                  {
                    "name": "Fri",
                    "value": decimal(0.0)
                  },
                  {
                    "name": "Sat",
                    "value": decimal(0.0)
                  },
                  {
                    "name": "Sun",
                    "value": decimal(0.0)
                  }
                ]
              }, { min: 24 })
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HEATMAP"
            }
          },
          "sessionTimeseries": {
            "data": {
              "current": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "TIMESERIES"
            }
          },
          "sessionsByCountryHist": {
            "data": {
              "current": [],
              "historic": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HISTOGRAM"
            }
          },
          "sessionsByDeviceHist": {
            "data": {
              "current": [],
              "historic": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HISTOGRAM"
            }
          },
          "sessionsByFirstPageHist": {
            "data": {
              "current": [],
              "historic": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HISTOGRAM"
            }
          },
          "sessionsByOperatingSystemHist": {
            "data": {
              "current": [],
              "historic": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HISTOGRAM"
            }
          },
          "sessionsByRefererHist": {
            "data": {
              "current": [],
              "historic": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HISTOGRAM"
            }
          },
          "viewsByPageHist": {
            "data": {
              "current": [],
              "historic": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HISTOGRAM"
            }
          }
        }
      }
    });
  });

  it('returns proper siteMetrics response', async () => {
    let response = await axios.request({
      method: 'GET',
      baseURL: provider.mockService.baseUrl,
      url: cdpApiRelativeUrl + '/siteMetrics?pointOfSale=sale&duration=7d&timezoneOffset=1.5',
      headers: { Accept: 'application/json' }
    }).then((response: any) => response.data);
    return response;
  });
});

pactWith({ 
  provider: providerName,
  consumer: consumerName,
  dir: outDir
}, provider => {
  beforeEach(() => {
    provider.addInteraction({
      state: 'I have defaultVariant pageMetrics data',
      uponReceiving: 'request to pageMetrics endpoint',
      withRequest: {
        method: 'GET',
        path: cdpApiRelativeUrl + '/pageMetrics',
        query: { pointOfSale: 'sale', duration: '7d', pageVariantId: 'default' },
        headers: { Accept: 'application/json' }
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          "pageVariantByCountryHist": {
            "data": {
              "current": [],
              "historic": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HISTOGRAM"
            }
          },
          "pageVariantByDeviceHist": {
            "data": {
              "current": [],
              "historic": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HISTOGRAM"
            }
          },
          "pageVariantByOperatingSystemHist": {
            "data": {
              "current": [],
              "historic": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HISTOGRAM"
            }
          },
          "pageVariantByRefererHist": {
            "data": {
              "current": [],
              "historic": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HISTOGRAM"
            }
          },
          "pageVariantHeatmap": {
            "data": {
              "current": eachLike({
                  "name": like("00:00"),
                  "series": [
                    {
                      "name": "Mon",
                      "value": decimal(0.0)
                    },
                    {
                      "name": "Tue",
                      "value": decimal(0.0)
                    },
                    {
                      "name": "Wed",
                      "value": decimal(0.0)
                    },
                    {
                      "name": "Thu",
                      "value": decimal(0.0)
                    },
                    {
                      "name": "Fri",
                      "value": decimal(0.0)
                    },
                    {
                      "name": "Sat",
                      "value": decimal(0.0)
                    },
                    {
                      "name": "Sun",
                      "value": decimal(0.0)
                    }
                  ]
                }, { min: 24 })
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HEATMAP"
            }
          },
          "pageVariantViewBySessionRatio": {
            "data": {
              "current": decimal(0.0),
              "historic": decimal(0.0)
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "SINGLESTAT"
            }
          },
          "pageVariantViewCount": {
            "data": {
              "current": decimal(0.0),
              "historic": decimal(0.0)
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "SINGLESTAT"
            }
          },
          "pageVariantViewTimeseries": {
            "data": {
              "current": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "TIMESERIES"
            }
          },
          "pageViewCountByPageVariantHist": {
            "data": {
              "current": [],
              "historic": []
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "HISTOGRAM"
            }
          },
          "sessionCount": {
            "data": {
              "current": decimal(0.0),
              "historic": decimal(0.0)
            },
            "meta": {
              "unitType": "QUANTITY",
              "widgetType": "SINGLESTAT"
            }
          }
        }
      }
    });
  });

  it('returns proper default variant pageAnalytics response', async () => {
    let response = await axios.request({
      method: 'GET',
      baseURL: provider.mockService.baseUrl,
      url: cdpApiRelativeUrl + '/pageMetrics?pointOfSale=sale&duration=7d&pageVariantId=default',
      headers: { Accept: 'application/json' }
    }).then((response: any) => response.data);
    return response;
  });
});