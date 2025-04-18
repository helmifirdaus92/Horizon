// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics.DataModels;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics;

[JsonObject(ItemNullValueHandling = NullValueHandling.Ignore)]
public class AnalyticsData
{
    public SingleStat sessionCount { get; set; }
    public SingleStat pageVariantViewBySessionRatio { get; set; }
    public SingleStat pageVariantViewCount { get; set; }
    public HeatMap pageVariantHeatmap { get; set; }
    public TimeSeries pageVariantViewTimeseries { get; set; }
    public Histogram pageVariantByOperatingSystemHist { get; set; }
    public Histogram pageVariantByCountryHist { get; set; }
    public Histogram pageVariantByDeviceHist { get; set; }
}
